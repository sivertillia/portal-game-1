import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";
import { PortalId, useGameStore } from "../state/gameStore";

type PortalPlacement = {
  id: PortalId;
  position: [number, number, number];
  normal: [number, number, number];
  color: string;
  active: boolean;
};

type PortalSystemProps = {
  portalSurfaces: MutableRefObject<THREE.Object3D[]>;
  velocity: MutableRefObject<THREE.Vector3>;
};

const PORTAL_SIZE = { width: 1.6, height: 2.6 };

const initialPlacements: Record<PortalId, PortalPlacement> = {
  orange: {
    id: "orange",
    position: [-5.5, 1.4, -2],
    normal: [1, 0, 0],
    color: "#f8b26a",
    active: true
  },
  cyan: {
    id: "cyan",
    position: [5.5, 1.5, 2],
    normal: [-1, 0, 0],
    color: "#64e8ff",
    active: true
  }
};

export function PortalSystem({ portalSurfaces, velocity }: PortalSystemProps) {
  const { camera, gl, scene } = useThree();
  const addShot = useGameStore((state) => state.addShot);
  const addTeleport = useGameStore((state) => state.addTeleport);

  const [placements, setPlacements] = useState<Record<PortalId, PortalPlacement>>(initialPlacements);
  const portalRefs: Record<PortalId, React.RefObject<THREE.Mesh>> = {
    orange: useRef<THREE.Mesh>(null),
    cyan: useRef<THREE.Mesh>(null)
  };

  const rtOrange = useFBO({ samples: 4, stencilBuffer: false });
  const rtCyan = useFBO({ samples: 4, stencilBuffer: false });
  const virtualOrange = useRef(new THREE.PerspectiveCamera());
  const virtualCyan = useRef(new THREE.PerspectiveCamera());

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const normalMatrix = useMemo(() => new THREE.Matrix3(), []);
  const flip = useMemo(() => new THREE.Matrix4().makeRotationY(Math.PI), []);
  const inv = useMemo(() => new THREE.Matrix4(), []);
  const link = useMemo(() => new THREE.Matrix4(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const rotOnly = useMemo(() => new THREE.Matrix4(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const prevZ = useRef<Record<PortalId, number>>({ orange: 0, cyan: 0 });
  const cooldown = useRef(0);

  const shootPortal = useCallback(
    (id: PortalId) => {
      raycaster.setFromCamera({ x: 0, y: 0 }, camera);
      const hits = raycaster.intersectObjects(portalSurfaces.current, true);
      const hit = hits.find((h) => h.object.userData.portalTarget);
      if (!hit) return;
      const faceNormal = hit.face?.normal
        ?.clone()
        .applyNormalMatrix(normalMatrix.getNormalMatrix(hit.object.matrixWorld))
        .normalize();

      const normal = faceNormal && faceNormal.lengthSq() > 0 ? faceNormal : new THREE.Vector3(0, 1, 0);
      const position = hit.point.clone().addScaledVector(normal, 0.02);

      setPlacements((curr) => ({
        ...curr,
        [id]: {
          ...curr[id],
          position: position.toArray() as [number, number, number],
          normal: normal.toArray() as [number, number, number],
          active: true
        }
      }));
      addShot();
    },
    [addShot, camera, normalMatrix, portalSurfaces, raycaster]
  );

  useEffect(() => {
    const dom = gl.domElement;
    const preventContext = (e: MouseEvent) => e.preventDefault();
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) {
        shootPortal("cyan");
      } else if (event.button === 0) {
        shootPortal("orange");
      }
    };
    dom.addEventListener("mousedown", handleMouseDown);
    dom.addEventListener("contextmenu", preventContext);
    return () => {
      dom.removeEventListener("mousedown", handleMouseDown);
      dom.removeEventListener("contextmenu", preventContext);
    };
  }, [gl.domElement, shootPortal]);

  const updateVirtualCamera = (
    fromId: PortalId,
    toId: PortalId,
    virtualCam: THREE.PerspectiveCamera
  ) => {
    const source = portalRefs[fromId].current;
    const target = portalRefs[toId].current;
    if (!source || !target || !virtualCam) return;

    inv.copy(source.matrixWorld).invert();
    link.copy(target.matrixWorld).multiply(flip).multiply(inv).multiply(camera.matrixWorld);

    virtualCam.matrixWorld.copy(link);
    virtualCam.matrixWorld.decompose(virtualCam.position, virtualCam.quaternion, virtualCam.scale);
    virtualCam.matrixWorldInverse.copy(virtualCam.matrixWorld).invert();

    const activeCam = camera as THREE.PerspectiveCamera;
    virtualCam.fov = activeCam.fov;
    virtualCam.near = activeCam.near;
    virtualCam.far = activeCam.far;
    virtualCam.aspect = activeCam.aspect;
    virtualCam.updateProjectionMatrix();
  };

  const teleportIfCrossed = (fromId: PortalId, toId: PortalId, delta: number) => {
    const source = portalRefs[fromId].current;
    const target = portalRefs[toId].current;
    if (!source || !target || !placements[fromId].active || !placements[toId].active) return;

    inv.copy(source.matrixWorld).invert();
    const localPos = tempVec.copy(camera.position).applyMatrix4(inv);
    const wasZ = prevZ.current[fromId] ?? localPos.z;
    prevZ.current[fromId] = localPos.z;

    const insideBounds =
      Math.abs(localPos.x) <= PORTAL_SIZE.width * 0.5 && Math.abs(localPos.y) <= PORTAL_SIZE.height * 0.5;

    if (cooldown.current > 0) {
      cooldown.current -= delta;
      return;
    }

    if (insideBounds && wasZ > 0 && localPos.z <= 0.02) {
      // Teleport: mirror through portal and offset at the partner.
      inv.copy(source.matrixWorld).invert();
      tempMatrix.copy(target.matrixWorld).multiply(flip).multiply(inv).multiply(camera.matrixWorld);
      camera.matrixWorld.copy(tempMatrix);
      camera.matrixWorld.decompose(camera.position, (camera as THREE.PerspectiveCamera).quaternion, camera.scale);
      camera.updateMatrixWorld();

      rotOnly.copy(target.matrixWorld).multiply(flip).multiply(inv);
      const rotation = new THREE.Quaternion().setFromRotationMatrix(rotOnly);
      velocity.current.applyQuaternion(rotation);

      addTeleport();
      cooldown.current = 0.3;
    }
  };

  useFrame((_, delta) => {
    updateVirtualCamera("orange", "cyan", virtualOrange.current);
    updateVirtualCamera("cyan", "orange", virtualCyan.current);

    if (portalRefs.orange.current) portalRefs.orange.current.visible = false;
    if (portalRefs.cyan.current) portalRefs.cyan.current.visible = false;

    gl.setRenderTarget(rtOrange);
    gl.render(scene, virtualOrange.current);
    gl.setRenderTarget(rtCyan);
    gl.render(scene, virtualCyan.current);
    gl.setRenderTarget(null);

    if (portalRefs.orange.current) portalRefs.orange.current.visible = true;
    if (portalRefs.cyan.current) portalRefs.cyan.current.visible = true;

    teleportIfCrossed("orange", "cyan", delta);
    teleportIfCrossed("cyan", "orange", delta);
  }, 1);

  return (
    <>
      <PortalFrame
        placement={placements.orange}
        texture={rtCyan.texture}
        meshRef={portalRefs.orange}
      />
      <PortalFrame placement={placements.cyan} texture={rtOrange.texture} meshRef={portalRefs.cyan} />
    </>
  );
}

function PortalFrame({
  placement,
  texture,
  meshRef
}: {
  placement: PortalPlacement;
  texture: THREE.Texture;
  meshRef: React.RefObject<THREE.Mesh>;
}) {
  const { position, quaternion } = useMemo(() => {
    const pos = new THREE.Vector3().fromArray(placement.position);
    const normal = new THREE.Vector3().fromArray(placement.normal).normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return { position: pos, quaternion: quat };
  }, [placement.normal, placement.position]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={meshRef} receiveShadow castShadow>
        <planeGeometry args={[PORTAL_SIZE.width, PORTAL_SIZE.height]} />
        <meshStandardMaterial
          map={texture}
          color="#111827"
          emissive={placement.color}
          emissiveIntensity={0.45}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[PORTAL_SIZE.width * 1.15, PORTAL_SIZE.height * 1.08]} />
        <meshBasicMaterial color={placement.color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
