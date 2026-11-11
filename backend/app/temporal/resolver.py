"""Temporal policy resolution engine implementing Amendment No. 2026-01 and transitional rules."""
from datetime import date
from typing import Optional, Dict, List, Tuple
from app.temporal.models import (
    DateContext,
    TemporalResolutionType,
    TemporalResolutionResult,
    ResolvedClauseVersion,
    SpanningApportionmentDetail
)
from app.temporal.apportioner import calculate_spanning_apportionment, AMENDMENT_EFFECTIVE_DATE
from app.api.schemas.policy import ClauseRecord
from app.database.models import get_clause_by_id, get_all_amendments

AMENDED_CLAUSE_IDS = {"§6.4.1", "§6.4.1(a)", "§4.3.2", "§9.1.4", "§6.6.1", "§10.5.2", "§10.5.3A"}

class TemporalPolicyResolver:
    """
    Resolves the exact legally active version of policy clauses
    based on determination dates, change of circumstances dates, and claim periods.
    """
    
    def __init__(self):
        self.effective_date = AMENDMENT_EFFECTIVE_DATE

    def resolve(
        self,
        date_ctx: DateContext,
        relevant_clause_ids: Optional[List[str]] = None
    ) -> TemporalResolutionResult:
        """
        Evaluate date context and compute the applicable policy layer and transitional rules.
        """
        relevant_ids = set(relevant_clause_ids or [])
        touches_amended_clause = any(
            any(cid.startswith(acid) or acid.startswith(cid) for acid in AMENDED_CLAUSE_IDS)
            for cid in relevant_ids
        ) if relevant_ids else True
        
        # 1. Check for spanning claim
        apportionment: Optional[SpanningApportionmentDetail] = None
        if date_ctx.claim_start_date and date_ctx.claim_end_date:
            apportionment = calculate_spanning_apportionment(
                date_ctx.claim_start_date,
                date_ctx.claim_end_date
            )
            if apportionment:
                return self._build_spanning_result(date_ctx, apportionment)
                
        # 2. Check for missing temporal data on date-sensitive questions
        has_dates = bool(
            date_ctx.determination_date or
            date_ctx.change_of_circumstances_date or
            date_ctx.claim_start_date or
            date_ctx.raw_query_dates
        )
        
        if not has_dates:
            if touches_amended_clause and relevant_ids:
                return self._build_missing_date_result(date_ctx)
            else:
                return self._build_date_invariant_result(date_ctx)
                
        # Effective determination date test
        det_date = date_ctx.determination_date
        change_date = date_ctx.change_of_circumstances_date
        
        # 3. Check for Transitional Split Case (Change in Feb, Determination in March)
        if (
            det_date and det_date >= self.effective_date and
            change_date and change_date < self.effective_date
        ):
            return self._build_transitional_split_result(date_ctx)
            
        # 4. Standard Pre- vs Post-Amendment evaluation
        # If determination date is available, it governs Para 5.1
        if det_date:
            if det_date >= self.effective_date:
                return self._build_post_amendment_result(date_ctx)
            else:
                return self._build_pre_amendment_result(date_ctx)
                
        # If only change date is available
        if change_date:
            if change_date >= self.effective_date:
                return self._build_post_amendment_result(date_ctx)
            else:
                return self._build_pre_amendment_result(date_ctx)
                
        return self._build_date_invariant_result(date_ctx)

    def _build_pre_amendment_result(self, ctx: DateContext) -> TemporalResolutionResult:
        """Pre-1 March 2026 resolution."""
        overlay: Dict[str, ResolvedClauseVersion] = {}
        
        # §6.4.1(a) earnings disregard: $120
        overlay["§6.4.1(a)"] = ResolvedClauseVersion(
            clause_id="§6.4.1(a)",
            canonical_id="6.4.1(a)",
            part_number=6,
            applicable_text="the first $120 per month of household earnings from employment;",
            is_amended=False,
            temporal_notes=["Determined prior to 1 March 2026: baseline $120 per month disregard applies."]
        )
        
        # §4.3.2 reporting period: 10 days
        overlay["§4.3.2"] = ResolvedClauseVersion(
            clause_id="§4.3.2",
            canonical_id="4.3.2",
            part_number=4,
            applicable_text="A recipient must report any change in household composition, income, address, or the circumstances of any household member within 10 calendar days of the change occurring, or within 10 calendar days of the recipient becoming aware of the change, whichever is later.",
            is_amended=False,
            temporal_notes=["Pre-amendment rule: 10 calendar days reporting requirement applies."]
        )
        
        # §9.1.4 reporting safe harbor: 30 days
        overlay["§9.1.4"] = ResolvedClauseVersion(
            clause_id="§9.1.4",
            canonical_id="9.1.4",
            part_number=9,
            applicable_text="Where an overpayment has arisen from a change of circumstances, and the recipient reported the change within the 30 calendar days required under §4.3, no overpayment shall be established in respect of any period before the date on which the Department was in a position to act on the report.",
            is_amended=False,
            temporal_notes=["Pre-amendment internal inconsistency: §9.1.4 references 30 calendar days, conflicting with §4.3.2 10 calendar days."]
        )
        
        # §10.5.2 sanction rate: 20%
        overlay["§10.5.2"] = ResolvedClauseVersion(
            clause_id="§10.5.2",
            canonical_id="10.5.2",
            part_number=10,
            applicable_text="A sanction is a reduction of the monthly award by 20 per cent for a period of 4 weeks for a first sanction, or 8 weeks for a subsequent sanction within 12 months.",
            is_amended=False,
            temporal_notes=["Pre-amendment sanction reduction is 20 per cent."]
        )
        
        return TemporalResolutionResult(
            resolution_type=TemporalResolutionType.PRE_AMENDMENT,
            date_context=ctx,
            is_amendment_active=False,
            transitional_rules_applied=[],
            warnings=["Operating under consolidated 2025 text prior to Amendment No. 2026-01."],
            effective_clauses_overlay=overlay
        )

    def _build_post_amendment_result(self, ctx: DateContext) -> TemporalResolutionResult:
        """Post-1 March 2026 resolution."""
        overlay: Dict[str, ResolvedClauseVersion] = {}
        
        overlay["§6.4.1(a)"] = ResolvedClauseVersion(
            clause_id="§6.4.1(a)",
            canonical_id="6.4.1(a)",
            part_number=6,
            applicable_text="the first $175 per month of household earnings from employment;",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §1.1",
            transitional_rule_applied="Paragraph 5.1",
            temporal_notes=["Determination made on or after 1 March 2026: revised $175 per month disregard applies under Paragraph 5.1."]
        )
        
        overlay["§4.3.2"] = ResolvedClauseVersion(
            clause_id="§4.3.2",
            canonical_id="4.3.2",
            part_number=4,
            applicable_text="A recipient must report any change in household composition, income, address, or the circumstances of any household member within 14 calendar days of the change occurring, or within 14 calendar days of the recipient becoming aware of the change, whichever is later.",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §2.1",
            transitional_rule_applied="Paragraph 5.2",
            temporal_notes=["Change occurred on or after 1 March 2026: revised 14 calendar days applies under Paragraph 5.2."]
        )
        
        overlay["§9.1.4"] = ResolvedClauseVersion(
            clause_id="§9.1.4",
            canonical_id="9.1.4",
            part_number=9,
            applicable_text="Where an overpayment has arisen from a change of circumstances, and the recipient reported the change within the 14 calendar days required under §4.3, no overpayment shall be established in respect of any period before the date on which the Department was in a position to act on the report.",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §2.2",
            transitional_rule_applied="Paragraph 5.2",
            temporal_notes=["Aligned to 14 calendar days under Amendment No. 2026-01 §2.2."]
        )
        
        overlay["§10.5.2"] = ResolvedClauseVersion(
            clause_id="§10.5.2",
            canonical_id="10.5.2",
            part_number=10,
            applicable_text="A sanction is a reduction of the monthly award by 15 per cent for a period of 4 weeks for a first sanction, or 8 weeks for a subsequent sanction within 12 months.",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §4.1",
            transitional_rule_applied="Paragraph 5.1",
            temporal_notes=["Sanction reduction lowered to 15 per cent under Paragraph 5.1."]
        )
        
        overlay["§10.5.3A"] = ResolvedClauseVersion(
            clause_id="§10.5.3A",
            canonical_id="10.5.3A",
            part_number=10,
            applicable_text="A sanction must not be imposed in respect of a failure to report where the change of circumstances in question would have increased the award.",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §4.2",
            transitional_rule_applied="Paragraph 5.1",
            temporal_notes=["New statutory protection inserted by Amendment No. 2026-01 §4.2."]
        )
        
        return TemporalResolutionResult(
            resolution_type=TemporalResolutionType.POST_AMENDMENT,
            date_context=ctx,
            is_amendment_active=True,
            transitional_rules_applied=["Paragraph 5.1", "Paragraph 5.2"],
            warnings=[],
            effective_clauses_overlay=overlay
        )

    def _build_transitional_split_result(self, ctx: DateContext) -> TemporalResolutionResult:
        """Transitional split: Change occurred in Feb 2026, determined on/after 1 March 2026."""
        overlay: Dict[str, ResolvedClauseVersion] = {}
        
        # Para 5.1 applies new rates for determinations on/after 1 March 2026
        overlay["§6.4.1(a)"] = ResolvedClauseVersion(
            clause_id="§6.4.1(a)",
            canonical_id="6.4.1(a)",
            part_number=6,
            applicable_text="the first $175 per month of household earnings from employment;",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §1.1",
            transitional_rule_applied="Paragraph 5.1",
            temporal_notes=["Determined on or after 1 March 2026: Paragraph 5.1 applies amended $175 disregard, even for pre-amendment claim period."]
        )
        
        overlay["§10.5.2"] = ResolvedClauseVersion(
            clause_id="§10.5.2",
            canonical_id="10.5.2",
            part_number=10,
            applicable_text="A sanction is a reduction of the monthly award by 15 per cent for a period of 4 weeks for a first sanction, or 8 weeks for a subsequent sanction within 12 months.",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §4.1",
            transitional_rule_applied="Paragraph 5.1",
            temporal_notes=["Paragraph 5.1 applies amended 15% sanction to determinations made on/after 1 March 2026."]
        )
        
        overlay["§10.5.3A"] = ResolvedClauseVersion(
            clause_id="§10.5.3A",
            canonical_id="10.5.3A",
            part_number=10,
            applicable_text="A sanction must not be imposed in respect of a failure to report where the change of circumstances in question would have increased the award.",
            is_amended=True,
            amendment_citation="Amendment No. 2026-01 §4.2",
            transitional_rule_applied="Paragraph 5.1",
            temporal_notes=["Paragraph 5.1 applies §10.5.3A protection to determinations made on/after 1 March 2026."]
        )
        
        # BUT Para 5.2 preserves old reporting timeline for changes occurring before 1 March 2026
        overlay["§4.3.2"] = ResolvedClauseVersion(
            clause_id="§4.3.2",
            canonical_id="4.3.2",
            part_number=4,
            applicable_text="A recipient must report any change in household composition, income, address, or the circumstances of any household member within 10 calendar days of the change occurring, or within 10 calendar days of the recipient becoming aware of the change, whichever is later.",
            is_amended=False,
            transitional_rule_applied="Paragraph 5.2",
            temporal_notes=["Transitional Rule Paragraph 5.2: Change occurred prior to 1 March 2026. The 10 calendar days reporting period in force at date of change governs, irrespective of determination date."]
        )
        
        overlay["§9.1.4"] = ResolvedClauseVersion(
            clause_id="§9.1.4",
            canonical_id="9.1.4",
            part_number=9,
            applicable_text="Where an overpayment has arisen from a change of circumstances, and the recipient reported the change within the 30 calendar days required under §4.3, no overpayment shall be established in respect of any period before the date on which the Department was in a position to act on the report.",
            is_amended=False,
            transitional_rule_applied="Paragraph 5.2",
            temporal_notes=["Transitional Rule Paragraph 5.2: Pre-amendment reporting safe harbor (30 calendar days) remains applicable to pre-March change."]
        )
        
        return TemporalResolutionResult(
            resolution_type=TemporalResolutionType.TRANSITIONAL_SPLIT,
            date_context=ctx,
            is_amendment_active=True,
            transitional_rules_applied=["Paragraph 5.1", "Paragraph 5.2"],
            warnings=[
                "Transitional Split Rule Applied: Rates governed by determination date under Paragraph 5.1 ($175 disregard, 15% sanction); reporting timelines governed strictly by change occurrence date under Paragraph 5.2 (retaining pre-amendment 10/30-day rules)."
            ],
            effective_clauses_overlay=overlay
        )

    def _build_spanning_result(self, ctx: DateContext, app: SpanningApportionmentDetail) -> TemporalResolutionResult:
        """Spanning claim resolution under Paragraph 5.3 & §7.4.3."""
        overlay: Dict[str, ResolvedClauseVersion] = {}
        
        overlay["§7.4.3"] = ResolvedClauseVersion(
            clause_id="§7.4.3",
            canonical_id="7.4.3",
            part_number=7,
            applicable_text=f"An award of less than one month's duration is apportioned by reference to the number of days. {app.apportionment_formula}",
            is_amended=True,
            transitional_rule_applied="Paragraph 5.3",
            temporal_notes=[
                f"Claim spans 1 March 2026 ({app.claim_start_date} to {app.claim_end_date}). Total: {app.total_days} days. Pre-amendment days: {app.pre_amendment_days} ({app.pre_amendment_ratio * 100:.1f}%). Post-amendment days: {app.post_amendment_days} ({app.post_amendment_ratio * 100:.1f}%)."
            ]
        )
        
        return TemporalResolutionResult(
            resolution_type=TemporalResolutionType.SPANNING_CLAIM,
            date_context=ctx,
            is_amendment_active=True,
            transitional_rules_applied=["Paragraph 5.3", "§7.4.3"],
            apportionment=app,
            warnings=[
                f"Claim period spans 1 March 2026. Daily apportionment applies under §7.4.3 per Amendment No. 2026-01 Paragraph 5.3: {app.pre_amendment_days} days at pre-amendment rates, {app.post_amendment_days} days at post-amendment rates."
            ],
            effective_clauses_overlay=overlay
        )

    def _build_missing_date_result(self, ctx: DateContext) -> TemporalResolutionResult:
        """Temporal data is missing for rate- or timeline-sensitive questions."""
        return TemporalResolutionResult(
            resolution_type=TemporalResolutionType.MISSING_TEMPORAL_DATA,
            date_context=ctx,
            is_amendment_active=False,
            transitional_rules_applied=[],
            warnings=[
                "Missing Temporal Context: This query concerns provisions modified by Amendment No. 2026-01 (effective 1 March 2026). The applicable rule depends on the determination date or change of circumstances date. The assistant cannot assume today's date."
            ],
            effective_clauses_overlay={}
        )

    def _build_date_invariant_result(self, ctx: DateContext) -> TemporalResolutionResult:
        """Date invariant clause resolution."""
        return TemporalResolutionResult(
            resolution_type=TemporalResolutionType.DATE_INVARIANT,
            date_context=ctx,
            is_amendment_active=False,
            transitional_rules_applied=[],
            warnings=[],
            effective_clauses_overlay={}
        )

# Global singleton instance
temporal_resolver = TemporalPolicyResolver()
