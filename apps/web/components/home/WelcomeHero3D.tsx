"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useRef, useState } from "react";
import { FabricPlane, FloatingElements } from "./WelcomeHeroElements";

type WelcomeHero3DProps = {
  className?: string;
};

function Scene({ mouse }: { mouse: { x: number; y: number } }) {
  return (
    <>
      <ambientLight intensity={0.6} color="#f8ecd9" />
      <directionalLight position={[4, 6, 3]} intensity={0.9} color="#fff5e6" />
      <pointLight position={[-3, 2, 2]} intensity={0.4} color="#c9932f" />
      <FabricPlane mouse={mouse} />
      <FloatingElements mouse={mouse} />
    </>
  );
}

export function WelcomeHero3D({ className }: WelcomeHero3DProps) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setMouse({ x: x * 0.5, y: y * 0.5 });
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      onPointerMove={handlePointerMove}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.5, 4.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}
