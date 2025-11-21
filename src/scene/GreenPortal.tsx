import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

type GreenPortalProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  visible?: boolean;
};

// Static green portal model normalized for consistent scale.
export function GreenPortal({ position, rotation = [0, 0, 0], visible = true }: GreenPortalProps) {
  const holder = useRef<THREE.Group>(null);
  const uri = "/green%20portal.glb";
  const { scene } = useGLTF(uri);

  useEffect(() => {
    if (!holder.current) return;
    holder.current.clear();
    const glb = scene.clone(true);
    holder.current.add(glb);
    glb.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(glb);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const targetHeight = 1.6;
    const scale = size.y > 0 ? targetHeight / size.y : 1;
    glb.scale.setScalar(10);
      console.log(scale);
    const scaledCenter = center.clone().multiplyScalar(scale);
    glb.position.set(-1.7, 1.45, -1.27); // center the model so group origin is mid-height
    glb.rotation.set(0, -Math.PI / 2, -Math.PI / 2);
  }, [scene]);

  return (
    <group position={position} rotation={rotation} visible={visible}>
      <group ref={holder} />
      <pointLight position={[0, 0, 0]} intensity={3} distance={5} color="#3cff8b" />
    </group>
  );
}

useGLTF.preload("/green%20portal.glb");
