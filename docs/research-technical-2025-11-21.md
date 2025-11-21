# Technical Research Report: {{technical_question}}

**Date:** {{date}}
**Prepared by:** {{user_name}}
**Project Context:** {{project_context}}

---

## Executive Summary

Recommendations (offline; verify versions when network allowed)

Top Recommendation:
- Physics: Rapier (`@dimforge/rapier3d-compat`), fixed timestep, CCD enabled for fast objects. Implement portal traversal by transforming position/orientation/velocities through portal matrices and syncing broadphase; pause interpolation during teleport to avoid jitter.
- Portals: Render-to-texture per portal with paired cameras; recursion depth 1; clip plane/frustum to portal; reduce render target resolution if FPS drops; stencil fallback only if RTT perf is insufficient.
- Build/scene: Vite + React + R3F; modular levels (`Level1.tsx`, `Level2.tsx`) exporting scene graphs; shared core for player/portal/physics utilities; lazy-load levels; CSR is fine for hackathon.
- Animation readiness: Keep GLTF loader + animation mixer utilities shared; ensure physics update and animation update are decoupled; add hooks for character controller if animations added later.

Alternative Options:
- Cannon-es if you need fastest integration and smallest bundle, at cost of stability/perf; mitigate by smaller timesteps and strict teleport handling.
- Ammo.js if you need Bullet feature parity and can afford heavier WASM/init; more boilerplate.

### Key Recommendation

**Primary Choice:** [Technology/Pattern Name]

**Rationale:** [2-3 sentence summary]

**Key Benefits:**

- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

---

## 1. Research Objectives

### Technical Question

Compare physics stack choices for portal-enabled character control and collisions, and define scene/build architecture for multiple React Three Fiber levels (Level1/Level2) that supports render-to-texture portals and future animation.

### Project Context

React Three Fiber browser portal game for a hackathon: low-poly style, 3–4 short portal puzzle levels, portal gun with coins/upgrades, runs in Chrome desktop, needs Level1/Level2 scene files and performant portal rendering.

### Requirements and Constraints

#### Functional Requirements

Functional Requirements (agreed):
- Portal gun fires paired portals; player and physics objects can traverse.
- 3–4 short puzzle levels (Level1/Level2 initially) with coins/rewards per completion.
- Upgrades: portal range and concurrent portal count.
- Level files are modular components (one per level) with shared utilities.
- Scene supports render-to-texture portal view.

#### Non-Functional Requirements

Non-Functional Requirements (agreed):
- Performance: smooth 60 FPS on recent Chrome desktop, low-poly assets.
- Stability: portal traversal without jitter; physics stable through portals.
- Build: fast dev build (Vite/Next option), predictable bundle and asset loading.
- Extensibility: easy to add Level3+/upgrades.

#### Technical Constraints

Technical Constraints (agreed):
- Runtime: Chrome desktop (WebGL via R3F/Three.js). Mobile not in scope.
- Physics: choose viable engine (Rapier vs Cannon vs Ammo) with portal support approach.
- Rendering: render-to-texture portal technique; manage recursion depth and performance.
- Hosting/SSR: CSR acceptable; SSR only if desired for routing/SEO (likely not critical for hackathon).

---

## 2. Technology Options Evaluated

Physics and Rendering Options (offline draft — live versions pending web verification):

- Rapier (WASM, rust-based): High performance and stability; good for character controllers; needs portal-aware transform of velocities/forces on traversal; smaller bundle than Ammo; JS bindings via @dimforge/rapier3d-compat.
- Cannon-es (JS): Simpler API; slower and less stable at high speeds; portal traversal needs custom teleport handling, potential jitter under load; fewer constraints features than Rapier/Ammo.
- Ammo.js (Bullet WASM): Feature-rich, but heavier and slower to initialize; workable character controller; more complexity; larger bundle impact.
- Portal rendering: render-to-texture per portal with paired cameras and clipped frustums; limit recursion depth to 1 for perf; stencil/mask fallback if RTT too heavy.
- Scene/build: Vite + React + R3F, modular level files (Level1.tsx, Level2.tsx) exporting scene graphs; shared core for player/portals/physics; lazy-load levels; optional Next only if routing/SSR needed (not critical for hackathon).

---

## 3. Detailed Technology Profiles

### Option 1: Rapier (WASM, rust-based)

- Overview: High-performance physics with JS bindings (`@dimforge/rapier3d-compat`); smaller WASM than Ammo; good stability for character controllers.
- Portal handling: On traversal, rebase body transform through portal matrix; rotate linear/angular velocity; re-sync broadphase to avoid tunneling; use CCD for fast projectiles; disable interpolation during teleport to prevent jitter.
- Dev experience: Modern API with explicit fixed-step simulation; WASM init cost but modest; good collision layers; kinematic controllers available.
- Performance: Typically fastest of the three; supports larger solver iterations without big perf hit; good sleeping behavior.
- Risks: Portal math must be done carefully (teleport + velocity transform); fewer community examples than Cannon; version verification pending (offline).
- Bundle/init: WASM fetch/init required; smaller than Ammo; larger than pure JS.

### Option 2: Cannon-es (JS)

- Overview: Pure JS port of Cannon; simple API; easy to wire to R3F without WASM.
- Portal handling: Manual teleport of position/velocity; more jitter under high speed; limited constraints compared to Rapier/Ammo; solver drift if step too large.
- Dev experience: Easiest API; no WASM init; integrates with R3F helpers; fewer advanced features.
- Performance: Slower at high object counts/high-speed collisions; may need smaller timesteps to stay stable.
- Risks: Stability through portals less robust; energy drift; fewer modern updates; version verification pending (offline).
- Bundle/init: Smallest bundle footprint (no WASM).

### Option 3: Ammo.js (Bullet WASM)

- Overview: Bullet via WASM; feature-rich; heavier to initialize; more verbose API.
- Portal handling: Teleport feasible but requires careful transform of velocities; re-adding bodies may be needed for stability; good CCD support.
- Dev experience: More boilerplate; callback-heavy; type ergonomics weaker; larger API surface.
- Performance: Stable but heavier; slower init; runtime perf acceptable but below Rapier for equivalent scenes; bundle hit notable.
- Risks: Higher complexity; integration overhead; version verification pending (offline).
- Bundle/init: Largest WASM and init time of the three.

---

## 4. Comparative Analysis

Comparative Analysis (offline draft; verify with live data when network allowed)

- Performance: Rapier (High), Ammo (Med-High, heavier init), Cannon (Med-Low).
- Stability through portals: Rapier (High with correct transform + CCD), Ammo (High but heavier), Cannon (Low-Med; jitter risk).
- Dev experience: Cannon (Easy), Rapier (Moderate), Ammo (Harder).
- Bundle/init: Cannon (Smallest, no WASM), Rapier (Small WASM), Ammo (Largest WASM/init).
- Portal integration complexity: Rapier (Medium: math + broadphase sync), Cannon (Medium-High: jitter mitigation), Ammo (High: API verbosity + init).
- Community/examples for portals: Cannon (more community snippets), Rapier (growing but fewer portal examples), Ammo (scattered Bullet refs).

### Weighted Analysis

**Decision Priorities (ordered):** performance, portal visual quality, ease of integration

Weighted Assessment (offline, heuristic):
- Rapier: High performance; portal RTT quality intact; integration moderate (portal math needed). Net: Strong fit.
- Cannon-es: Medium-low performance; RTT fine but jitter risk; integration easiest. Net: Weak on perf/portal stability.
- Ammo.js: Medium-high stability; RTT fine; integration hardest; heavier init. Net: Slower dev, heavier bundle.
- Portal rendering: RTT depth 1 preserves quality; stencil fallback improves perf but loses visual fidelity.
- Build: Vite + modular levels → easy integration; Next unnecessary unless SSR needed.

---

## 5. Trade-offs and Decision Factors

Trade-offs and Use-Case Fit (portal R3F game, Hackathon, Chrome desktop)

- Performance vs Complexity: Rapier gives best perf/stability; requires correct teleport math (position, rotation, velocity) and CCD. Cannon easier but risks jitter at high speed. Ammo stable but heavier.
- Bundle/init vs Features: Cannon smallest but limited; Rapier modest WASM; Ammo largest. For hackathon speed, Rapier balances perf/size.
- Portal rendering cost: RTT per portal; keep recursion depth 1; cap active portals; reduce render target size if FPS drops; stencil fallback is cheaper but loses through-portal parallax.
- Scene architecture: Modular levels with shared core keeps Level1/Level2 lean; lazy-load levels to reduce initial bundle; shared physics/portal utilities avoid duplication.
- Build pipeline: Vite for fast rebuilds; Next only if SSR/routing/SEO required (not critical here).

---

## 6. Real-World Evidence

Real-World Evidence (offline placeholders; needs live URLs when network allowed)
- Rapier: community reports note strong perf/stability vs Cannon; fewer portal-specific examples; WASM init small; character controller stable with CCD.
- Cannon-es: many indie/R3F examples; portal jitter reports at high speed unless step is small; easiest to wire.
- Ammo.js: used in some three.js demos; heavier init; stable CCD; more boilerplate.

---

## 7. Architecture Pattern Analysis

Architecture Pattern Analysis (lightweight for this scope)
- Pattern: Componentized level scenes with shared core systems.
- When to use: Small number of levels, need fast iteration; fits hackathon timeline.
- Implementation: `Level1.tsx`/`Level2.tsx` export scene graphs; central `GameCore` wires physics world, player controller, portal manager; lazy-load levels.
- Trade-offs: Minimal SSR; CSR acceptable; keep portal manager isolated for reuse; add playground scene for QA.

---

## 8. Recommendations

{{recommendations}}

### Implementation Roadmap

1. **Proof of Concept Phase**
   - Implement portal manager with RTT depth=1 and teleport math (pose + velocity transform).
   - Wire Rapier physics world (fixed timestep, CCD on fast bodies).
   - Build Level1/Level2 components using shared core; add coins/rewards.
   - Add playground scene to stress-test portal traversal and physics stability.

2. **Key Implementation Decisions**
   - Pick portal render target resolution and update strategy (per-frame vs on-demand).
   - Choose player controller approach (kinematic vs dynamic with CCD).
   - Define teleport handling: clear interpolation, resync broadphase, transform velocity/angular velocity.
   - Decide on build: Vite (default) vs Next (only if routing/SSR needed).

3. **Migration Path** (if applicable)
   - [Migration approach from current state]

4. **Success Criteria**
   - 60 FPS on Chrome desktop in Level1/Level2 with RTT portals active, recursion depth=1.
   - Portal traversal: no visible jitter/physics glitches across 20+ teleports in QA playground.
   - Physics stability: stacked objects stay stable; CCD prevents tunneling at portal edges.
   - Build time: dev reloads fast (Vite); bundle size acceptable with Rapier WASM.
   - Level modularity: Level1/Level2 load via lazy boundary; shared core unchanged when adding Level3.

### Risk Mitigation

- Portal physics jitter: use CCD; on teleport, clear interpolation, reinsert into broadphase, and transform linear/angular velocity via portal frame.
- RTT performance: cap recursion to 1; reduce render target size or update frequency; fallback to stencil if FPS drops.
- WASM init latency (Rapier): preload WASM on splash; show loading state; keep physics world singleton.
- Regression risk: add a playground scene to stress-test portal traversal and physics contact stability before level shipping.

---

## 9. Architecture Decision Record (ADR)

ADR-001: Physics + Portal Rendering Stack for R3F Portal Game

Status: Proposed

Context:
- React Three Fiber portal puzzle game (Chrome desktop, hackathon).
- Requirements: RTT portals, stable physics traversal, modular Level1/Level2.
- Priorities: performance, portal visual quality, ease of integration.

Decision:
- Use Rapier (`@dimforge/rapier3d-compat`) with fixed timestep and CCD for fast bodies.
- Implement portal traversal by transforming pose + linear/angular velocity through portal matrices; clear interpolation; resync broadphase post-teleport.
- Use render-to-texture portals with paired cameras, recursion depth 1; clip frustum to portal bounds; lower render target res if FPS drops; stencil fallback only if needed.
- Build with Vite + React + R3F; modular levels (`Level1.tsx`/`Level2.tsx`); shared core for player/portal/physics utilities; lazy-load levels; CSR acceptable.

Consequences:
- Pros: High perf/stability; good portal fidelity; fast dev/build; modular levels; manageable bundle (Rapier WASM modest).
- Cons: Portal math requires care; WASM init step; fewer portal examples for Rapier; offline references pending live verification.
- Alternatives: Cannon-es (easier, less stable/perf); Ammo.js (heavier, more boilerplate).

### Risk Mitigation

{{risk_mitigation}}

---

## 9. Architecture Decision Record (ADR)

{{architecture_decision_record}}

---

## 10. References and Resources

### Documentation

- (Offline) Rapier docs: pending live URL check
- (Offline) Cannon-es docs: pending live URL check
- (Offline) Ammo.js/Bullet docs: pending live URL check

### Benchmarks and Case Studies

- (Offline) Portal demos with RTT: needs live links
- (Offline) Rapier vs Cannon perf comparisons: needs live links

### Community Resources

- (Offline) R3F portal examples: needs live links
- (Offline) Rapier community discussions: needs live links
- (Offline) Cannon-es community threads: needs live links

### Additional Reading

- (Offline) Portal rendering techniques in Three.js: needs live links

---

## Appendices

### Appendix A: Detailed Comparison Matrix

[Full comparison table with all evaluated dimensions]

### Appendix B: Proof of Concept Plan

[Detailed POC plan if needed]

### Appendix C: Cost Analysis

[TCO analysis if performed]

---

## References and Sources

**CRITICAL: All technical claims, versions, and benchmarks must be verifiable through sources below**

### Official Documentation and Release Notes

{{sources_official_docs}}

### Performance Benchmarks and Comparisons

{{sources_benchmarks}}

### Community Experience and Reviews

{{sources_community}}

### Architecture Patterns and Best Practices

{{sources_architecture}}

### Additional Technical References

{{sources_additional}}

### Version Verification

- **Technologies Researched:** {{technology_count}}
- **Versions Verified ({{current_year}}):** {{verified_versions_count}}
- **Sources Requiring Update:** {{outdated_sources_count}}

**Note:** All version numbers were verified using current {{current_year}} sources. Versions may change - always verify latest stable release before implementation.

---

## Document Information

**Workflow:** BMad Research Workflow - Technical Research v2.0
**Generated:** {{date}}
**Research Type:** Technical/Architecture Research
**Next Review:** [Date for review/update]
**Total Sources Cited:** {{total_sources}}

---

_This technical research report was generated using the BMad Method Research Workflow, combining systematic technology evaluation frameworks with real-time research and analysis. All version numbers and technical claims are backed by current {{current_year}} sources._

---

## Research Type Discovery

- research_type: technical
- research_mode: technical
- web_research: requested (needs network approval to execute searches)
