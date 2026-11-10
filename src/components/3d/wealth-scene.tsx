"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";

export type WealthSceneVariant = "welcome" | "overview" | "onboarding" | "celebration";

const GOLD = "#e5b968";
const LIGHT_GOLD = "#f3d792";
const DEEP_GREEN = "#0d695a";
const MINT = "#7de0c6";

function CoinStack({
  x,
  z,
  count,
  offset = 0,
}: {
  x: number;
  z: number;
  count: number;
  offset?: number;
}) {
  return (
    <group position={[x, -1.17, z]} rotation={[0, offset, 0]}>
      {Array.from({ length: count }, (_, index) => (
        <group key={index} position={[0, index * 0.135, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.125, 40]} />
            <meshStandardMaterial color={index % 2 ? GOLD : LIGHT_GOLD} metalness={0.82} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.066, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.005, 40]} />
            <meshStandardMaterial color="#c8943b" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <torusGeometry args={[0.29, 0.013, 6, 40]} />
            <meshStandardMaterial color={LIGHT_GOLD} metalness={0.8} roughness={0.24} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function MemberOrbit() {
  return (
    <group rotation={[0.33, -0.16, 0.24]}>
      <mesh>
        <torusGeometry args={[1.87, 0.024, 8, 96]} />
        <meshStandardMaterial color={MINT} metalness={0.5} roughness={0.22} emissive="#135347" emissiveIntensity={0.4} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => {
        const angle = (index / 9) * Math.PI * 2;
        return (
          <group key={index} position={[Math.cos(angle) * 1.87, Math.sin(angle) * 1.87, 0]}>
            <mesh>
              <sphereGeometry args={[index % 3 === 0 ? 0.105 : 0.074, 12, 12]} />
              <meshStandardMaterial
                color={index % 3 === 0 ? LIGHT_GOLD : MINT}
                metalness={0.62}
                roughness={0.27}
                emissive={index % 3 === 0 ? "#5d3f0b" : "#144d3f"}
                emissiveIntensity={0.24}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function WealthSculpture({ variant }: { variant: WealthSceneVariant }) {
  const root = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const celebratory = variant === "celebration";

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    if (root.current) {
      root.current.rotation.y = -0.28 + Math.sin(elapsed * 0.28) * 0.16;
      root.current.rotation.z = Math.sin(elapsed * 0.33) * 0.022;
      root.current.position.y = Math.sin(elapsed * 0.82) * 0.065;
    }
    if (ring.current) ring.current.rotation.z += Math.min(delta, 0.05) * (celebratory ? 0.2 : 0.08);
  });

  return (
    <group scale={celebratory ? 1.1 : 1}>
      <group ref={root}>
        <RoundedBox args={[3.55, 0.23, 1.9]} radius={0.11} smoothness={4} position={[0, -1.42, 0]}>
          <meshStandardMaterial color="#20574c" metalness={0.64} roughness={0.32} />
        </RoundedBox>
        <RoundedBox args={[3.18, 0.08, 1.61]} radius={0.055} smoothness={3} position={[0, -1.29, 0]}>
          <meshStandardMaterial color="#3e927a" metalness={0.47} roughness={0.4} />
        </RoundedBox>

        <CoinStack x={-1.05} z={0.33} count={4} offset={0.12} />
        <CoinStack x={0.12} z={0.27} count={7} offset={-0.18} />
        <CoinStack x={1.2} z={0.34} count={5} offset={0.22} />

        <group position={[0, 0.43, -0.34]}>
          <group ref={ring}>
            <MemberOrbit />
          </group>
          <mesh rotation={[0.72, 0.3, 0.18]}>
            <torusGeometry args={[1.39, 0.045, 10, 96]} />
            <meshStandardMaterial color={GOLD} metalness={0.86} roughness={0.24} />
          </mesh>
          <Float speed={1.15} rotationIntensity={0.14} floatIntensity={0.26}>
            <mesh rotation={[0.22, -0.4, 0.14]}>
              <icosahedronGeometry args={[0.75, 1]} />
              <meshPhysicalMaterial
                color="#39aa8d"
                metalness={0.3}
                roughness={0.13}
                transmission={0.14}
                thickness={1.1}
                clearcoat={1}
                clearcoatRoughness={0.1}
              />
            </mesh>
            <mesh scale={0.32} rotation={[0.1, 0.2, 0.25]}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={LIGHT_GOLD} emissive="#aa7c27" emissiveIntensity={0.2} metalness={0.79} roughness={0.24} />
            </mesh>
          </Float>
        </group>
      </group>
      {celebratory && (
        <Sparkles
          count={32}
          scale={[4.7, 3.6, 2.4]}
          size={2.4}
          speed={0.48}
          color={LIGHT_GOLD}
          opacity={0.85}
        />
      )}
    </group>
  );
}

/**
 * A decorative 3D sculpture, never a live account chart or verification badge.
 * Only mount this Canvas through the lazy browser-only wrapper.
 */
export function WealthScene({ variant }: { variant: WealthSceneVariant }) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 7.6], fov: 38, near: 0.1, far: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      frameloop="always"
      style={{ height: "100%", width: "100%", pointerEvents: "none" }}
    >
      <ambientLight intensity={1.65} />
      <directionalLight position={[3.2, 5.1, 5]} color="#ffffff" intensity={3} />
      <pointLight position={[-3, 1.4, 3]} color="#79ddc2" intensity={23} distance={12} />
      <pointLight position={[2.8, -1.2, 1]} color="#f6c66d" intensity={13} distance={10} />
      <WealthSculpture variant={variant} />
    </Canvas>
  );
}
