"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import { Object3D, type InstancedMesh } from "three";
import type * as THREE from "three";
import {
  INTRO_PARTICLE_COUNT_DESKTOP,
  INTRO_PARTICLE_COUNT_MOBILE,
} from "@/lib/intro/constants";

type IntroAtmosphere3DProps = {
  className?: string;
  mobile?: boolean;
  intensity?: number;
};

function DustParticles({ count, intensity }: { count: number; intensity: number }) {
  const meshRef = useRef<InstancedMesh>(null);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 5,
      z: (Math.random() - 0.5) * 4,
      speed: 0.15 + Math.random() * 0.35,
      offset: Math.random() * Math.PI * 2,
      scale: 0.02 + Math.random() * 0.04,
    }));
  }, [count]);

  const dummy = useMemo(() => new Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      dummy.position.set(
        p.x + Math.sin(t * p.speed + p.offset) * 0.15,
        p.y + Math.sin(t * p.speed * 0.7 + p.offset) * 0.2,
        p.z,
      );
      dummy.scale.setScalar(p.scale * intensity);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#f8ecd9"
        emissive="#c9932f"
        emissiveIntensity={0.25 * intensity}
        roughness={0.8}
        metalness={0.1}
        transparent
        opacity={0.55}
      />
    </instancedMesh>
  );
}

function Scene({ mobile, intensity }: { mobile: boolean; intensity: number }) {
  const count = mobile ? INTRO_PARTICLE_COUNT_MOBILE : INTRO_PARTICLE_COUNT_DESKTOP;

  return (
    <>
      <ambientLight intensity={0.55} color="#f8ecd9" />
      <directionalLight position={[3, 5, 4]} intensity={0.7} color="#fff5e6" />
      <pointLight position={[-2, 1, 3]} intensity={0.35 * intensity} color="#c9932f" />
      <DustParticles count={count} intensity={intensity} />
    </>
  );
}

export function IntroAtmosphere3D({
  className,
  mobile = false,
  intensity = 1,
}: IntroAtmosphere3DProps) {
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={mobile ? [1, 1.25] : [1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene mobile={mobile} intensity={intensity} />
        </Suspense>
      </Canvas>
    </div>
  );
}
