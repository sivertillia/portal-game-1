# Architecture

## Executive Summary

Portal-Game uses a Vite + React + React Three Fiber stack with Rapier physics and render-to-texture portals (depth 1) for a low-poly, hackathon-ready 3D puzzle experience. Architecture focuses on predictable performance (Chrome desktop), clear module boundaries (shared core + per-level scenes), and consistent implementation patterns to keep AI agents aligned.

Project initialization uses manual Vite/R3F setup (no starter CLI). Base command (for reference): `npm create vite@latest portal-game -- --template react-ts` followed by adding `@react-three/fiber`, `@react-three/drei`, and `@dimforge/rapier3d-compat`.

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Build | Vite + React + TypeScript | pending verification | All | Fast dev, simple CSR; no SSR needed |
| 3D/Render | React Three Fiber + Drei helpers; RTT portals depth=1 | pending verification | All | Direct Three.js integration; portal fidelity |
| Physics | Rapier (WASM) with CCD for fast bodies | pending verification | All | Stability/perf for portal traversal |
| Portal render | RTT per portal, recursion depth 1; clip frustum; lower RT res if FPS drops | n/a | All | Fidelity with perf guardrails |
| Levels | Modular scenes `Level1.tsx`/`Level2.tsx`, lazy-loaded | n/a | Puzzles | Reuse core systems; fast iter |
| State | React state per scene; shared stores for rewards/upgrades; keep local (no backend) | n/a | Rewards | Simplicity for hackathon scope |
| Assets | Low-poly GLTF; lazy-load; shared materials | n/a | All | Perf and load time |
| Testing | Playground scene for portal/physics QA; manual QA focus | n/a | All | Stability of portals under stress |
| Logging | Console during dev; optional lightweight in-app overlay for FPS/portal debug | n/a | All | Quick diagnostics |
| Error handling | In-app toasts for recoverable issues; fail fast on init errors | n/a | All | Fast feedback |
| Naming | Plural REST (if added), kebab-case files, PascalCase components, snake_case shader vars | n/a | All | Consistency guardrails |

## Project Structure

```
portal-game/
  docs/
    prd.md
    product-brief-portal-game-2025-11-21.md
    research-technical-2025-11-21.md
  src/
    main.tsx
    index.css
    app/
      App.tsx
      routes/            # (if routing added later)
    core/
      physics/
        world.ts         # singleton Rapier world setup, step loop
        portal-teleport.ts# pose/velocity transform + CCD helpers
        types.ts
      portals/
        PortalRenderer.tsx# RTT camera setup, clip planes, depth=1
        PortalSurface.tsx
      player/
        PlayerController.tsx # movement + portal firing
      rewards/
        useRewardsStore.ts   # coins/XP/skins state (local)
      utils/
        fpsOverlay.tsx
        gltfLoader.ts
    levels/
      Level1.tsx
      Level2.tsx
      index.ts           # registry for lazy loading
    scenes/
      Playground.tsx     # QA scene for portal/physics stress
    styles/
      global.css
    assets/
      models/
      textures/
    config/
      constants.ts
  package.json
  tsconfig.json
  vite.config.ts
```

## Epic to Architecture Mapping

| Item | Module/Area |
| --- | --- |
| Portal mechanics (FR1–FR6) | core/portals, core/physics |
| Levels & progression (FR7–FR10) | levels/, app/App.tsx routing/load |
| Rewards & upgrades (FR11–FR14) | core/rewards, PlayerController hooks |
| Controls & interaction (FR15–FR16) | core/player, core/physics |
| UX & presentation (FR17–FR19) | app/App.tsx, core/portals, styles/ |
| Tech/perf (FR20–FR24) | core/physics, core/portals, scenes/Playground |

## Technology Stack Details

### Core Technologies

- Vite + React + TypeScript (CSR)
- React Three Fiber + Drei
- Rapier physics (`@dimforge/rapier3d-compat`) with CCD
- GLTF assets (low-poly)
- No backend for MVP (local state)

### Integration Points

- Portals ↔ Physics: teleport hook transforms pose/velocity; CCD enabled for fast bodies.
- Levels ↔ Core: levels import shared core systems; lazy-loaded in App.
- Rewards ↔ Player: hooks in PlayerController update rewards store on completion.
- Playground ↔ Core: uses same portal/physics stack for stress testing.

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

- File naming: kebab-case files; PascalCase components; tests co-located as `*.test.tsx`.
- Portal RTT: recursion depth 1; clip frustum to portal; adjustable render target resolution; stencil as fallback only if perf demands.
- Physics: fixed timestep; CCD on fast bodies; teleport clears interpolation and resyncs broadphase; transform linear/angular velocity through portal basis.
- State: React hooks/local stores; no backend; reward state in `useRewardsStore`.
- Assets: low-poly GLTF; lazy-load via loader util; shared materials where possible.
- Logging: console + optional FPS overlay in dev.
- Error handling: in-app notices for recoverable issues; fail fast on init errors.

## Consistency Rules

### Naming Conventions
- Components: PascalCase (`PortalRenderer.tsx`)
- Files: kebab-case where not components (`portal-teleport.ts`)
- Routes (if added): kebab-case paths
- Shaders/uniforms: snake_case
- APIs (if added): plural REST, kebab/param ids as `:id`, JSON dates ISO

### Code Organization
- Feature-first where possible (core/, levels/, scenes/)
- Co-locate tests with source
- Shared utilities in core/utils

### Error Handling
- User-facing toasts/messages for recoverable issues
- Fail fast on init (WASM load) with clear message

### Logging Strategy
- Dev: console + FPS overlay; no production logger needed for MVP

## Data Architecture

- Local-only state; rewards/XP tracked in front-end store.
- Portal/physics state maintained in memory; no persistence.

## API Contracts

- None for MVP; if added, use JSON, ISO dates, `{data, error}` envelope.

## Security Architecture

- Local game; no auth for MVP. If/when network added: JWT/Bearer with HTTPS.

## Performance Considerations

- Target 60 FPS Chrome desktop; RTT depth 1; dynamic render target sizing; low-poly assets; lazy-loaded levels; CCD for fast bodies.

## Deployment Architecture

- Static build via Vite; host on static hosting/CDN; Chrome desktop target.

## Development Environment

### Prerequisites
- Node.js LTS, npm

### Setup Commands

```bash
npm create vite@latest portal-game -- --template react-ts
cd portal-game
npm install @react-three/fiber @react-three/drei @dimforge/rapier3d-compat
npm install
npm run dev
```

## Architecture Decision Records (ADRs)

- ADR-PRD-001: Manual PRD substitute (BMGD unavailable); portal R3F game scope.
- ADR-ARCH-001: Vite + React + R3F + Rapier + RTT portals depth 1; modular levels with shared core; local-only state; Chrome desktop target.

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-21_
_For: BMad_
