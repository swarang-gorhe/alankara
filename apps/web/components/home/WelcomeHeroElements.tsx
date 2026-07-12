"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { CatmullRomCurve3, DoubleSide, Vector3 } from "three";
import type * as THREE from "three";

type MousePosition = {
  x: number;
  y: number;
};

type FabricPlaneProps = {
  mouse: MousePosition;
};

export function FabricPlane({ mouse }: FabricPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.x = -0.55 + mouse.y * 0.08 + Math.sin(t * 0.4) * 0.03;
    meshRef.current.rotation.y = mouse.x * 0.12 + Math.sin(t * 0.25) * 0.02;
    meshRef.current.position.y = -0.3 + Math.sin(t * 0.5) * 0.05;
  });

  return (
    <mesh ref={meshRef} rotation={[-0.55, 0, 0]} position={[0, -0.3, 0]}>
      <planeGeometry args={[9, 9, 48, 48]} />
      <meshStandardMaterial
        color="#f3e4cd"
        roughness={0.92}
        metalness={0.05}
        side={DoubleSide}
        emissive="#e8d4b0"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

type FloatingElementsProps = {
  mouse: MousePosition;
};

export function FloatingElements({ mouse }: FloatingElementsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pearlsRef = useRef<THREE.Group>(null);

  const pearls = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        position: [
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 2.5 + 0.5,
          (Math.random() - 0.5) * 2,
        ] as [number, number, number],
        scale: 0.04 + Math.random() * 0.06,
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2,
      })),
    [],
  );

  const threads = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        start: [(Math.random() - 0.5) * 4, Math.random() * 2, (Math.random() - 0.5) * 1.5] as [
          number,
          number,
          number,
        ],
        end: [
          (Math.random() - 0.5) * 4,
          Math.random() * 2 - 1,
          (Math.random() - 0.5) * 1.5,
        ] as [number, number, number],
      })),
    [],
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = mouse.x * 0.05;
    groupRef.current.rotation.x = mouse.y * 0.03;

    const t = state.clock.elapsedTime;
    pearlsRef.current?.children.forEach((child, index) => {
      const pearl = pearls[index];
      if (!pearl || child.type !== "Mesh") return;
      child.position.y = pearl.position[1] + Math.sin(t * pearl.speed + pearl.offset) * 0.15;
    });
  });

  return (
    <group ref={groupRef} rotation={[0, 0, 0]}>
      <group ref={pearlsRef}>
        {pearls.map((pearl) => (
          <mesh key={pearl.id} position={pearl.position} scale={pearl.scale}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial
              color="#f8ecd9"
              roughness={0.25}
              metalness={0.6}
              emissive="#c9932f"
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}
      </group>
      <group>
        {threads.map((thread) => (
          <ThreadLine key={thread.id} start={thread.start} end={thread.end} />
        ))}
      </group>
    </group>
  );
}

type ThreadLineProps = {
  start: [number, number, number];
  end: [number, number, number];
};

function ThreadLine({ start, end }: ThreadLineProps) {
  const points = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(...start),
      new Vector3((start[0] + end[0]) / 2, (start[1] + end[1]) / 2 + 0.3, (start[2] + end[2]) / 2),
      new Vector3(...end),
    ]);
    return curve.getPoints(24);
  }, [start, end]);

  return <Line points={points} color="#b98a4a" transparent opacity={0.5} lineWidth={1} />;
}
