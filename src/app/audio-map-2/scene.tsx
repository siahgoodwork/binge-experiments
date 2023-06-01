"use client";

import { Html, OrthographicCamera, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { forwardRef, Ref, useCallback, useRef, useState } from "react";
import * as THREE from "three";
import {
  useMutation,
  useMyPresence,
  useOthers,
  useRoom,
  useStorage,
  useUpdateMyPresence,
} from "../liveblocks.config";

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
      sound.setRefDistance(0.5);
      sound.setMaxDistance(3);
      sound.setDistanceModel("linear");
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
  const destinationRef = useRef(new THREE.Vector3(4, 1, 0));

  const audioObj1Ref = useRef<THREE.Mesh>(null!);
  const audioObj2Ref = useRef<THREE.Mesh>(null!);
  const audioObj3Ref = useRef<THREE.Mesh>(null!);

  const audioCharSiahRef = useRef<THREE.Mesh>(null!);
  const audioCharRalphRef = useRef<THREE.Mesh>(null!);
  const audioCharOliRef = useRef<THREE.Mesh>(null!);
  const audioCharJoelRef = useRef<THREE.Mesh>(null!);

  const [myPresence, updateMyPresence] = useMyPresence();
  const liveCharPos = useStorage((root) => root);

  const worldMap = useTexture("/map-park.jpg");

  const setCharPos = useMutation(({ storage, self }) => {
    if (!self.presence.character) {
      console.log("select char");
      return;
    }

    if (!self.presence.position) {
      return;
    }
    storage
      .get(self.presence.character as "joel" | "oli" | "siah" | "ralph")
      .update(self.presence.position);
  }, []);

  const [status, setStatus] = useState("");

  const success: PositionCallback = useCallback(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const heading = position.coords.heading;
      setStatus(`lat: ${latitude}\nlon: ${longitude}\nhead: ${heading}`);

      const bounds = {
        lat: { min: -41.292339, max: -41.2904 },
        lon: { min: 174.783457, max: 174.786897 },
      };

      const posNorm = {
        x: (longitude - bounds.lon.min) / (bounds.lon.max - bounds.lon.min),
        y: (latitude - bounds.lat.min) / (bounds.lat.max - bounds.lat.min),
      };

      console.log(
        latitude,
        bounds.lat.min,
        bounds.lat.max,
        (latitude - bounds.lat.min) / (bounds.lat.max - bounds.lat.min)
      );

      const newPosX = -1 * (worldSize.w / 2) + worldSize.w * posNorm.x;
      const newPosZ = (-1 * worldSize.h) / 2 + -1 * worldSize.h * posNorm.y;

      const destination = destinationRef.current;
      destination.set(newPosX, 1, newPosZ);
      updateMyPresence({
        position: { x: newPosX, y: newPosZ },
      });

      try {
        setCharPos();
      } catch (err) {
        console.log(err);
      }
    },
    [setStatus, updateMyPresence, setCharPos, worldSize.h, worldSize.w]
  );

  const error = () => {};

  const triggerGeo = () => {
    navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 2,
    });
  };

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
            0.5
          );
          player.position.set(nextPos.x, nextPos.y, nextPos.z);
          const lookAtPos = new THREE.Vector3().lerpVectors(
            curPos,
            destination,
            -1
          );
          //player.lookAt(lookAtPos);
        }
      }
    }
  });

  return (
    <group>
      <OrthographicCamera
        makeDefault
        ref={cam}
        position={[0, 8, 7]}
        zoom={15}
      />
      <group>
        <group position={[0, 1, 0]} ref={playerRef}>
          <mesh>
            <sphereGeometry args={[0.85, 24, 24]} />
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

              updateMyPresence({
                position: { x: worldXY.x, y: worldXY.y },
              });

              try {
                setCharPos();
              } catch (err) {
                console.log(err);
              }
            }
          }}
        >
          <planeGeometry args={[worldSize.w, worldSize.h, 2, 2]} />
          <meshBasicMaterial map={worldMap} />
        </mesh>

        <AudioSrc ref={audioObj1Ref} position={[6, 1, 3]} />
        <AudioSrc ref={audioObj2Ref} position={[8, 1, -3]} />
        <AudioSrc ref={audioObj3Ref} position={[-9, 1, 4]} />

        <AudioSrc
          ref={audioCharSiahRef}
          character="siah"
          position={[liveCharPos.siah.x, 1, liveCharPos.siah.y]}
        />
        <AudioSrc
          ref={audioCharRalphRef}
          character="ralph"
          position={[liveCharPos.ralph.x, 1, liveCharPos.ralph.y]}
        />
        <AudioSrc
          ref={audioCharOliRef}
          character="oli"
          position={[liveCharPos.oli.x, 1, liveCharPos.oli.y]}
        />
        <AudioSrc
          ref={audioCharJoelRef}
          character="joel"
          position={[liveCharPos.joel.x, 1, liveCharPos.joel.y]}
        />
      </group>

      <Html fullscreen>
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            display: "flex",
            width: "calc(100% - 40px)",
            justifyContent: "space-between",
          }}
        >
          <div>
            <button
              onClick={() => {
                initiateAudio({
                  player: playerRef.current,
                  audioSources: [
                    //{ object: audioObj1Ref.current, audio: "/joel.m4a" },
                    //{ object: audioObj2Ref.current, audio: "/joel.m4a" },
                    //{ object: audioObj3Ref.current, audio: "/oli.m4a" },
                    {
                      object: audioCharOliRef.current,
                      audio: "/simple/oli.mp3",
                    },
                    {
                      object: audioCharJoelRef.current,
                      audio: "/simple/joel.mp3",
                    },
                    {
                      object: audioCharSiahRef.current,
                      audio: "/simple/kfc.mp3",
                    },
                    {
                      object: audioCharRalphRef.current,
                      audio: "/simple/ralph.mp3",
                    },
                  ],
                });
              }}
            >
              start
            </button>

            <button
              onClick={() => {
                triggerGeo();
              }}
            >
              Geolocate
            </button>
          </div>

          <div style={{ whiteSpace: "pre-line", fontSize: "10px" }}>
            {status}
          </div>
          <div>
            Moving as {myPresence.character}
            <br />
            v1.1
          </div>
          <div>
            {myPresence.position?.x.toFixed(2)}/
            {myPresence.position?.y.toFixed(2)}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            display: "flex",
            justifyContent: "space-between",
            width: "calc(100% - 40px)",
          }}
        >
          <button
            style={{ fontSize: "1.5em" }}
            onClick={() => {
              updateMyPresence({ character: "ralph" });
            }}
          >
            Ralph
          </button>
          <button
            style={{ fontSize: "1.5em" }}
            onClick={() => {
              updateMyPresence({ character: "joel" });
            }}
          >
            Joel
          </button>
          <button
            style={{ fontSize: "1.5em" }}
            onClick={() => {
              updateMyPresence({ character: "siah" });
            }}
          >
            Siah
          </button>
          <button
            style={{ fontSize: "1.5em" }}
            onClick={() => {
              updateMyPresence({ character: "oli" });
            }}
          >
            Oli
          </button>
        </div>
      </Html>
    </group>
  );
};

const AudioSrc = forwardRef(
  (
    {
      position,
      character,
    }: { position: [x: number, y: number, z: number]; character?: string },

    ref: Ref<THREE.Mesh>
  ) => {
    const color =
      character === "ralph"
        ? "brown"
        : character === "joel"
        ? "orange"
        : character === "oli"
        ? "purple"
        : character === "siah"
        ? "teal"
        : "black";
    return (
      <mesh position={position} ref={ref}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    );
  }
);

AudioSrc.displayName = "AudioSrc";
