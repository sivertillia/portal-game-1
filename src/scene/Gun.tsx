import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// First-person gun parented to the camera so it is always visible.
export function Gun() {
  const { camera } = useThree();
  const { scene } = useGLTF("/gun2.glb");
  const group = useRef<THREE.Group>(null);
  const modelHolder = useRef<THREE.Group>(null);
  const baseOffset = new THREE.Vector3(0.55, -0.6, -1.7); // right, down, forward

  // Attach to camera and set initial transform.
  useEffect(() => {
    if (!group.current) return;
    const current = group.current;
    const parent = current.parent;
    parent?.remove(current);
    camera.add(current);
    current.position.copy(baseOffset);
    current.rotation.set(-0.05, Math.PI, 0.1);
    current.scale.setScalar(1.0);
    return () => {
      camera.remove(current);
      parent?.add(current);
    };
  }, [camera]);

  // Mount and normalize the GLB (center, scale, rotation).
  useEffect(() => {
    if (!modelHolder.current) return;
    modelHolder.current.clear();
    const glb = scene.clone(true);
    modelHolder.current.add(glb);
    glb.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(glb);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const targetSize = 1.6;
    const scale = size.length() > 0 ? targetSize / Math.max(size.x, size.y, size.z) : 1;
    glb.scale.setScalar(scale);
    glb.position.sub(center.multiplyScalar(1));

    // Face forward (-Z) with a small cant.
    glb.rotation.set(0, Math.PI, 0);
  }, [scene]);

  useFrame(() => {
    if (!group.current) return;
    const t = performance.now() * 0.002;
    group.current.position.z = baseOffset.z - Math.sin(t) * 0.04;
    group.current.rotation.z = 0.04 * Math.sin(t * 1.8);
  });

  return (
    <group ref={group}>
      <group ref={modelHolder} />
      {/* Visible fallback if GLB is extremely small/offset */}
      <mesh position={[0, -0.1, -0.2]} scale={0.25}>
        <boxGeometry args={[1, 0.4, 2]} />
        <meshStandardMaterial color="#f97316" emissive="#fb923c" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

useGLTF.preload("/gun2.glb");
