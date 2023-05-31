"use client";

import { Html, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { forwardRef, Ref, useRef } from "react";
import * as THREE from "three";

const Scene = () => {
  return (
    <Canvas
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <Objects />
    </Canvas>
  );
};
export { Scene };

const initiateAudio = ({
  player,
  audioSources,
}: {
  player: THREE.Group | THREE.Mesh;
  audioSources: { object: THREE.Group | THREE.Mesh; audio: string }[];
}) => {
  const listener = new THREE.AudioListener();
  player.add(listener);

  audioSources.forEach((src) => {
    const sound = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(src.audio, function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(1);
      sound.setMaxDistance(6);
      sound.loop = true;
      sound.play();
      src.object.add(sound);
    });
  });
};

const Objects = () => {
  const worldSize = { w: 24, h: 24 };
  const cam = useRef<THREE.OrthographicCamera>();
  const playerRef = useRef<THREE.Group>(null!);
  const destinationRef = useRef(new THREE.Vector3(12, 1, 12));

  const audioObj1Ref = useRef<THREE.Mesh>(null!);
  const audioObj2Ref = useRef<THREE.Mesh>(null!);
  const audioObj3Ref = useRef<THREE.Mesh>(null!);
  const audioObj4Ref = useRef<THREE.Mesh>(null!);

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
          const lookAtPos = new THREE.Vector3().lerpVectors(
            curPos,
            destination,
            -1
          );
          player.lookAt(lookAtPos);
        }
      }
    }
  });

  return (
    <group>
      <OrthographicCamera
        makeDefault
        ref={cam}
        position={[14, 12, 14]}
        zoom={20}
        near={0.01}
      />
      <group>
        <group position={[12, 1, 12]} ref={playerRef}>
          <mesh>
            <sphereGeometry />
            <meshBasicMaterial color="#00aa35" />
          </mesh>

          <mesh position={[0, 0.8, -0.5]}>
            <boxGeometry />
            <meshBasicMaterial color="#33bb33" />
          </mesh>
        </group>

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
          <meshBasicMaterial color="#ddd" />
        </mesh>

        <AudioSrc ref={audioObj1Ref} position={[12, 1, 12]} />
        <AudioSrc ref={audioObj2Ref} position={[-12, 1, 12]} />
        <AudioSrc ref={audioObj3Ref} position={[-12, 1, -12]} />
        <AudioSrc ref={audioObj4Ref} position={[12, 1, -12]} />
      </group>

      <Html fullscreen>
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
          }}
        >
          <button
            onClick={() => {
              initiateAudio({
                player: playerRef.current,
                audioSources: [
                  {
                    object: audioObj1Ref.current,
                    audio: "/audio-map-1/ralph/ralph-1-1.m4a",
                  },

                  {
                    object: audioObj2Ref.current,
                    audio: "/audio-map-1/ralph/ralph-1-2.m4a",
                  },
                  {
                    object: audioObj3Ref.current,
                    audio: "/audio-map-1/ralph/ralph-1-3.m4a",
                  },
                  {
                    object: audioObj4Ref.current,
                    audio: "/audio-map-1/ralph/ralph-1-4.m4a",
                  },
                ],
              });
            }}
          >
            start
          </button>
        </div>
      </Html>
    </group>
  );
};

const AudioSrc = forwardRef(
  (
    { position }: { position: [x: number, y: number, z: number] },
    ref: Ref<THREE.Mesh>
  ) => {
    return (
      <mesh position={position} ref={ref}>
        <sphereGeometry args={[0.75, 12, 12]} />
        <meshBasicMaterial color="blue" />
      </mesh>
    );
  }
);

AudioSrc.displayName = "AudioSrc";
