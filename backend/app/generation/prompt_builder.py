"""Prompt assembly for grounded answer generation."""
from typing import List
from app.api.schemas.retrieval import RetrievedClause
from app.temporal.models import TemporalResolutionResult

SYSTEM_INSTRUCTION = """You are The Grounded Answer, an evidence-grounded policy intelligence assistant for Calder County Household Support Program caseworkers.

CORE OPERATIONAL RULES:
1. STRICT EVIDENCE GROUNDING: Answer ONLY using the explicit policy evidence provided in the prompt. Do not use external legal knowledge or common-sense assumptions.
2. STATUTORY MODALITY: Strictly preserve the distinction between:
   - "must" indicates a mandatory requirement (§1.3.1).
   - "may" indicates a discretion (§1.3.1) which must be exercised reasonably and recorded on the case file (§1.1.3).
   - "should" indicates the ordinary expected practice from which departure requires a recorded reason (§1.3.1).
3. EXACT CLAUSE CITATIONS: Every substantive policy assertion must cite the exact clause identifier (e.g. §4.3.2, §6.4.1(a)). Never invent or assume citations.
4. TEMPORAL ACCURACY: Apply the applicable temporal version and transitional provisions specified in the context.
5. FORMAT OF RESPONSE:
   DIRECT ANSWER: [1-2 clear, direct sentences answering the question]
   EXPLANATION: [Step-by-step reasoning citing specific statutory conditions, rules, and modality]
   CITATIONS: [Comma-separated list of exact clause identifiers used, e.g. §2.4.1, §2.4.2]
"""

def build_grounded_prompt(
    question: str,
    retrieved_clauses: List[RetrievedClause],
    temporal_result: TemporalResolutionResult
) -> str:
    """Construct prompt embedding only verified policy evidence and temporal rules."""
    prompt_lines = [
        f"QUESTION: {question}",
        "",
        "--- TEMPORAL POLICY CONTEXT ---",
        f"Resolution Type: {temporal_result.resolution_type.value}",
        f"Amendment Active: {'YES (Amendment No. 2026-01 effective 1 March 2026)' if temporal_result.is_amendment_active else 'NO (Baseline 2025 Consolidated Text)'}",
    ]
    
    if temporal_result.date_context.determination_date:
        prompt_lines.append(f"Determination Date: {temporal_result.date_context.determination_date}")
    if temporal_result.date_context.change_of_circumstances_date:
        prompt_lines.append(f"Change of Circumstances Date: {temporal_result.date_context.change_of_circumstances_date}")
    if temporal_result.transitional_rules_applied:
        prompt_lines.append(f"Transitional Rules Applied: {', '.join(temporal_result.transitional_rules_applied)}")
    if temporal_result.warnings:
        prompt_lines.append(f"Temporal Directives: {' | '.join(temporal_result.warnings)}")
    if temporal_result.apportionment:
        prompt_lines.append(f"Apportionment Formula: {temporal_result.apportionment.apportionment_formula}")
        
    prompt_lines.extend([
        "",
        "--- RETRIEVED STATUTORY EVIDENCE ---"
    ])
    
    for c in retrieved_clauses:
        # Check if clause has temporal overlay replacement
        overlay_clause = temporal_result.effective_clauses_overlay.get(c.clause_id)
        if overlay_clause and overlay_clause.is_amended:
            text_to_show = f"[AMENDED TEXT via {overlay_clause.amendment_citation}]: {overlay_clause.applicable_text}"
        else:
            text_to_show = c.exact_text
            
        prompt_lines.extend([
            f"Clause {c.clause_id} ({c.part_title} — {c.section_title}{f' [{c.title}]' if c.title else ''}):",
            f"Source Location: {c.source_location}",
            f"Modality: {', '.join(c.cross_references) if c.cross_references else 'None'}",
            f"Text: {text_to_show}",
            ""
        ])
        
    prompt_lines.extend([
        "Synthesize a grounded answer following the DIRECT ANSWER, EXPLANATION, and CITATIONS format."
    ])
    
    return "\n".join(prompt_lines)
