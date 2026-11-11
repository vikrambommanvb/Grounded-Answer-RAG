"""Grounded answer generation engine coordinating retrieval, temporal overlay, refusal, and citation validation."""
import re
import time
from typing import Optional, List
from app.api.schemas.chat import (
    QueryRequest,
    QueryResponse,
    ResponseStatus,
    RefusalCategory,
    RefusalDetails,
    CitationBadge
)
from app.api.schemas.retrieval import RetrievedClause
from app.temporal.extractor import extract_dates_from_query, parse_date_string
from app.temporal.models import DateContext, TemporalResolutionType
from app.temporal.resolver import temporal_resolver
from app.retrieval.retriever import retriever
from app.citations.validator import validate_citations
from app.generation.prompt_builder import build_grounded_prompt, SYSTEM_INSTRUCTION
from app.providers.factory import get_provider
from app.refusal.engine import refusal_engine
from app.database.models import get_clause_by_id
from app.core.logging import logger

SUPERVISORY_GATES = {
    "§2.3.2": "Mandatory Supervisory Referral: Applications for applicants under 18 must be referred to a supervisor before determination (§2.3.2).",
    "§5.5.2": "Mandatory Supervisory Referral: Cases with a household member subject to immigration public recourse prohibitions must be referred to a supervisor before determination (§5.5.2).",
    "§8.3.3": "Mandatory Supervisory Referral: Applications undetermined within 90 days must be referred to a supervisor (§8.3.3).",
    "§9.6.2": "Mandatory Supervisory Referral: Determinations of deliberate misrepresentation must be made by a supervisor based on recorded file evidence (§9.6.2).",
    "§10.2.3": "Mandatory Supervisory Referral: Suspensions continuing for 60 days without resolution must be referred to a supervisor (§10.2.3)."
}

class GroundedAnswerGenerator:
    """End-to-end engine producing grounded, traceable policy answers with responsible refusal."""
    
    def __init__(self):
        self.retriever = retriever
        self.temporal_resolver = temporal_resolver
        self.refusal_engine = refusal_engine

    def generate_answer(self, request: QueryRequest) -> QueryResponse:
        """Execute full grounding pipeline for a query."""
        start_time = time.perf_counter()
        logger.info(f"Processing query: '{request.question}'")
        
        # 1. Parse explicit dates if provided in request
        explicit_ctx = DateContext(
            determination_date=parse_date_string(request.determination_date) if request.determination_date else None,
            change_of_circumstances_date=parse_date_string(request.change_of_circumstances_date) if request.change_of_circumstances_date else None,
            claim_start_date=parse_date_string(request.claim_start_date) if request.claim_start_date else None,
            claim_end_date=parse_date_string(request.claim_end_date) if request.claim_end_date else None
        )
        
        # 2. Extract dates from query text and merge
        date_ctx = extract_dates_from_query(request.question, explicit_context=explicit_ctx)
        
        # 3. Retrieve relevant policy clauses
        retrieval_res = self.retriever.retrieve(request.question, top_k=request.top_k or 5)
        candidate_clauses: List[RetrievedClause] = list(retrieval_res.clauses)
        
        # 4. Spanning claim clause injection: ensure §7.4.3 is present if spanning 1 March 2026
        if date_ctx.claim_start_date and date_ctx.claim_end_date:
            if date_ctx.claim_start_date < self.temporal_resolver.effective_date <= date_ctx.claim_end_date:
                if not any(c.clause_id == "§7.4.3" for c in candidate_clauses):
                    c_743 = get_clause_by_id("§7.4.3")
                    if c_743:
                        candidate_clauses.append(
                            RetrievedClause(
                                clause_id=c_743.clause_id,
                                canonical_id=c_743.canonical_id,
                                part_number=c_743.part_number,
                                part_title=c_743.part_title,
                                section_number=c_743.section_number,
                                section_title=c_743.section_title,
                                title=c_743.title,
                                exact_text=c_743.full_text,
                                document_id=c_743.document_id,
                                source_version=c_743.version,
                                effective_date=c_743.effective_date,
                                retrieval_score=0.95,
                                lexical_score=0.95,
                                semantic_score=0.95,
                                source_location="Part 7, Section 7.4",
                                cross_references=c_743.cross_references,
                                is_expanded=False
                            )
                        )
                        
        candidate_ids = [c.clause_id for c in candidate_clauses]
        
        # 5. Resolve temporal policy layer and transitional rules
        temporal_result = self.temporal_resolver.resolve(date_ctx, relevant_clause_ids=candidate_ids)
        
        # 6. Evaluate Refusal Engine (Out of scope, apparent gap, conflict, missing dates, missing facts)
        should_refuse, refusal_details = self.refusal_engine.evaluate(
            query=request.question,
            retrieved_clauses=candidate_clauses,
            temporal_result=temporal_result
        )
        
        if should_refuse and refusal_details:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
            logger.info(f"Query refused with category: {refusal_details.category.value}")
            return QueryResponse(
                status=ResponseStatus.REFUSED,
                question=request.question,
                refusal_details=refusal_details,
                temporal_resolution=temporal_result.resolution_type,
                date_context=date_ctx,
                warnings=temporal_result.warnings,
                execution_time_ms=elapsed_ms
            )
            
        # 7. Assemble Grounded Prompt
        prompt = build_grounded_prompt(request.question, candidate_clauses, temporal_result)
        
        # 8. Dispatch to Provider
        provider = get_provider(request.provider)
        raw_generation = provider.generate(prompt, SYSTEM_INSTRUCTION)
        
        # 9. Validate Citations
        is_valid_cit, badges, invalid_cits = validate_citations(
            raw_generation,
            temporal_result=temporal_result
        )
        
        # Fallback if no citations in generation: use candidate top clause
        if not badges and candidate_clauses:
            top_c = candidate_clauses[0]
            badges.append(
                CitationBadge(
                    clause_id=top_c.clause_id,
                    canonical_id=top_c.canonical_id,
                    part_number=top_c.part_number,
                    section_number=top_c.section_number,
                    clause_title=top_c.title,
                    exact_quote=top_c.exact_text[:200] + ("..." if len(top_c.exact_text) > 200 else ""),
                    effective_date=top_c.effective_date,
                    is_amended=False
                )
            )
            is_valid_cit = True
            
        if invalid_cits:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
            return QueryResponse(
                status=ResponseStatus.REFUSED,
                question=request.question,
                refusal_details=RefusalDetails(
                    category=RefusalCategory.CITATION_VALIDATION_FAILED,
                    reason=f"Generated answer referenced unverified or hallucinated clause citations: {', '.join(invalid_cits)}.",
                    missing_information=["Statutory evidence in the policy manual for the cited clauses."],
                    partial_relevant_clauses=candidate_ids[:2],
                    recommended_next_step="Review the consolidated policy manual directly to verify cited provisions."
                ),
                execution_time_ms=elapsed_ms
            )
            
        # 10. Parse Direct Answer and Explanation from text
        direct_answer = ""
        explanation = ""
        
        da_match = re.search(r"DIRECT ANSWER:\s*(.*?)(?=\n\s*EXPLANATION:|\n\s*CITATIONS:|\Z)", raw_generation, re.DOTALL | re.IGNORECASE)
        if da_match:
            direct_answer = da_match.group(1).strip()
            
        exp_match = re.search(r"EXPLANATION:\s*(.*?)(?=\n\s*CITATIONS:|\Z)", raw_generation, re.DOTALL | re.IGNORECASE)
        if exp_match:
            explanation = exp_match.group(1).strip()
            
        if not direct_answer:
            direct_answer = raw_generation.strip()
            
        # 11. Compile Warnings & Supervisory Gates
        warnings: List[str] = list(temporal_result.warnings)
        for badge in badges:
            for gate_id, gate_warning in SUPERVISORY_GATES.items():
                if badge.clause_id == gate_id or badge.clause_id.startswith(gate_id):
                    if gate_warning not in warnings:
                        warnings.append(gate_warning)
                        
        status = ResponseStatus.ANSWERED_WITH_WARNING if warnings else ResponseStatus.ANSWERED
        elapsed_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        
        return QueryResponse(
            status=status,
            question=request.question,
            direct_answer=direct_answer,
            policy_explanation=explanation if explanation else None,
            supporting_citations=badges,
            temporal_resolution=temporal_result.resolution_type,
            date_context=date_ctx,
            is_amendment_active=temporal_result.is_amendment_active,
            transitional_rules_applied=temporal_result.transitional_rules_applied,
            apportionment=temporal_result.apportionment,
            warnings=warnings,
            execution_time_ms=elapsed_ms
        )

# Global generator instance
answer_generator = GroundedAnswerGenerator()
