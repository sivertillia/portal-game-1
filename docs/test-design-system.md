# System-Level Test Design – Portal-Game

## Testability Assessment
- **Controllability:** PASS with hooks. Frontend-only; can control state via fixtures and Playwright route mocks. Need `data-testid` for stable selectors; optional API seeding unused (no backend).
- **Observability:** CONCERNS. FPS/portal jitter needs in-app overlay/metrics; add console log capture on failure. No backend logs.
- **Reliability:** CONCERNS. Portal teleport math/CCD and RTT depth=1 must be validated in Playground; add scripted stress loop (20+ teleports) to guard regressions.

## Architecturally Significant Requirements (ASRs) & Risks
| Risk ID | Category | Description | Prob | Impact | Score | Mitigation |
| --- | --- | --- | --- | --- | --- | --- |
| R-001 | PERF | Portal RTT/jitter causes <60 FPS or visual artifacts | 2 | 3 | 6 | FPS overlay; adjustable RT resolution; RTT-depth=1 tests in Playground; perf smoke in CI (headless) |
| R-002 | REL | Teleport math/CCD errors cause physics glitches or tunneling | 2 | 2 | 4 | Unit tests for transform/velocity; integration teleport loop; CCD on fast bodies |
| R-003 | BUS | Level progression/rewards mismatch (coins/XP not persisted in-session) | 2 | 2 | 4 | Integration tests for reward store; HUD asserts; reset behavior documented |
| R-004 | UX | Tutorial/HUD unclear; portal placement affordances not visible | 1 | 2 | 2 | Component/E2E checks for hints, HUD states, portal surface readability |
| R-005 | OPS | Missing test artifacts/selector strategy → flaky UI tests | 2 | 2 | 4 | Enforce `data-testid`; failure-only artifacts; network-first patterns |

## Test Levels Strategy (evidence: R3F frontend only, no backend yet)
- **Unit (logic/math):** ~50% — teleport math, RTT config toggles, reward-store logic, placement rules, upgrade hooks.
- **Integration (Playwright API/route stubs):** ~25% — portal traversal with mocked physics hooks, reward persistence across level switches, HUD updates, tutorial gating.
- **Component (CT or Playwright CT):** ~15% — HUD, tutorial prompts, portal UI states.
- **E2E (Playwright UI, static host):** ~10% — Level1/Level2 flow, portal placement + traversal + completion, reward accrual, reset/clear portals, Playground stress sanity.

## NFR Testing Approach
- **Performance:** Headless Playwright smoke to assert FPS hint (via overlay metric) and RTT resolution toggle; keep RTT depth=1. Optional k6 skipped (no backend).
- **Reliability:** Error handling for missing assets; portal traversal stress (20+ teleports) in Playground; reset/clear paths; CCD enabled.
- **Security:** Minimal (no backend); verify no sensitive data in console/artifacts; ensure route mocks not leaking secrets.
- **Maintainability:** Enforce selector strategy (`data-testid`), artifact capture on failure, no hard waits, network-first waits; keep tests <1.5m, <300 LOC; fixtures with cleanup.

## Test Environment Requirements
- Static host of app; `BASE_URL` set (e.g., http://localhost:3000). No backend required; API_URL optional for future seeding.
- Playwright headless CI run; allow route mocks/stubs. Enable FPS overlay in app for perf assertions.

## Testability Concerns
- FPS/jitter metrics must be exposed in UI (overlay or log); otherwise perf assertions are guesswork.
- Needs consistent `data-testid` across HUD/tutorial/portal surfaces.
- No backend: reward persistence is front-end only; if backend arrives, revisit factories/cleanup.

## Recommendations for Sprint 0
- Add FPS/portal debug overlay + `data-testid` hooks; expose RTT resolution toggle.
- Add unit tests for teleport transform/velocity and placement rules.
- Add Playground scripted stress (20+ teleports + rigid bodies) as an integration/E2E check.
- Keep failure artifacts on (trace/screenshot/video on failure in `playwright.config.ts`); enforce network-first waits.
- Document selector strategy in contributing/testing doc; avoid hard waits.
