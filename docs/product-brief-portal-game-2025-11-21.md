# Product Brief: Portal-Game

**Date:** 2025-11-21
**Author:** BMad
**Context:** game-dev hackathon

---

## Executive Summary

Portal-Game is a browser-based 3D puzzle built with React Three Fiber to showcase “wow factor” portal mechanics in a lightweight hackathon-ready package. Players shoot paired portals to solve short spatial puzzles, earn rewards, and experience a stylish low-poly world delivered entirely in Chrome. The brief captures the vision, audiences, and scope to guide the next planning steps.

---

## Core Vision

### Problem Statement

Create a fast, visually impressive browser game that proves advanced 3D mechanics (portals) can run smoothly in WebGL/R3F during a hackathon timeline.

### Why Existing Solutions Fall Short

Most portal-style experiences require native engines; browser examples are rare or visually limited. Typical web mini-games lack sophisticated spatial mechanics or the presentation needed to impress technical judges quickly.

### Proposed Solution

Lightweight React Three Fiber game with paired portals, short puzzle levels, and a reward loop (coins/skins/XP). Emphasizes render-to-texture portals, stylized low-poly art, and rapid load/play in Chrome.

### Key Differentiators

- True portal mechanic (see-through, instant traversal) in the browser.
- Low-poly, high-style presentation that loads fast.
- Hackathon-friendly: clear in 30 seconds, easy to demo, obvious technical merit.

---

## Target Users

### Primary Users

Players who enjoy spatial puzzles and quick web mini-games; they want clever mechanics and clear visual feedback.

### Secondary Users

Hackathon judges/attendees seeking a concise, impressive demo of WebGL/R3F capability.

### User Journey

Load instantly in Chrome → see portal gun and a demo portal → solve a short level using portals (learn-by-doing) → earn coins/XP → progress to next level; optional replay for faster runs or style rewards.

---

## Success Metrics

TBD (to be defined with you)

### Business Objectives

TBD

### Key Performance Indicators

TBD

---

## MVP Scope

### Core Features

- Portal gun firing paired portals with see-through RTT and traversal.
- 3–4 short low-poly puzzle levels (Level1/Level2 to start) with coins/rewards.
- Basic reward loop (coins/XP/skins) for level completion.
- Smooth Chrome desktop performance (target 60 FPS).
- Simple onboarding: learn-by-doing in the first level.

### Out of Scope for MVP

- Mobile optimization.
- Full narrative or cinematic sequences.
- Deep progression/monetization systems.

### MVP Success Criteria

- Portals render and traverse without visible jitter; RTT depth=1 acceptable.
- Levels load quickly in Chrome; players finish a level in under a few minutes.
- Reward loop triggers reliably on completion; basic upgrade hooks exist.

### Future Vision

- Additional levels and puzzle variants.
- Richer upgrades (portal range, concurrent portals, cosmetic skins).
- More advanced shaders/lighting and animation polish.

---

## Market Context

Niche: browser-based 3D puzzle/action with portal mechanics; differentiated by R3F/WebGL execution of see-through portals and hackathon-ready presentation.

## Financial Considerations

Not prioritized for MVP/hackathon; focus on demo impact over monetization. (Optional future: cosmetics/skins if desired.)

## Technical Preferences

React + React Three Fiber; Rapier physics with portal traversal math; render-to-texture portals (depth 1) with low-poly art; Vite build; Chrome desktop target.

## Organizational Context

Hackathon setting; goal to demonstrate technical/design capability quickly; easy to present in 30 seconds.

## Risks and Assumptions

- Portal jitter/performance risk; mitigate with RTT depth 1 and CCD in physics.
- Load-time risk if assets heavy; keep low-poly and lazy-load levels.
- No mobile support assumed; staying Chrome desktop.

## Timeline

Hackathon timeline; emphasize quick demo readiness over extended content.

## Supporting Materials

Technical research reference: docs/research-technical-2025-11-21.md (physics + portal render + build recommendations).

---

_This Product Brief captures the vision and requirements for Portal-Game._

_It was created through collaborative discovery and reflects the unique needs of this game-dev hackathon project._

_Next: Use the PRD workflow to create detailed product requirements from this brief._
