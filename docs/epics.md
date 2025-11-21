# portal-game - Epic Breakdown

**Author:** BMad  
**Date:** 2025-11-21  
**Project Level:** (not set)  
**Target Scale:** (hackathon scope)

---

## Overview

Epic and story breakdown derived from PRD (`docs/prd.md`) and architecture (`docs/architecture.md`). No UX design doc present yet.

---

## Functional Requirements Inventory

- FR1: Players can fire two linked portals; both are visible and updated with RTT.  
- FR2: Players and physics objects can traverse portals bidirectionally.  
- FR3: Portals enforce placement rules (valid surfaces, spacing, angle limits).  
- FR4: Portals render the paired view with recursion depth = 1.  
- FR5: Portals preserve momentum/velocity direction on traversal.  
- FR6: Portal state can be cleared/reset (e.g., level restart).  
- FR7: Game loads Level1/Level2 modules as separate R3F scenes.  
- FR8: Players can complete a level by reaching a defined goal/exit.  
- FR9: Level completion advances to the next level and records rewards.  
- FR10: Levels include interactive elements compatible with portal traversal.  
- FR11: Players earn coins/XP on level completion.  
- FR12: Reward totals persist across levels within the session.  
- FR13: Players can apply upgrades (portal range, concurrent portals).  
- FR14: Cosmetic/skin unlocks are supported as an optional reward type.  
- FR15: Players can aim and fire portals using mouse/keyboard.  
- FR16: Players can move, jump, and interact with predictable physics.  
- FR17: Quick in-level tutorial/onboarding for shooting and traversal.  
- FR18: HUD shows portal status and rewards/coins.  
- FR19: Visual style low-poly with clear silhouettes/readable surfaces.  
- FR20: Game runs in Chrome desktop without installs.  
- FR21: Levels and shared systems load via Vite build with lazy-loaded level modules.  
- FR22: Physics uses Rapier with CCD for fast-moving objects and portal math.  
- FR23: RTT portals can reduce resolution dynamically if FPS drops.  
- FR24: Playground scene for portal/physics edge cases.

---

## FR Coverage Map (Epic → FRs)

- Epic 1 – Foundation & Core Systems: FR15, FR16, FR20, FR21, FR22, FR23, FR24  
- Epic 2 – Portal Mechanics & Sandbox: FR1, FR2, FR3, FR4, FR5, FR6, FR15, FR23, FR24  
- Epic 3 – Levels & Progression: FR7, FR8, FR9, FR10, FR17, FR18, FR19, FR20, FR21  
- Epic 4 – Rewards & Upgrades: FR11, FR12, FR13, FR14, FR18  
- Epic 5 – Polish & Performance: FR17, FR18, FR19, FR23, FR24

---

## Epic 1: Foundation & Core Systems

Goal: Establish runnable Vite/React/R3F project with physics, portal scaffolding, and QA playground.

### Story 1.1: Project skeleton with Vite/R3F/Rapier
As a developer, I want a project scaffold with Vite, React, R3F, and Rapier installed, so that I can build 3D portal gameplay quickly.  
**AC:**  
- Given a fresh clone, when I run `npm install && npm run dev`, then the app builds and a basic R3F scene renders.  
- Rapier WASM loads successfully without errors.  
- Vite config supports TypeScript and aliases for core/ and levels/.  
**Prerequisites:** none  
**Technical Notes:** Base command `npm create vite@latest portal-game -- --template react-ts`; install `@react-three/fiber @react-three/drei @dimforge/rapier3d-compat`.

### Story 1.2: Core folders and shared utilities
As a developer, I want core folders for physics, portals, player, rewards, and utils, so that levels reuse shared systems.  
**AC:**  
- Core directories created per architecture structure.  
- Shared utilities export stubs for portal renderer, teleport math, rewards store, and FPS overlay.  
**Prerequisites:** 1.1  
**Technical Notes:** Match structure in `docs/architecture.md`.

### Story 1.3: Physics world bootstrap with fixed timestep and CCD
As a player, I want stable physics so that movement and portal traversal feel smooth.  
**AC:**  
- Physics world initializes with fixed timestep (e.g., 60Hz) and CCD enabled for fast bodies.  
- Physics step loop integrated with R3F render loop.  
- Telemetry/log shows physics step running without errors.  
**Prerequisites:** 1.1  
**Technical Notes:** Rapier world singleton; expose step(delta) to scenes.

### Story 1.4: Portal teleport math helper
As a developer, I want reusable teleport math, so that portals preserve orientation and velocity.  
**AC:**  
- Helper transforms pose and linear/angular velocity through paired portal transforms.  
- Teleport clears interpolation and resyncs broadphase.  
- Unit/logic test verifies velocity and orientation mapping.  
**Prerequisites:** 1.3  
**Technical Notes:** Based on tech research (Rapier + RTT depth 1).

### Story 1.5: Playground scene for QA
As a tester, I want a playground scene to stress portals and physics, so that edge cases are caught early.  
**AC:**  
- Scene loads from routes or toggle; includes test surfaces, ramps, moving objects.  
- Enables rapid portal placement and teleport loops; no crashes after 20+ teleports.  
**Prerequisites:** 1.4  
**Technical Notes:** Uses shared core; minimal art.

### Story 1.6: Performance guardrails
As a player, I want stable FPS, so that gameplay is smooth.  
**AC:**  
- Render target scaling flag exists for RTT; can reduce resolution via setting.  
- FPS overlay available in dev; logs RTT perf toggles.  
- Build remains Chrome desktop compatible; no mobile target.  
**Prerequisites:** 1.5  
**Technical Notes:** Keep RTT recursion depth = 1.

---

## Epic 2: Portal Mechanics & Sandbox

Goal: Deliver working portals with traversal, placement rules, and sandbox validation.

### Story 2.1: Portal surfaces and placement rules
As a player, I want portals only on valid surfaces, so that gameplay is predictable.  
**AC:**  
- Surfaces tagged/marked for portal placement; invalid surfaces reject with feedback.  
- Placement respects spacing/angle limits and level geometry.  
**Prerequisites:** 1.4  
**Technical Notes:** Use raycast for hit tests; maintain placement masks.

### Story 2.2: Render-to-texture portal view (depth 1)
As a player, I want to see through portals, so that I understand where I’ll exit.  
**AC:**  
- Paired cameras render RTT; recursion depth = 1.  
- Frustum clipped to portal; no obvious clipping artifacts.  
- Adjustable render target resolution.  
**Prerequisites:** 2.1  
**Technical Notes:** Shared PortalRenderer; uses Drei/Three render targets.

### Story 2.3: Bidirectional traversal with momentum preservation
As a player, I want seamless travel through portals, so that movement feels correct.  
**AC:**  
- Player and physics objects teleport between portals; momentum and orientation preserved.  
- No visible jitter during/after teleport.  
**Prerequisites:** 2.2  
**Technical Notes:** Use teleport math helper; CCD on fast bodies.

### Story 2.4: Portal state management (reset/clear)
As a player, I want to reset portals, so that I can recover from mistakes.  
**AC:**  
- Clear portals on level restart; can wipe active portals mid-level.  
- HUD/visual clearly shows portal clear/reset.  
**Prerequisites:** 2.3  
**Technical Notes:** Central portal manager; reset events propagated to render/physics.

### Story 2.5: Sandbox validation loop
As a tester, I want scripted checks, so that portal mechanics stay stable.  
**AC:**  
- Automated/scripting hook to place portals and throw rigid bodies through; logs pass/fail.  
- Runs in Playground without crashes for 20+ teleports.  
**Prerequisites:** 2.3  
**Technical Notes:** Reuse QA scene; ensure CCD toggles tested.

---

## Epic 3: Levels & Progression

Goal: Ship Level1/Level2 with goals, interactions, and HUD/tutorial.

### Story 3.1: Level loading and registry
As a player, I want the game to load Level1/Level2 scenes, so that I can play multiple puzzles.  
**AC:**  
- Levels registry loads Level1 and Level2 lazily.  
- Level switch works without reload.  
**Prerequisites:** 1.6, 2.x core stable  
**Technical Notes:** `levels/index.ts` registry; lazy imports.

### Story 3.2: Level objectives and completion
As a player, I want clear goals, so that I know when I’ve won.  
**AC:**  
- Each level has a win condition (goal/exit).  
- Completion triggers reward flow and level advance.  
**Prerequisites:** 3.1  
**Technical Notes:** Hook into rewards store; completion event bus.

### Story 3.3: Interactive elements compatible with portals
As a player, I want buttons/doors/surfaces that work with portals, so that puzzles feel coherent.  
**AC:**  
- At least one interactive element per level that remains functional with portal traversal.  
- Physics/trigger logic stable when portals are used.  
**Prerequisites:** 2.3, 3.1  
**Technical Notes:** Use triggers/colliders; test with portal teleports.

### Story 3.4: HUD for portal status and rewards
As a player, I want a HUD showing portal status and rewards, so that I can track progress.  
**AC:**  
- HUD shows portal ready/active state.  
- HUD shows current coins/XP.  
- HUD updates after completion.  
**Prerequisites:** 3.2  
**Technical Notes:** React overlay; ties to rewards store.

### Story 3.5: In-level tutorial/onboarding
As a new player, I want a quick tutorial, so that I learn shooting and traversal fast.  
**AC:**  
- First level provides inline guidance (text overlays or prompts).  
- Tutorial can be dismissed; does not block progression.  
**Prerequisites:** 3.1  
**Technical Notes:** Minimal text; keep flow short.

### Story 3.6: Visual polish (low-poly readability)
As a player, I want clear visuals, so that portals and paths are readable.  
**AC:**  
- Low-poly art applied; silhouettes are clear; portal surfaces readable.  
- Lighting supports visibility without heavy effects.  
**Prerequisites:** 3.1  
**Technical Notes:** Keep materials simple; baked lighting optional.

---

## Epic 4: Rewards & Upgrades

Goal: Coins/XP loop and upgrade hooks.

### Story 4.1: Reward accrual on completion
As a player, I want coins/XP on level completion, so that progression feels rewarding.  
**AC:**  
- Completion adds coins/XP to in-session store.  
- HUD reflects updated totals.  
**Prerequisites:** 3.2  
**Technical Notes:** Local store only.

### Story 4.2: Reward persistence across levels (session)
As a player, I want rewards to persist while I play, so that progress carries forward.  
**AC:**  
- Coins/XP persist when switching levels in-session.  
- Reset behavior documented (e.g., on full restart).  
**Prerequisites:** 4.1  
**Technical Notes:** Keep in memory/localStorage optional.

### Story 4.3: Upgrades application
As a player, I want to apply upgrades (range/portal count), so that gameplay evolves.  
**AC:**  
- Upgrade hooks adjust portal range or concurrent portal count.  
- UI to select/apply upgrade exists (minimal).  
**Prerequisites:** 4.2, 2.x mechanics working  
**Technical Notes:** Keep upgrades lightweight; adjust portal manager limits.

### Story 4.4: Cosmetic unlocks (optional)
As a player, I want cosmetic unlocks, so that I can customize visuals.  
**AC:**  
- Cosmetic system can toggle a skin/theme.  
- Does not affect mechanics.  
**Prerequisites:** 4.2  
**Technical Notes:** Simple palette/material swap.

---

## Epic 5: Polish & Performance

Goal: Performance tuning, QA hardening, and final presentation.

### Story 5.1: Performance tuning for RTT
As a player, I want smooth FPS with portals, so that gameplay feels good.  
**AC:**  
- Adjustable RTT resolution; documented settings.  
- Measured stable play with portals active.  
**Prerequisites:** 2.2, 3.x  
**Technical Notes:** Lower render target size if FPS drops.

### Story 5.2: QA hardening in Playground
As a tester, I want repeatable stress tests, so that portal physics remain stable.  
**AC:**  
- Automated/scripting pass covers 20+ teleports and object throws.  
- Logs any failures; no crashes.  
**Prerequisites:** 2.5  
**Technical Notes:** Reuse Playground hooks.

### Story 5.3: UX polish pass
As a player, I want a clear, stylish HUD and prompts, so that the game feels cohesive.  
**AC:**  
- HUD/tutorial text readable; portal surfaces visually distinct.  
- Final pass on colors/lighting for clarity.  
**Prerequisites:** 3.4, 3.5  
**Technical Notes:** Keep scope tight; no heavy effects.

---

## FR Coverage Matrix

- FR1: 2.2, 2.3  
- FR2: 2.3  
- FR3: 2.1  
- FR4: 2.2  
- FR5: 2.3  
- FR6: 2.4  
- FR7: 3.1  
- FR8: 3.2  
- FR9: 3.2, 4.1  
- FR10: 3.3  
- FR11: 4.1  
- FR12: 4.2  
- FR13: 4.3  
- FR14: 4.4  
- FR15: 1.1, 2.1  
- FR16: 1.3  
- FR17: 3.5, 5.3  
- FR18: 3.4, 4.1, 5.3  
- FR19: 3.6, 5.3  
- FR20: 1.1, 3.1  
- FR21: 1.1, 3.1  
- FR22: 1.3  
- FR23: 1.6, 2.2, 5.1  
- FR24: 1.5, 2.5

---

## Summary

Epics and stories cover all PRD FRs with actionable, single-session slices. Sequence: start with Foundation (Epic 1), deliver portal mechanics (Epic 2), ship Level1/Level2 with HUD/tutorial (Epic 3), add rewards/upgrades (Epic 4), then polish/perf (Epic 5).

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._  
_This document will be updated after UX Design and Architecture workflows to incorporate interaction details and technical decisions._
