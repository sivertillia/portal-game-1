import { Float, Line } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import * as THREE from "three";

type LevelProps = {
  registerSurface: (mesh: THREE.Object3D | null) => void;
};

export function Level({ registerSurface }: LevelProps) {
  const pillarPositions = useMemo(
    () => [
      new THREE.Vector3(-6, 0, -4),
      new THREE.Vector3(6, 0, -5),
      new THREE.Vector3(-2, 0, 6),
      new THREE.Vector3(4, 0, 5)
    ],
    []
  );

  return (
    <group>
      <mesh
        ref={registerSurface}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0b1221" roughness={0.85} metalness={0.1} />
      </mesh>

      <gridHelper args={[30, 30, "#1f2a44", "#0e1626"]} position={[0, 0.01, 0]} />

      <PortalWall
        position={[-8, 2, 0]}
        rotation={[0, Math.PI / 2.2, 0]}
        scale={[3, 3, 0.6]}
        color="#132235"
        registerSurface={registerSurface}
      />
      <PortalWall
        position={[8, 2, -2]}
        rotation={[0, -Math.PI / 3, 0]}
        scale={[3.4, 3, 0.6]}
        color="#0f1c2d"
        registerSurface={registerSurface}
      />
      <PortalWall
        position={[0, 2.2, -8]}
        rotation={[0, 0, 0]}
        scale={[5.5, 3.4, 0.6]}
        color="#0f2135"
        registerSurface={registerSurface}
      />
      <PortalWall
        position={[0, 1.8, 8]}
        rotation={[0, Math.PI, 0]}
        scale={[5, 2.8, 0.6]}
        color="#122a3f"
        registerSurface={registerSurface}
      />

      <Float floatIntensity={0.5} rotationIntensity={0.4} speed={1.5}>
        <Line
          points={[
            new THREE.Vector3(-4, 0.01, -4),
            new THREE.Vector3(0, 0.01, 0),
            new THREE.Vector3(4, 0.01, 4)
          ]}
          color="#2bd1ff"
          lineWidth={2}
        />
      </Float>

      {pillarPositions.map((pos, idx) => (
        <mesh key={idx} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.6, 0.6, 3.2, 12]} />
          <meshStandardMaterial color="#111827" metalness={0.35} roughness={0.4} />
        </mesh>
      ))}

      <RigidBody colliders="cuboid" restitution={0.4} friction={0.6} position={[0, 5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#7dd3fc" metalness={0.6} roughness={0.3} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="ball" restitution={0.6} friction={0.2} position={[-3, 4, 3]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial color="#38bdf8" metalness={0.4} roughness={0.25} />
        </mesh>
      </RigidBody>
      <RigidBody colliders="ball" restitution={0.6} friction={0.3} position={[3, 6, -3]}>
        <mesh castShadow>
          <torusKnotGeometry args={[0.6, 0.2, 80, 12]} />
          <meshStandardMaterial color="#a78bfa" metalness={0.45} roughness={0.35} />
        </mesh>
      </RigidBody>

      {/* Colliders for the physics toys */}
      <CuboidCollider args={[15, 0.1, 15]} position={[0, -0.05, 0]} />
      <CuboidCollider args={[0.4, 3, 15]} position={[8.2, 1.5, 0]} />
      <CuboidCollider args={[0.4, 3, 15]} position={[-8.2, 1.5, 0]} />
      <CuboidCollider args={[15, 3, 0.4]} position={[0, 1.5, 8.2]} />
      <CuboidCollider args={[15, 3, 0.4]} position={[0, 1.5, -8.2]} />
    </group>
  );
}

function PortalWall({
  position,
  rotation,
  scale,
  color,
  registerSurface
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  registerSurface: (mesh: THREE.Object3D | null) => void;
}) {
  return (
    <mesh
      ref={registerSurface}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 0.25]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.35} />
    </mesh>
  );
}
