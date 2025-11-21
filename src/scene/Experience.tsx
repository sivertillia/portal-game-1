import { useEffect, useRef } from "react";
import { Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import { PlayerController } from "./PlayerController";

type ExperienceProps = {
  onLockChange?: (locked: boolean) => void;
};

export default function Experience({ onLockChange }: ExperienceProps) {
  const velocity = useRef(new THREE.Vector3());

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r") {
        // Resetless sandbox: no-op, but reserved for future.
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 10, 4]} intensity={1.2} />

      <Stars radius={70} depth={20} count={2000} factor={3} fade speed={0.5} />
      <Sky
        distance={400000}
        turbidity={10}
        rayleigh={0.4}
        mieCoefficient={0.02}
        mieDirectionalG={0.82}
        inclination={0.52}
        azimuth={0.2}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0b1221" roughness={0.9} />
      </mesh>
      <gridHelper args={[80, 80, "#1f2a44", "#0e1626"]} position={[0, 0.02, 0]} />

      <PlayerController velocity={velocity} onLockChange={onLockChange} />
    </>
  );
}
