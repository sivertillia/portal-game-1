import { create } from "zustand";

export type PortalId = "orange" | "cyan";

export const COIN_POSITIONS: [number, number, number][] = [
  [2.5, 1.2, -4],
  [-3.2, 1, -1.5],
  [0, 2, 3],
  [4, 1.5, 1.5],
  [-2, 3, 4.5],
  [1.5, 1, -6]
];

type GameState = {
  collected: Set<number>;
  shots: number;
  teleports: number;
  startTime: number;
  collectCoin: (id: number) => void;
  addShot: () => void;
  addTeleport: () => void;
  reset: () => void;
};

export const useGameStore = create<GameState>((set) => ({
  collected: new Set<number>(),
  shots: 0,
  teleports: 0,
  startTime: performance.now(),
  collectCoin: (id) =>
    set((state) => {
      if (state.collected.has(id)) return state;
      const next = new Set(state.collected);
      next.add(id);
      return { collected: next };
    }),
  addShot: () => set((state) => ({ shots: state.shots + 1 })),
  addTeleport: () => set((state) => ({ teleports: state.teleports + 1 })),
  reset: () =>
    set(() => ({
      collected: new Set<number>(),
      shots: 0,
      teleports: 0,
      startTime: performance.now()
    }))
}));
