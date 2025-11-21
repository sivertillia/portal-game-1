# Portal-Game - Product Requirements Document

**Author:** BMad
**Date:** 2025-11-21
**Version:** 0.1 (manual PRD substitute; BMGD module unavailable locally)

---

## Executive Summary

Portal-Game is a browser-based 3D puzzle built with React Three Fiber to showcase portal mechanics (see-through, instant traversal) in a fast, stylish hackathon-ready experience. Players shoot paired portals to solve compact spatial puzzles, earn rewards, and progress through low-poly levels running smoothly in Chrome.

### What Makes This Special

- True render-to-texture portals with traversal in the browser (R3F/WebGL).
- Quick-load, low-poly presentation with immediate “wow” demo value.
- Hackathon-friendly scope: clear in seconds, playable within minutes.

---

## Project Classification

**Technical Type:** game (portal puzzle, browser)  \
**Domain:** gaming  \
**Complexity:** handled via manual PRD (BMGD module unavailable)

Context sources: product brief (`docs/product-brief-portal-game-2025-11-21.md`), technical research (`docs/research-technical-2025-11-21.md`).

---

## Success Criteria

- 60 FPS target on recent Chrome desktop with portals active (RTT depth 1).
- Portal traversal feels stable (no visible jitter) across 20+ teleports in QA.
- Levels load quickly; a player can finish a level within a few minutes.
- Reward loop (coins/XP/skins) triggers reliably on level completion.
- Level modules (Level1/Level2) are reusable; adding Level3+ does not alter shared core.

---

## Product Scope

### MVP

- Portal gun firing paired portals with see-through RTT and traversal.
- 3–4 short low-poly puzzle levels (Level1/Level2 to start) with coins/rewards.
- Basic reward loop (coins/XP/skins) and upgrade hooks (range, concurrent portals).
- Smooth Chrome desktop performance; simple learn-by-doing onboarding.

### Growth (Post-MVP)

- Additional level packs and puzzle variants.
- Richer upgrades (portal range, concurrent portals, cosmetics).
- More advanced shaders/lighting/animation polish.

### Vision (Future)

- Expanded content cadence; analytics-informed tuning.
- Optional multiplayer/ghost racing; leaderboards; speedrun modes.

---

## Innovation & Novel Patterns

- Browser-native portal rendering and traversal using R3F with RTT depth 1.
- Lightweight hackathon-friendly build demonstrating complex 3D mechanics.

### Validation Approach

- Playtest portal stability in a playground scene (rapid teleports, edge cases).
- Measure FPS with portals active; adjust render target resolution if needed.

---

## Functional Requirements

**Portal Mechanics**
- FR1: Players can fire two linked portals; both are visible and updated with RTT.
- FR2: Players and physics objects can traverse portals bidirectionally.
- FR3: Portals enforce placement rules (valid surfaces, spacing, angle limits).
- FR4: Portals render the paired view with recursion depth = 1.
- FR5: Portals preserve momentum/velocity direction on traversal.
- FR6: Portal state can be cleared/reset (e.g., level restart).

**Levels & Progression**
- FR7: Game loads Level1/Level2 modules as separate R3F scenes.
- FR8: Players can complete a level by reaching a defined goal/exit.
- FR9: Level completion advances to the next level and records rewards.
- FR10: Levels include interactive elements (e.g., buttons/doors/surfaces) compatible with portal traversal.

**Rewards & Upgrades**
- FR11: Players earn coins/XP on level completion.
- FR12: Reward totals persist across levels within the session.
- FR13: Players can apply upgrades (e.g., portal range, concurrent portals) when available.
- FR14: Cosmetic/skin unlocks are supported as an optional reward type.

**Controls & Interaction**
- FR15: Players can aim and fire portals using standard mouse/keyboard controls.
- FR16: Players can move, jump, and interact with level elements with predictable physics.

**UX & Presentation**
- FR17: A quick in-level tutorial/onboarding introduces shooting and traversal.
- FR18: HUD shows portal status and current rewards/coins.
- FR19: Visual style is low-poly with clear silhouettes and readable portal surfaces.

**Tech/Build/Performance**
- FR20: Game runs in Chrome desktop without additional installs.
- FR21: Levels and shared systems load via Vite build with lazy-loaded level modules.
- FR22: Physics uses Rapier with CCD for fast-moving objects and portal traversal math.
- FR23: Render-to-texture portals can reduce resolution dynamically if FPS drops.
- FR24: A playground scene exists for testing portal/physics edge cases.

---

## Non-Functional Requirements

### Performance
- Target 60 FPS on recent Chrome desktops; RTT depth 1; configurable render target resolution.

### Compatibility
- Chrome desktop (WebGL/R3F). Mobile is out of scope for MVP.

### Resilience/Stability
- Portal traversal should avoid visible jitter; CCD enabled for fast bodies.
- Physics remains stable across 20+ teleports in test scenes.

### Build/Deploy
- Vite build with lazy-loaded levels; manageable bundle including Rapier WASM.

### Accessibility/UX
- Clear contrast and readable surfaces; minimal text; intuitive controls with a short tutorial.

---

## Risks and Assumptions

- Risk: Portal jitter/perf under load → Mitigation: RTT depth 1, lower render target resolution, CCD, playground test scene.
- Risk: Bundle/init weight (Rapier WASM) → Mitigation: preload WASM on splash; keep assets low-poly.
- Assumption: Chrome desktop only; no mobile support.
- Assumption: No backend dependencies for MVP (local state sufficient).

---

## Supporting Materials

- Product brief: `docs/product-brief-portal-game-2025-11-21.md`
- Technical research: `docs/research-technical-2025-11-21.md`

---

_This PRD is a manual substitute for the BMGD flow (game module unavailable locally). It captures the core requirements to advance toward architecture, design, and epics._
