import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sky, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerController } from "./PlayerController";
import { Gun } from "./Gun";
import { GreenPortal } from "./GreenPortal";

type ExperienceProps = {
  onLockChange?: (locked: boolean) => void;
};

const MAX_PORTALS = 2; // Change this to allow more or fewer simultaneously placed portals.
const PORTAL_SIZE = { width: 1.6, height: 2.6 };

type PortalPose = { id: number; pos: [number, number, number]; rot: [number, number, number] };

export default function Experience({ onLockChange }: ExperienceProps) {
  const velocity = useRef(new THREE.Vector3());
  const portalSurfaces = useRef<THREE.Object3D[]>([]);
  const portalRefs = useRef<Record<number, THREE.Group | null>>({});
  const wallRef = useRef<THREE.Mesh>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const normalMat = useMemo(() => new THREE.Matrix3(), []);
  const [portals, setPortals] = useState<PortalPose[]>([]);
  const portalId = useRef(0);
  const prevZ = useRef<Record<number, number>>({});
  const cooldown = useRef(0);
  const flip = useMemo(() => new THREE.Matrix4().makeRotationY(Math.PI), []);
  const inv = useMemo(() => new THREE.Matrix4(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const rotOnly = useMemo(() => new THREE.Matrix4(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const { camera, gl } = useThree();
  const pointerLocked = useRef(false);
  const handleLockChange = useCallback(
    (locked: boolean) => {
      pointerLocked.current = locked;
      onLockChange?.(locked);
    },
    [onLockChange]
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r") {
        setPortals([]);
        portalRefs.current = {};
        prevZ.current = {};
        cooldown.current = 0;
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
    const target = dom.ownerDocument ?? dom;
    const onClick = (event: MouseEvent) => {
      const lockedToCanvas = target.pointerLockElement === dom;
      const fromCanvas = event.composedPath?.().includes(dom);
      if (!lockedToCanvas && !fromCanvas) return;
      if (pointerLocked.current && target.pointerLockElement && target.pointerLockElement !== dom) return;
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
        if (next.length > MAX_PORTALS) {
          const removed = next.shift();
          if (removed) {
            delete portalRefs.current[removed.id];
            delete prevZ.current[removed.id];
          }
        }
        return next;
      });
    };
    // Pointer-lock mouse events are dispatched on the document, so listen there to avoid missing clicks.
    target.addEventListener("mousedown", onClick);
    return () => target.removeEventListener("mousedown", onClick);
  }, [camera, gl.domElement, normalMat, raycaster]);

  const teleportIfCrossed = useCallback(
    (fromId: number, fromObj: THREE.Object3D, toObj: THREE.Object3D) => {
      inv.copy(fromObj.matrixWorld).invert();
      const localPos = tempVec.copy(camera.position).applyMatrix4(inv);
      const wasZ = prevZ.current[fromId] ?? localPos.z;
      prevZ.current[fromId] = localPos.z;

      const insideBounds =
        Math.abs(localPos.x) <= PORTAL_SIZE.width * 0.5 && Math.abs(localPos.y) <= PORTAL_SIZE.height * 0.5;

      if (cooldown.current > 0) return;

      if (insideBounds && wasZ > 0 && localPos.z <= 0.02) {
        tempMatrix.copy(toObj.matrixWorld).multiply(flip).multiply(inv).multiply(camera.matrixWorld);
        camera.matrixWorld.copy(tempMatrix);
        camera.matrixWorld.decompose(camera.position, (camera as THREE.PerspectiveCamera).quaternion, camera.scale);
        camera.updateMatrixWorld();

        rotOnly.copy(toObj.matrixWorld).multiply(flip).multiply(inv);
        const rotation = new THREE.Quaternion().setFromRotationMatrix(rotOnly);
        velocity.current.applyQuaternion(rotation);

        cooldown.current = 0.3;
      }
    },
    [camera, flip, inv, rotOnly, tempMatrix, tempVec, velocity]
  );

  useFrame((_, delta) => {
    cooldown.current = Math.max(0, cooldown.current - delta);
    if (portals.length < 2) return;
    const pair = portals.slice(-2);
    const [first, second] = pair;
    const firstRef = portalRefs.current[first.id];
    const secondRef = portalRefs.current[second.id];
    if (!firstRef || !secondRef) return;

    teleportIfCrossed(first.id, firstRef, secondRef);
    teleportIfCrossed(second.id, secondRef, firstRef);
  });

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
        <meshStandardMaterial color="#ffffff" roughness={0.85} />
      </mesh>
      <gridHelper args={[80, 80, "#dcdcdc", "#f0f0f0"]} position={[0, 0.02, 0]} />

      <mesh
        ref={wallRef}
        position={[9.8, 2.2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.6, 4.4, 9]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
      </mesh>

      {portals.map((portal) => (
        <GreenPortal
          key={portal.id}
          position={portal.pos}
          rotation={portal.rot}
          visible
          ref={(node) => {
            if (node) portalRefs.current[portal.id] = node;
            else delete portalRefs.current[portal.id];
          }}
        />
      ))}

      <Gun />
      <PlayerController velocity={velocity} onLockChange={handleLockChange} />
    </>
  );
}
