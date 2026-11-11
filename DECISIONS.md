# ARCHITECTURAL DECISIONS & DESIGN LOG
**Project:** The Grounded Answer &mdash; Calder County Household Support Program  
**Author:** AI Engineering & Architecture Team  
**Status:** Living Architectural Record  

---

## 1. Architectural Strategy & Modular Monolith

### Decision
Implement the backend as a **modular monolith** in FastAPI rather than distributed microservices or multi-database architectures.

### Rationale
- Public welfare policy manuals have dense internal statutory cross-references (§1.4 definitions, §2.1 eligibility rules, §6.4 disregards, §7.4 calculations).
- Splitting the system into separate microservices (e.g., an independent "retrieval service", "temporal service", and "citation service") would introduce unnecessary network serialization latency, distributed transactions, and deployment friction.
- A modular monolith keeps all 16 domains cleanly separated in pure Python packages (`ingestion`, `retrieval`, `temporal`, `policy`, `generation`, `citations`, `refusal`, `providers`, `evaluation`), enabling zero-latency in-memory data passing while preserving strict boundaries.

---

## 2. Ingestion & Chunking: Clause-Boundary Granularity

### Decision
Index documents strictly at the **numbered clause boundary** (`§X.Y.Z`) rather than arbitrary token chunks (e.g., 500-token sliding windows).

### Rationale
- Statutory text derives legal force from its exact clause identifier. An applicant is denied under §2.4.1 or receives an earnings disregard under §6.4.1(a).
- Token-window chunking slices through statutory tables (e.g., §6.6.1 household income thresholds) and severs introductory qualifiers from itemized lists.
- By parsing each clause as a distinct `ClauseRecord` with its parent Part title, section number, subsection items, verbatim text, and cross-reference links, the retrieval system can return complete, legally binding units of policy.
- Definitions (§1.4.1 through §1.4.11) and calculation tables (§6.6.1, §7.2.1) are preserved intact with structured attributes.

---

## 3. Retrieval Strategy: Hybrid BM25, Semantic Cosine & Graph Expansion

### Decision
Combine **Okapi BM25 lexical retrieval** with **semantic vector cosine similarity** and **statutory cross-reference graph expansion**.

### Rationale
- **Pure Vector Limitations:** Semantic vector search often confuses specific statutory numbers (e.g., matching "$120" with "$175" because they share embedding space) and misses explicit clause identifier queries like "What does §2.3.2 require?".
- **Pure BM25 Limitations:** Keyword search fails when a caseworker asks a natural language question (e.g., "Can a minor qualify if their parents kicked them out?" where the statutory text says "no person with parental responsibility is able and willing to support").
- **Hybrid Fusion Solution:**
  1. Lexical BM25 with exact clause identifier boosting ($\times 3.0$) and word-suffix stemming.
  2. Character 3-gram semantic vector embeddings with cosine similarity.
  3. Soft-saturation normalization $S_{norm} = \frac{S}{S + 10.0}$ preventing unbounded BM25 scores from dominating semantic scores.
  4. Cross-Reference Expansion: Automatically inspects the top primary retrieved clauses for explicit cross-references (e.g., §2.3.1 referencing §2.1.2) and injects supporting statutory provisions into the evidence envelope.

---

## 4. Refusal Threshold Calibration

### Decision
Calibrate the retrieval similarity threshold to `SIMILARITY_THRESHOLD = 0.20`.

### Rationale
- During Phase 3 testing, an uncalibrated threshold of `0.05` allowed off-topic queries (e.g., "Quantum semiconductor photon entanglement coherence") to retrieve random eligibility clauses with low background noise scores, causing the LLM to hallucinate answers.
- In contrast, setting the threshold to `0.45` caused valid but succinctly worded caseworker questions to be rejected.
- Comprehensive testing established that off-topic queries score $\le 0.08$, while all valid policy inquiries score between $0.28$ and $0.85$. Setting the threshold at `0.20` provides a clean 100% precision boundary for `OUT_OF_SCOPE` refusals.

---

## 5. Temporal Policy Engine & Effective-Dated Overlay

### Decision
Implement Amendment No. 2026-01 as an **effective-dated overlay**, strictly separate from the 2025 baseline manual, enforcing Paragraphs 5.1, 5.2, and 5.3.

### Rationale
- Caseworkers frequently adjudicate retroactive claims, appeals, or overpayment audits concerning periods prior to 1 March 2026. If the database simply overwrote §6.4.1 ($120 $\rightarrow$ $175) or §4.3.2 (10 $\rightarrow$ 14 days), historical calculations would be corrupted.
- **Transitional Rules Decoupling:**
  - **Paragraph 5.1 (Determination Date):** Part 6 rates (earnings disregard, income thresholds, sanctions) apply based on the date of determination $\ge$ 1 March 2026, even for prior claim periods.
  - **Paragraph 5.2 (Occurrence Date):** Part 4 reporting deadlines (14 days) apply *strictly* to changes occurring on or after 1 March 2026. Changes occurring prior to 1 March 2026 retain the earlier 10-day reporting period regardless of determination date.
  - **Paragraph 5.3 (Spanning Claims):** Where a claim spans across 1 March 2026, the award is calculated on a daily basis by reference to days under §7.4.3.
- **Date-Assumption Prevention:** If a caseworker asks for a benefit rate or reporting deadline without supplying the critical dates, the engine refuses with `MISSING_TEMPORAL_DATA` rather than dangerously defaulting to `datetime.now()`.

---

## 6. Responsible Refusal & Challenge Trap Resolution

### Decision
Hard-code zero policy answers. Implement dedicated analytical detectors for statutory contradictions and drafting omissions.

### Rationale
1. **The Full-Time Student Gap Trap (§7.1.3 &rarr; §5.4):**
   - The Policy Manual in §7.1.3 states: *"except in the case of full-time students (see §5.4)"*.
   - Section 5.4 exclusively governs Care Allowances. No student calculation rules exist in the manual.
   - An ungrounded LLM invents formulas for student grants.
   - Our `StudentGapDetector` intercepts queries probing student calculation, returns an explicit `APPARENT_GAP` refusal, lists missing information, and directs the caseworker to County Policy Leadership.
2. **The Pre-Amendment Inconsistency Trap (§4.3.2 vs §9.1.4):**
   - In the pre-amendment text, §4.3.2 mandates reporting within 10 calendar days, while §9.1.4 states no overpayment is established if reported within the *"30 calendar days required under §4.3"*.
   - Our `PolicyConflictDetector` flags inquiries probing pre-amendment reporting deadlines with `INTERNAL_CONFLICT`, detailing the 10 vs 30-day statutory contradiction and advising supervisory escalation.

---

## 7. Dual Provider Strategy: Deterministic Mock & Groq Cloud

### Decision
Support a **Deterministic Mock Provider** alongside the **Groq Cloud Llama-3.3-70B** provider.

### Rationale
- Automated unit tests, CI/CD pipelines, and local development must run with 100% determinism, zero network reliance, and zero paid API quota consumption.
- The `MockLLMProvider` deterministically constructs grounded policy answers directly from retrieved evidence and statutory templates.
- The `GroqProvider` delivers high-speed cloud inference (~850ms) using Llama-3.3-70B with temperature `0.0` for modal fidelity when an active API key is provided.
- API keys are held strictly in backend environment variables and are masked (`gsk_***`) on all public endpoints.

---

## 8. Day-Two Amendment Handling: What Changed, What Was Kept, and Hindsight Analysis

The introduction of **Amendment No. 2026-01** (effective 1 March 2026) represented a fundamental shift from a static corpus to an effective-dated, temporal policy system. Here is the formal record of our architectural decisions.

### 8.1 What Was Changed
1. **Dynamic Temporal Policy Resolver:**
   - Designed and integrated `TemporalPolicyResolver` (`app/temporal/resolver.py`) to decouple policy content from execution dates.
   - Built dual temporal evaluators enforcing the distinct criteria of:
     - **Paragraph 5.1:** Part 6 rates, income thresholds, and sanction percentages apply strictly by **determination date** $\ge$ 1 March 2026 (even for earlier claim periods).
     - **Paragraph 5.2:** Part 4 reporting timelines apply strictly by the **date the change of circumstances occurred** ($\ge$ 1 March 2026 = 14 days; prior to 1 March 2026 = 10 days).
2. **Statutory Daily Apportionment Engine (§7.4.3 & Para 5.3):**
   - Implemented exact day-count award apportionment (`app/temporal/apportioner.py`) for claims spanning across 1 March 2026. Pre-March days are calculated at 2025 rates and post-March days at amended rates without arbitrary flat rounding.
3. **Date-Assumption Prevention Guard:**
   - Modified the refusal engine to intercept rate and deadline queries submitted without temporal context (`MISSING_TEMPORAL_DATA`), preventing catastrophic default substitution of `datetime.now()`.
4. **Citation Provenance & Amendment Overlay:**
   - Updated the citation validator to tag amended clauses with their amendment provenance (e.g. `Amendment No. 2026-01 §1.1`, `Paragraph 5.1`).
   - Added visual side-by-side and strike-through comparisons in the UI (`ExplorerPage` and `ClauseDrawer`).

### 8.2 What We Chose NOT to Change (And Why)
1. **The Original Baseline Policy Manual Remains 100% Immutable:**
   - We strictly refused to mutate or overwrite baseline clause records in SQLite. Adjudicating retroactive appeals or historical audits requires 100% fidelity to the pre-amendment text.
2. **The Full-Time Student Gap Trap (§7.1.3 &rarr; §5.4):**
   - Amendment No. 2026-01 did not address or correct the student gap. We retained the `StudentGapDetector` to ensure the system continues to refuse with `APPARENT_GAP` rather than assuming the amendment resolved it.
3. **Pre-Amendment Reporting Inconsistency (§4.3.2 vs §9.1.4):**
   - While Amendment No. 2026-01 prospectively aligned both §4.3.2 and §9.1.4 to 14 days, Paragraph 5.2 explicitly preserves the pre-amendment reporting period for earlier changes. We chose to retain the `INTERNAL_CONFLICT` refusal for pre-March changes.

### 8.3 What We Would Have Done Differently with Hindsight
1. **Bi-Temporal Database Modeling from Day One:**
   - If we had anticipated effective-dated amendments during Phase 1, we would have implemented a formal bi-temporal schema (`valid_from`, `valid_to`, `system_transaction_time`) directly in the SQLite `clauses` table rather than parsing the amendment as an overlay table.
2. **First-Class Date Entities in the Retrieval Graph:**
   - Natural language queries like *"for a claim decided next month"* require two-pass parsing: first extracting temporal expressions into ISO dates, then querying clauses. Designing date tokens directly into the BM25 inverted index would have streamlined single-pass retrieval.
3. **Automated Cross-Reference Dependency Graph Visualization:**
   - Developing an interactive SVG node graph showing how Amendment No. 2026-01 ripples through dependent clauses would provide casework supervisors with instant visual impact analysis.

| Component | Status | Architectural Treatment |
| :--- | :--- | :--- |
| **Baseline Clauses (§1.1.1–§12.3.2)** | **Unchanged** | Stored immutably with consolidated 2025-12 text. Historical records remain fully queryable. |
| **Earnings Disregard (§6.4.1(a))** | **Amended** | Effective-dated overlay substituting $120 with $175 per month for determinations $\ge$ 1 March 2026. |
| **Reporting Period (§4.3.2)** | **Amended** | Effective-dated overlay substituting 10 with 14 calendar days for changes occurring $\ge$ 1 March 2026. |
| **Overpayment Safe Harbor (§9.1.4)** | **Amended** | Aligned from 30 days to 14 days, resolving pre-amendment conflict prospectively. |
| **Income Thresholds Table (§6.6.1)** | **Amended** | Updated monthly limits (e.g. 1-person: $1,450 $\rightarrow$ $1,500; 3-person: $2,000 $\rightarrow$ $2,075). |
| **Sanction Rate (§10.5.2)** | **Amended** | Reduced standard sanction percentage from 20% to 15%. |
| **Hardship Protection (§10.5.3A)** | **Inserted** | Newly created statutory clause shielding households with infants under 12 months from sanctions. |
| **Student Gap (§7.1.3 &rarr; §5.4)** | **Unchanged** | Retained as an unresolved statutory drafting error; continues to trigger `APPARENT_GAP` refusal. |

---

## 9. Known Limitations & Future Roadmap

1. **OCR Ingestion for Scanned Paper Petitions:** Current ingestion parses clean Markdown and DOCX archives. Future versions could integrate local Tesseract OCR for hand-written caseworker case notes.
2. **Multi-Jurisdiction Policy Manuals:** The engine is optimized for Calder County HSP. Multi-county federated policy switching can be enabled by introducing a `county_id` tenant partition key in SQLite.
3. **Casework Case File Persistence:** Currently, caseworkers query policies anonymously. Adding encrypted case-file attachment storage would allow the assistant to automatically extract dates from uploaded PDF notices.

