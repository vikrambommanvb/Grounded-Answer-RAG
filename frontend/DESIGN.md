# THE GROUNDED ANSWER — DESIGN SPECIFICATION
**Version:** 1.0.0  
**Design Persona:** Professional Evidence-Verification Casework Workspace  
**Design Inspo:** ChatGPT (Conversational Flow) &times; Perplexity (Evidence Transparency) &times; Linear (Precision Navigation)  
**UI Skills Integrated:** `anthropics/frontend-design` & `ibelick/baseline-ui` (Retrieved via `npx ui-skills`)  
**Theme:** Light theme by default, high-density legal clarity, accessible, restrained aesthetics.

---

## 1. Visual Identity & Design Philosophy
"The Grounded Answer" is a mission-critical policy intelligence platform for Calder County Household Support Program caseworkers.
- **Tone:** Authoritative, reliable, calm, unambiguous.
- **Core Principle:** Evidence transparency. The user must always see *why* an answer was given, *which clauses* back it up, and *how* effective dates alter the outcome.
- **Baseline UI Quality:** Clean 1px borders, subtle soft shadows, `text-balance` on headings, `text-pretty` on prose, and `tabular-nums` on all benefit amounts and statutory figures.
- **Visual Restraint:** Strict ban on generic purple AI gradients, floating decorative orbs, or arbitrary glow effects. Deep slate typography on crisp white/off-white surfaces.

---

## 2. Color System

### Primary & Neutral Palette (Light Mode Default)
- **Background Root:** `#F8FAFC` (Slate-50) — Off-white canvas that reduces eye strain during 8-hour casework shifts.
- **Surface / Cards:** `#FFFFFF` (Pure White) — Crisp card backgrounds with subtle borders (`border-slate-200`).
- **Surface Raised / Inputs:** `#F1F5F9` (Slate-100) — Input fields, date picker containers, and secondary badges.
- **Border Subtle:** `#E2E8F0` (Slate-200) — 1px clean dividers and card borders.
- **Border Hover / Focus:** `#94A3B8` (Slate-400) / `#3B82F6` (Blue-500) with `focus-visible:ring-2`.

### Typography Grayscale
- **Headings / Primary Text:** `#0F172A` (Slate-900) — Deep slate for optimal readability and legal weight.
- **Body Text:** `#334155` (Slate-700) — High contrast text meeting WCAG AAA standard (ratio > 7:1).
- **Secondary / Captions:** `#64748B` (Slate-500) — Metadata, clause path hierarchy, and helper text.
- **Muted / Placeholders:** `#94A3B8` (Slate-400).

### Restrained Semantic Accents
- **Primary Brand / Action:** `#2563EB` (Blue-600) — Clean, federal/executive blue for active buttons, tabs, and focus rings.
- **Primary Subtle / Pills:** `#EFF6FF` (Blue-50) with `#BFDBFE` (Blue-200) border.
- **Amended Post-March Rate:** `#059669` (Emerald-600) with `#ECFDF5` (Emerald-50) background and `#A7F3D0` (Emerald-200) border.
- **Supervisory Gate / Notice:** `#D97706` (Amber-600) with `#FFFBEB` (Amber-50) background and `#FDE68A` (Amber-200) border.
- **Policy Refusal / Inconsistency:** `#DC2626` (Red-600) with `#FEF2F2` (Red-50) background and `#FECACA` (Red-200) border.
- **Temporal / Spanning Claim:** `#7C3AED` (Purple-600) with `#FAF5FF` (Purple-50) background.

---

## 3. Typography & Hierarchy

### Font Stacks
- **UI & Prose:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Statutory Clauses & Figures:** `ui-monospace, "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace`

### Typography Rules (from UI Skills)
- Headings use `text-balance` to avoid typographic orphans.
- Paragraphs use `text-pretty` for optical rag alignment.
- Monetary rates (`$120`, `$175`, `$4,000`) and timelines (`10`, `14`, `30` days) use `tabular-nums` for alignment in tables and cards.
- Line lengths are constrained to `<= 75ch` for readability.

---

## 4. Layout Dimensions & Structure

### Application Shell
- **Navbar:** Height: `56px` (`3.5rem`) — Fixed top, border-bottom `1px solid #E2E8F0`, bg `#FFFFFF`.
- **Sidebar:** Width: `256px` (`16rem`) — Left fixed column, border-right `1px solid #E2E8F0`, bg `#F8FAFC`.
- **Main Workspace:** Fluid remaining width, padding `24px` (`1.5rem`), scrollable vertically, viewport height `h-dvh`.

### 3-Panel Assistant Workspace (Desktop)
1. **Left Panel (Sidebar):** Navigation across the 8 application modules (256px).
2. **Center Panel (Conversation):** Chat stream, natural language query bar, temporal context bar, and grounded answer cards (min-width `500px`, max-width `820px`, flex-1).
3. **Right Panel (Evidence Envelope):** Real-time retrieved evidence, clause ranking scores, and BM25 diagnostics (`380px` fixed, or slide-over drawer).

---

## 5. Component Design Specifications

### 5.1 Citation Badges (Perplexity-Style)
- **Shape:** Rounded pill (`rounded-md`), border `1px solid`, padding `2px 8px`.
- **Interactive State:** Hover elevates background, changes cursor to pointer, subtle scale transition `transform 150ms ease-out`.
- **Amended Indicator:** Displays a small emerald spark icon and `Amended` badge if modified by Amendment No. 2026-01.
- **Click Behavior:** Triggers the slide-over Clause Drawer with verbatim text and amendment diff.

### 5.2 Slide-Over Clause Drawer
- **Position:** Right-hand side overlay with smooth slide-in (`duration-200 ease-out`).
- **Header:** Clause identifier (`§6.4.1(a)`), section title, Part number, close button with `aria-label="Close Inspector"`.
- **Body:**
  - Effective overlay alert (Action, Effective date, Transitional rule).
  - Verbatim text block formatted in monospace font with high contrast.
  - Baseline text with strike-through if amended.
  - Clickable cross-reference badges.

### 5.3 Temporal Context Bar
- **Position:** Directly integrated with the Casework Assistant query input.
- **Controls:** 4 accessible HTML5 date pickers:
  - Determination Date
  - Change Occurrence Date
  - Claim Start Date
  - Claim End Date
- **Preset Buttons:** Quick 1-click casework chips:
  - "Pre-Amendment (Feb 2026)"
  - "Post-Amendment (Mar 2026)"
  - "Transitional Split (Para 5.1 vs 5.2)"
  - "Spanning Claim (Para 5.3)"
  - "Clear Dates"

### 5.4 Structured Refusal Card
- **Border:** `2px solid #DC2626` (Red) or `#D97706` (Amber).
- **Background:** Crisp `#FEF2F2` or `#FFFBEB`.
- **4-Part Structure:**
  1. *Refusal Category Pill:* e.g., `APPARENT_GAP` or `INTERNAL_CONFLICT`.
  2. *Formal Statement:* Plain, objective reason why the query cannot be answered from policy.
  3. *Missing Information Checklist:* Bulleted list of facts required to proceed.
  4. *Actionable Caseworker Next Step:* Clear instruction on who to consult (e.g., County Policy Leadership).

### 5.5 Supervisory Referral Warning Banner
- **Border:** `1px solid #FCD34D`.
- **Background:** Soft warm amber `#FFFBEB`.
- **Icon:** Alert Shield (`ShieldAlert`).
- **Trigger:** Any youth applicant (16-17) under §2.3.2 or unresolved transitional split.

---

## 6. Accessibility & Interaction (WCAG 2.1 AA)
- **Contrast:** All text satisfies minimum contrast ratio of 4.5:1 against its background.
- **Keyboard Navigation:** All interactive elements (citations, tree nodes, date inputs, drawer close buttons) are fully keyboard-navigable with clear `:focus-visible` rings (`ring-2 ring-blue-500 ring-offset-2`).
- **Semantic Tags:** Semantic tags `<header>`, `<aside>`, `<main>`, `<nav>`, `<button>`, `<input>` used throughout.
- **ARIA Live Regions:** Dynamic assistant responses, loading spinners, and benchmark progress announced to screen readers.
