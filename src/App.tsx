import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import Experience from "./scene/Experience";

const accentColors = ["#64d5ff", "#f8b26a", "#a78bfa", "#22d3ee"];

function StatChip({
  label,
  value,
  accentIndex
}: {
  label: string;
  value: string | number;
  accentIndex?: number;
}) {
  const accent = accentColors[accentIndex ?? 0];
  return (
    <div className="stat-chip" style={{ borderColor: accent }}>
      <span className="stat-label">{label}</span>
      <span className="stat-value" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}

export default function App() {
  const [locked, setLocked] = useState(false);
  const [now, setNow] = useState(() => performance.now());
  const startTime = useMemo(() => performance.now(), []);
  const elapsed = useMemo(() => ((now - startTime) / 1000).toFixed(1) + "s", [now, startTime]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(performance.now()), 120);
    return () => window.clearInterval(timer);
  }, [startTime]);

  return (
    <div className="page">
      <div className="hud">
        <div className="logo">Sandbox Walk</div>
        <div className="stats">
          <StatChip label="Mode" value="Empty space" accentIndex={0} />
          <StatChip label="Pointer" value={locked ? "Locked" : "Click to lock"} accentIndex={1} />
          <StatChip label="Runtime" value={elapsed} accentIndex={2} />
        </div>
      </div>

      <div className="canvas-shell">
        <Canvas
          shadows
          camera={{ position: [0, 1.6, 8], fov: 70, near: 0.1, far: 200 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#060915"]} />
          <fog attach="fog" args={["#060915", 20, 85]} />
          <Suspense
            fallback={
              <Html>
                <div className="loader">Booting portal renderer...</div>
              </Html>
            }
          >
            <Experience onLockChange={setLocked} />
          </Suspense>
        </Canvas>
        <div className="overlay-card">
          <div className="overlay-title">Controls</div>
          <div className="overlay-grid">
            <span>Move</span>
            <strong>W A S D</strong>
            <span>Jump</span>
            <strong>Space</strong>
            <span>Sprint</span>
            <strong>Shift</strong>
            <span>Reset</span>
            <strong>R (reserved)</strong>
          </div>
          <div className="lock-status">
            Pointer lock: <span className={locked ? "ok" : "off"}>{locked ? "engaged" : "click viewport"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
