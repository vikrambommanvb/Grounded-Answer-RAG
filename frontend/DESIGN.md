# THE GROUNDED ANSWER — ANTI-AI-SLOP DESIGN SYSTEM & EDITORIAL SPECIFICATION

## 1. Design Philosophy & Creative Direction
The Grounded Answer is an evidence-grounded policy intelligence workstation for Calder County Household Support Program (HSP) caseworkers. 

Unlike generic "AI SaaS" templates characterised by saturated purple gradients, glowing neon orbs, meaningless particles, and bubbly card grids, this application is styled after **Swiss International Typographic Design**, **Linear interface precision**, and **editorial legal research workstations** (such as high-end judicial databases and financial intelligence terminals).

Every element earns its place. Decoration without informative purpose is rejected.

---

## 2. Color System
A strictly restrained 10-color semantic palette communicates meaning rather than visual noise:

| Token | Hex Value | Semantic Function & Application |
| :--- | :--- | :--- |
| **Warm Off-White** | `#F8F8F5` | Primary canvas background. Warm, tactile, non-glaring for extended casework reading. |
| **Pure White** | `#FFFFFF` | Layered surfaces, active document sheets, and workspace panels. |
| **Ink** | `#171A21` | Primary typographic color, headings, active iconography, strong visual anchors. |
| **Deep Charcoal** | `#252A32` | Secondary body text, statutory prose, table data. |
| **Muted Grey** | `#777E89` | Tertiary metadata, timestamps, input placeholders, breadcrumbs, borders. |
| **Fine Borders** | `#E5E5E0` | 1px structural gridlines, column dividers, card edges. No heavy drop-shadows. |
| **Accent Cobalt** | `#3458DB` | Focused actions, primary buttons, active navigation, clause link hover. |
| **Evidence Teal** | `#137C72` | Verified statutory grounding, positive citation badges, checksum verification. |
| **Warning Ochre** | `#B77A24` | Mandatory supervisory referral gates (§2.3.2), transitional notices (Paras 5.1–5.3). |
| **Refusal Red** | `#B94040` | Doctrine of Responsible Refusal (apparent gap, internal conflict, missing date). |

---

## 3. Typography Hierarchy
Two high-caliber typefaces establish clear visual distinction between interface chrome and legal prose:

* **Interface Chrome & Data:** `Inter` (sans-serif)
  * Display Numbers & IDs: Monospace numerals with tabular figures (`tnum`).
  * Micro Metadata: `font-size: 10px`, `font-weight: 600`, `letter-spacing: +0.06em`, uppercase.
  * Form Controls & Badges: `12px` / `13px`, medium weight (`500`).
* **Statutory Content & Major Section Titles:** `Newsreader` (optical size `opsz: 6..72`)
  * Editorial Section Headings: `font-serif`, `tracking: -0.025em`, leading `1.15`.
  * Verbatim Statutory Policy Text: `font-serif`, `font-size: 15px`, `line-height: 1.7`, high legibility.
* **Code, Hashes, & Statutory Identifiers:** `JetBrains Mono`
  * Clause IDs (`§6.4.1(a)`), SHA-256 hashes, execution latencies (`1.7ms`).

---

## 4. Layout Architecture & Dimensions
* **Global Shell:** Fixed viewport height (`100vh`), non-scrolling outer body, dual-pane layout.
* **Top Navigation Bar:** Height `52px` (subtle and compact), `#FFFFFF` with `1px` border `#E5E5E0` and `backdrop-filter: blur(16px)`.
* **Sidebar:** Fixed width `240px` (desktop), collapsible to icon rail on compact screens. Clear architectural groupings.
* **Casework Assistant Workspace:**
  * 3-column workstation layout:
    1. **Inquiry History Column** (`260px`): List of recent queries, status tags, and presets.
    2. **Answer Workspace** (Center, fluid flex-1): Prompt input, temporal date context, answers, warnings, refusal cards.
    3. **Evidence Inspector** (`340px`): Ranked clause snippets, BM25/vector scores, instant drawer triggers.
* **Policy Explorer:** Document reading pane with 12-part statutory index, search bar, side-by-side diff viewer, and 3D Statutory Dependency Graph.

---

## 5. Apple Design & Motion Principles
Following Apple's *Designing Fluid Interfaces* principles:
* **Response — Zero Perceived Latency:** Buttons and pills respond on `pointer-down` with `active:scale-[0.98]`.
* **Critically Damped Springs:** Animations use `framer-motion` springs with `damping: 1.0, stiffness: 200` (critically damped, zero oscillation or toy-like bounce).
* **Spatial Symmetry:** Slide-over drawers enter from the right and exit back to the right along the identical curve.
* **Translucency with Purpose:** Subdued `backdrop-filter: blur(16px)` on floating navigation chrome and modal scrims.
* **Reduced Motion:** Fully honors `@media (prefers-reduced-motion: reduce)` by falling back to crisp opacity cross-fades.

---

## 6. Three.js Statutory Dependency Visualization
Located inside the **Policy Explorer**, this 3D visualization models real statutory cross-references:
* 148 clause nodes positioned in a 3D cylindrical manifold clustered by Policy Part.
* Fine hairline connectors representing actual `cross_references` between clauses.
* Color-coded states: Standard baseline clauses (`#252A32`), amended clauses under No. 2026-01 (`#3458DB` cobalt / `#B77A24` ochre), active selected clause (`#137C72` teal).
* Direct click interaction to inspect clause text in the slide-over drawer.
* Accessible 2D list fallback toggle.
