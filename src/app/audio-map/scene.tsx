"use client";

import { OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

const Scene = () => {
  return (
    <Canvas>
      <Objects />
    </Canvas>
  );
};
export { Scene };

const Objects = () => {
  const worldSize = { w: 24, h: 16 };
  const cam = useRef<THREE.OrthographicCamera>();
  const playerRef = useRef<THREE.Mesh>(null!);
  const destinationRef = useRef(new THREE.Vector3(4, 1, 0));

  useFrame(() => {
    if (cam.current) {
      cam.current.lookAt(0, 0, 0);
    }

    if (playerRef) {
      if (playerRef.current) {
        const player = playerRef.current;
        const curPos = player.position;
        const destination = destinationRef.current;
        if (curPos.distanceTo(destination) > 0.05) {
          const nextPos = new THREE.Vector3().lerpVectors(
            curPos,
            destination,
            0.03
          );
          player.position.set(nextPos.x, nextPos.y, nextPos.z);
        }
      }
    }
  });
  return (
    <group>
      <OrthographicCamera
        makeDefault
        ref={cam}
        position={[-2, 8, 10]}
        zoom={30}
      />
      <group>
        <mesh position={[0, 1, 0]} ref={playerRef}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color="yellow" />
        </mesh>

        <mesh
          position={[0, 0, 0]}
          rotation={[Math.PI / -2, 0, 0]}
          onClick={(e) => {
            if (e.intersections?.[0]?.uv) {
              const { x, y } = e.intersections[0].uv;
              const worldXY = {
                x: x * worldSize.w - worldSize.w / 2,
                y: worldSize.h - y * worldSize.h - worldSize.h / 2,
              };
              destinationRef.current.set(worldXY.x, 1, worldXY.y);
            }
          }}
        >
          <planeGeometry args={[worldSize.w, worldSize.h, 2, 2]} />
          <meshBasicMaterial color="gray" />
        </mesh>

        <AudioSrc position={[6, 1, 3]} />
        <AudioSrc position={[-6, 1, 1]} />
        <AudioSrc position={[-9, 1, 4]} />
      </group>
    </group>
  );
};

const AudioSrc = ({
  position,
}: {
  position: [x: number, y: number, z: number];
}) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.75, 12, 12]} />
      <meshBasicMaterial color="blue" />
    </mesh>
  );
};
