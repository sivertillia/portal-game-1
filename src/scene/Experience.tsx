import { useEffect, useMemo, useRef, useState } from "react";
import { Sky, Stars } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerController } from "./PlayerController";
import { Gun } from "./Gun";
import { GreenPortal } from "./GreenPortal";

type ExperienceProps = {
  onLockChange?: (locked: boolean) => void;
};

const MAX_PORTALS = 3; // Change this to allow more or fewer simultaneously placed portals.

type PortalPose = { id: number; pos: [number, number, number]; rot: [number, number, number] };

export default function Experience({ onLockChange }: ExperienceProps) {
  const velocity = useRef(new THREE.Vector3());
  const portalSurfaces = useRef<THREE.Object3D[]>([]);
  const wallRef = useRef<THREE.Mesh>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const normalMat = useMemo(() => new THREE.Matrix3(), []);
  const [portals, setPortals] = useState<PortalPose[]>([]);
  const portalId = useRef(0);
  const { camera, gl } = useThree();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r") {
        setPortals([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (wallRef.current) {
      wallRef.current.userData.portalTarget = true;
      portalSurfaces.current.push(wallRef.current);
    }
    if (floorRef.current) {
      floorRef.current.userData.portalTarget = true;
      portalSurfaces.current.push(floorRef.current);
    }
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    const onClick = () => {
      raycaster.setFromCamera({ x: 0, y: 0 }, camera);
      const hits = raycaster.intersectObjects(portalSurfaces.current, false);
      const hit = hits.find((h) => h.object.userData.portalTarget);
      if (!hit) return;

      const faceNormal = hit.face?.normal
        ?.clone()
        .applyNormalMatrix(normalMat.getNormalMatrix(hit.object.matrixWorld))
        .normalize();
      const normal = faceNormal && faceNormal.lengthSq() > 0 ? faceNormal : new THREE.Vector3(0, 0, 1);
      const position = hit.point.clone().addScaledVector(normal, 0.02);
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      const euler = new THREE.Euler().setFromQuaternion(quat);

      setPortals((current) => {
        const next: PortalPose[] = [
          ...current,
          {
            id: portalId.current++,
            pos: position.toArray() as [number, number, number],
            rot: [euler.x, euler.y, euler.z]
          }
        ];
        if (next.length > MAX_PORTALS) next.shift();
        return next;
      });
    };
    dom.addEventListener("mousedown", onClick);
    return () => dom.removeEventListener("mousedown", onClick);
  }, [camera, gl.domElement, normalMat, raycaster]);

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

      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0b1221" roughness={0.9} />
      </mesh>
      <gridHelper args={[80, 80, "#1f2a44", "#0e1626"]} position={[0, 0.02, 0]} />

      <mesh
        ref={wallRef}
        position={[9.8, 2.2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.6, 4.4, 9]} />
        <meshStandardMaterial color="#0f1c2d" roughness={0.45} metalness={0.15} />
      </mesh>

      {portals.map((portal) => (
        <GreenPortal key={portal.id} position={portal.pos} rotation={portal.rot} visible />
      ))}

      <Gun />
      <PlayerController velocity={velocity} onLockChange={onLockChange} />
    </>
  );
}
