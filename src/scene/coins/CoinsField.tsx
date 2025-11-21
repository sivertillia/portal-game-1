import { Float, Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { COIN_POSITIONS, useGameStore } from "../../state/gameStore";

export function CoinsField() {
  const collected = useGameStore((state) => state.collected);
  const collectCoin = useGameStore((state) => state.collectCoin);

  return (
    <group>
      {COIN_POSITIONS.map((pos, idx) => (
        <Coin
          key={idx}
          id={idx}
          position={pos}
          active={!collected.has(idx)}
          onCollect={() => collectCoin(idx)}
        />
      ))}
    </group>
  );
}

function Coin({
  id,
  position,
  active,
  onCollect
}: {
  id: number;
  position: [number, number, number];
  active: boolean;
  onCollect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const pos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((_, delta) => {
    if (!meshRef.current || !active) return;
    meshRef.current.rotation.y += delta * 1.5;
    meshRef.current.position.y = pos.y + Math.sin(performance.now() * 0.003 + id) * 0.1;

    if (camera.position.distanceTo(meshRef.current.position) < 1.1) {
      onCollect();
    }
  });

  return (
    <Float floatIntensity={1} speed={1.6} rotationIntensity={0.4}>
      <group position={pos} visible={active}>
        <mesh ref={meshRef} castShadow>
          <icosahedronGeometry args={[0.25, 0]} />
          <meshStandardMaterial color="#f0c74b" emissive="#f0c74b" emissiveIntensity={1} roughness={0.3} />
        </mesh>
        <Sparkles count={6} scale={1} speed={2} color="#fca311" />
      </group>
    </Float>
  );
}
