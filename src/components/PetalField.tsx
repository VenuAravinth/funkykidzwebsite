"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 60;

function petalShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.5, 0.2, 0.5, 0.9, 0, 1.1);
  shape.bezierCurveTo(-0.5, 0.9, -0.5, 0.2, 0, 0);
  return shape;
}

type PetalDatum = {
  x: number;
  y: number;
  z: number;
  speed: number;
  drift: number;
  rotSpeed: number;
  scale: number;
  phase: number;
};

// Random layout generated once per mount, outside render.
function makePetals(): PetalDatum[] {
  return Array.from({ length: COUNT }, () => ({
    x: THREE.MathUtils.randFloatSpread(20),
    y: THREE.MathUtils.randFloat(-8, 10),
    z: THREE.MathUtils.randFloat(-4, 2),
    speed: THREE.MathUtils.randFloat(0.35, 0.9),
    drift: THREE.MathUtils.randFloat(0.2, 0.6),
    rotSpeed: THREE.MathUtils.randFloat(0.3, 1.2),
    scale: THREE.MathUtils.randFloat(0.12, 0.28),
    phase: THREE.MathUtils.randFloat(0, Math.PI * 2),
  }));
}

function Petals() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const geometry = useMemo(() => {
    const g = new THREE.ShapeGeometry(petalShape());
    g.center();
    return g;
  }, []);

  const [data] = useState(makePetals);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    data.forEach((p, i) => {
      p.y -= p.speed * delta;
      if (p.y < -9) p.y = 10;
      const sway = Math.sin(t * p.drift + p.phase) * 1.2;
      dummy.position.set(p.x + sway, p.y, p.z);
      dummy.rotation.set(t * p.rotSpeed * 0.3, t * p.rotSpeed * 0.5, t * p.rotSpeed + p.phase);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]}>
      <meshBasicMaterial color="#f3aec1" transparent opacity={0.75} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

export default function PetalField({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      <Canvas
        orthographic
        camera={{ zoom: 40, position: [0, 0, 10] }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <Petals />
      </Canvas>
    </div>
  );
}
