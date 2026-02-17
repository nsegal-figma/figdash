# Project Retrospective

**Project:** FigDash - Survey Analytics Dashboard Visualization Enhancement
**Date:** February 2026
**Scope:** 12 epics, 73 stories (56 completed, 11 eliminated, 6 doc/process)

---

## Key Decisions

### 1. Stayed with Recharts (vs. Visx or Tremor)
**Context:** The PRD originally planned evaluation and potential migration to Visx or Tremor.
**Decision:** Stay with Recharts 3.3.0.
**Reason:** Neither Visx nor Tremor support React 19.1.1. Recharts works out of the box.
**Impact:** Eliminated Epic E11 (Migration) entirely — 11 stories / 42 story points saved. Simplified many E4-E7 stories.

### 2. Runtime Theme System (vs. CSS Variables / Tailwind Config)
**Decision:** Built a full runtime JS theme system with live editing.
**Reason:** Needed theme export/import for Figma integration and live preview in the editor.
**Trade-off:** More complex than CSS vars, but enables features like theme sharing that CSS-only can't do.

### 3. Chart Type Recommendation Engine
**Decision:** Built a data-aware recommendation engine instead of fixed chart types per question.
**Reason:** Survey data varies widely — ordinal scales, categorical data, numeric ranges all need different visualizations. Automated recommendations remove the guesswork.

### 4. Visual Storytelling as an Overlay
**Decision:** Storytelling mode uses annotation overlays rather than separate "insight cards."
**Reason:** Keeps annotations spatially connected to the data they describe. Users can edit and remove individual annotations.

### 5. Code Splitting with Lazy Routes
**Decision:** Lazy-load all three pages, split vendor chunks (React, Recharts, Framer Motion, analytics).
**Result:** Main bundle went from 1.7MB single chunk to well-distributed chunks, none over 500KB.

---

## What Went Well

1. **Design system foundation** — Building tokens, primitives, and themes first made all subsequent chart work consistent.
2. **Test coverage** — 348 tests across 18 files covering design tokens, chart primitives, and components. Caught regressions early.
3. **Recharts decision** — Avoiding a library migration saved significant effort and risk with zero feature compromise.
4. **Theme system** — The runtime theme editor became a standout feature for Figma integration workflows.
5. **Chart recommendation engine** — Analyzing data characteristics (cardinality, ordinal detection, distribution shape) provides genuinely useful suggestions.

## What Could Be Improved

1. **Story refinement** — The E12 (Polish) stories were stubs with placeholder acceptance criteria. More upfront refinement would have given clearer targets.
2. **Storybook coverage** — The charts-v2 primitives have stories, but the themed chart components and newer features (ChartTypeSelector, storytelling) need more Storybook coverage.
3. **Bundle size** — Recharts (337KB) and Framer Motion (116KB) are large dependencies. Tree-shaking could potentially reduce these, or lighter alternatives could be evaluated.
4. **End-to-end tests** — Unit tests are solid, but no E2E tests exist. Playwright or Cypress would catch integration issues.

---

## Metrics

| Metric | Value |
|--------|-------|
| Total stories planned | 73 |
| Stories completed | 56 (77%) |
| Stories eliminated (E11 migration) | 11 |
| Remaining (E12 doc/process) | 6 |
| Test files | 18 |
| Tests passing | 348 |
| Build time | ~2.6s |
| Test suite time | ~1.8s |
| Largest chunk (gzipped) | 144KB (Dashboard) |
| Color palettes | 8 |
| Chart types implemented | 5 (H-bar, V-bar, Pie, Donut, Lollipop) |
| Preset themes | 4+ |

---

## Recommendations for Future Work

1. **End-to-end testing** with Playwright — especially for upload flow and export features
2. **Treemap / Waffle chart** types for part-to-whole with many categories
3. **Dashboard layout customization** — drag-to-reorder charts
4. **Collaborative themes** — shareable theme URLs
5. **Data caching** — persist uploaded data in IndexedDB for revisiting dashboards
