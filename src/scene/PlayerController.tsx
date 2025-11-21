import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type PlayerControllerProps = {
  velocity: MutableRefObject<THREE.Vector3>;
  onLockChange?: (locked: boolean) => void;
};

const UP = new THREE.Vector3(0, 1, 0);

export function PlayerController({ velocity, onLockChange }: PlayerControllerProps) {
  const controls = useRef<PointerLockControls>(null);
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const jumpQueued = useRef(false);
  const [, setLocked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keys.current[event.code] = true;
      if (event.code === "Space") jumpQueued.current = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keys.current[event.code] = false;
      if (event.code === "Space") jumpQueued.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const dom = gl.domElement;
    const lockOnClick = () => controls.current?.lock();
    dom.addEventListener("click", lockOnClick);
    return () => dom.removeEventListener("click", lockOnClick);
  }, [gl.domElement]);

  useEffect(() => {
    const current = controls.current;
    if (!current) return;
    const handleLock = () => {
      setLocked(true);
      onLockChange?.(true);
    };
    const handleUnlock = () => {
      setLocked(false);
      onLockChange?.(false);
    };
    current.addEventListener("lock", handleLock as any);
    current.addEventListener("unlock", handleUnlock as any);
    return () => {
      current.removeEventListener("lock", handleLock as any);
      current.removeEventListener("unlock", handleUnlock as any);
    };
  }, [onLockChange]);

  useFrame((_, delta) => {
    const speed = (keys.current.ShiftLeft || keys.current.ShiftRight ? 12 : 8) * delta;
    const desired = new THREE.Vector3();
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, UP).normalize();

    if (keys.current.KeyW) desired.add(forward);
    if (keys.current.KeyS) desired.sub(forward);
    if (keys.current.KeyA) desired.sub(right);
    if (keys.current.KeyD) desired.add(right);

    if (desired.lengthSq() > 0) {
      desired.normalize().multiplyScalar(speed * 14);
    }

    // Smooth accel/decel on horizontal axes
    velocity.current.x = THREE.MathUtils.damp(velocity.current.x, desired.x, 8, delta);
    velocity.current.z = THREE.MathUtils.damp(velocity.current.z, desired.z, 8, delta);

    // Gravity & jump
    const grounded = camera.position.y <= 1.01;
    velocity.current.y -= 22 * delta;
    if (jumpQueued.current && grounded) {
      velocity.current.y = 9;
      jumpQueued.current = false;
    }

    camera.position.addScaledVector(velocity.current, delta);
    if (camera.position.y < 1) {
      camera.position.y = 1;
      velocity.current.y = 0;
    }

    // Clamp play area to keep demo focused
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -12, 12);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -12, 12);
  });

  return <PointerLockControls ref={controls} makeDefault enabled />;
}
