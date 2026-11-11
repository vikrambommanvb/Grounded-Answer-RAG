# AI ASSISTANCE DISCLOSURE & HUMAN OVERSIGHT RECORD
**Project:** The Grounded Answer &mdash; Calder County Household Support Program  
**Development Harness:** Google Antigravity &times; Advanced Agentic Coding  
**Date:** November 2026  

---

## 1. Overview & Purpose of This Record

This document provides a transparent, accountable record of how Artificial Intelligence tools were utilized during the design, implementation, testing, and verification of **The Grounded Answer**, alongside the rigorous human engineering oversight and architectural controls applied throughout development.

---

## 2. AI Tools & Models Utilized

1. **Google Antigravity Coding Assistant:** Used as the primary interactive pair-programming agent for codebase exploration, incremental scaffolding, test execution, and refactoring.
2. **Groq Cloud API (Llama-3.3-70B-Versatile):** Integrated as an optional runtime LLM provider for zero-temperature, evidence-grounded answer synthesis.
3. **`npx ui-skills` (Design Engineering Tooling):** Utilized to inspect the UI skills catalog and retrieve `anthropics/frontend-design` and `ibelick/baseline-ui` to guide the React/Tailwind frontend design.

---

## 3. What AI Assisted With

- **Pattern Scaffolding:** Drafting initial boilerplate schemas in Pydantic v2 and TypeScript interfaces matching REST endpoints.
- **Regular Expression Formulations:** Generating initial token regexes for clause symbols (e.g. `§\d+\.\d+\.\d+(?:\([a-z0-9]+\))?`) and ISO-8601 date extractors (`YYYY-MM-DD`).
- **BM25 Mathematical Normalization:** Implementing Okapi BM25 scoring with soft-saturation curve formulas ($S / (S + 10.0)$).
- **Component Layout Drafting:** Rapidly assembling React/Tailwind UI cards, modal dialogs, and slide-over drawers following shadcn/ui and `ui-skills` patterns.
- **Test Matrix Generation:** Translating the 10 benchmark evaluation specifications into automated pytest test cases in `backend/tests/test_api.py`.

---

## 4. Human Architectural Decisions & Critical Oversight

AI tools were strictly governed by human software engineering principles and domain policy analysis. Critical human interventions included:

1. **Refusal to Permit Policy Hallucination:**
   - Ungrounded LLMs naturally attempt to answer *every* question, even when no policy exists.
   - The human lead established the **Doctrine of Refusal**, demanding that out-of-scope, contradictory, or unmentioned topics be strictly rejected.
2. **Discovery of Statutory Challenge Traps:**
   - **The Student Gap:** During Phase 0 analysis, the human reviewer identified that §7.1.3 erroneously points to care allowances in §5.4, and that student needs calculation rules do not exist. Dedicated algorithmic guardrails (`StudentGapDetector`) were created to prevent AI fabrication.
   - **The Pre-Amendment Reporting Conflict:** The human reviewer identified the direct contradiction between §4.3.2 (10 days) and §9.1.4 (30-day safe harbor), designing the `PolicyConflictDetector` to reject the question for pre-March 2026 events.
3. **Temporal Decoupling (Paras 5.1, 5.2, 5.3):**
   - The human engineer recognized that date substitution (assuming "today's date") is a catastrophic failure mode in benefits adjudication.
   - The system was architected to reject rate queries with missing dates (`MISSING_TEMPORAL_DATA`) and enforce the exact distinction between determination dates (Para 5.1) and occurrence dates (Para 5.2).
4. **Apportionment Formula Integrity:**
   - The human engineer prevented any approximation or invented apportionment formulas, strictly implementing §7.4.3 daily award ratios for claims spanning 1 March 2026.

---

## 5. Code Review Practices & Verification Methodology

Every phase of development was verified before advancement:
- **Phase Completion Protocol:** No phase was marked complete without running full automated test suites, reviewing `git diff` outputs, and documenting all changes.
- **Strict Compiler & Linter Verification:**
  - TypeScript strict mode enforced zero unread variables (`noUnusedLocals: true`).
  - Python types validated via Pydantic v2 schemas.
- **Automated Pytest Suite:** All 44 backend tests were executed and passed with 100% success rate in 0.12s.
- **Standalone Benchmark Validation:** `scripts/evaluate.py` executed all 10 benchmark cases with honest metrics persisted to SQLite and `data/evaluations/benchmark_results.json`.

---

## 6. Limitations of AI-Generated Code Observed & Mitigated

During development, specific tendencies of generative AI code were detected and actively corrected:
- *Tendency:* AI proposed dividing BM25 score by `max_score`, which produced spurious scores of 1.0 on off-topic single-word matches.
  *Mitigation:* Replaced with Okapi BM25 soft-saturation curve.
- *Tendency:* AI proposed default fallback to `datetime.now()` when dates were missing.
  *Mitigation:* Strictly forbidden; replaced with `MISSING_TEMPORAL_DATA` refusal category.
- *Tendency:* AI attempted to generate arbitrary purple gradients and dark futuristic styling.
  *Mitigation:* Enforced clean light theme, deep slate typography, and executive casework aesthetic documented in `frontend/DESIGN.md`.

---

## 7. Conclusion

AI served as a powerful pair-programmer for rapid syntax generation and boilerplate automation. Architectural integrity, statutory fidelity, legal interpretation, and verification remained 100% under human engineering control.
