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
      style={{
        background: "#e1e1e1",
      }}
      gl={{
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <ambientLight color="white" intensity={3} />
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
  audioSources: {
    object: THREE.Group | THREE.Mesh;
    audio: string;
    radius: number;
  }[];
}) => {
  const listener = new THREE.AudioListener();
  player.add(listener);

  audioSources.forEach((src) => {
    const sound = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(src.audio, function (buffer) {
      sound.setBuffer(buffer);
      sound.setRefDistance(0.3);
      sound.setMaxDistance(src.radius);
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
  const audioObj1FocusRef = useRef<THREE.Mesh>(null!);
  const audioObj2FocusRef = useRef<THREE.Mesh>(null!);
  const audioObj3FocusRef = useRef<THREE.Mesh>(null!);

  const audioCharSiahRef = useRef<THREE.Mesh>(null!);
  const audioCharRalphRef = useRef<THREE.Mesh>(null!);
  const audioCharOliRef = useRef<THREE.Mesh>(null!);
  const audioCharJoelRef = useRef<THREE.Mesh>(null!);

  const [myPresence, updateMyPresence] = useMyPresence();
  const liveCharPos = useStorage((root) => root);

  const [worldMap, personMap] = useTexture(["/map-park.jpg", "/person.png"]);
  //const worldMap = useTexture("/map-queen.jpg");

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
        lat: { min: -41.2904, max: -41.292339 },
        lon: { min: 174.783457, max: 174.786897 },
      };

      // queen st
      // const bounds = {
      //   lat: { min: -41.295739, max: -41.300392 },
      //   lon: { min: 174.783103, max: 174.788581 },
      // };

      const posNorm = {
        x: (longitude - bounds.lon.min) / (bounds.lon.max - bounds.lon.min),
        y: (latitude - bounds.lat.min) / (bounds.lat.max - bounds.lat.min),
      };

      const newPosX = -1 * (worldSize.w / 2) + worldSize.w * posNorm.x;
      const newPosZ = (-1 * worldSize.h) / 2 + worldSize.h * posNorm.y;

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
        zoom={20}
      />
      <group>
        <group position={[0, 1, 0]} ref={playerRef}>
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.35, 24, 24]} />
            <meshBasicMaterial color="#00aa35" />
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

        {/* jungle*/}
        <AudioSrc ref={audioObj1FocusRef} radius={1} position={[-1, 0.2, 8]} />
        <AudioSrc ref={audioObj1Ref} radius={4} position={[0, 0.1, 8]} />

        <AudioSrc
          ref={audioObj2FocusRef}
          radius={1}
          position={[-5.3, 0.13, 0]}
        />
        <AudioSrc ref={audioObj2Ref} radius={4} position={[-4.3, 0.1, 1]} />

        {/* underwater */}
        <AudioSrc ref={audioObj3FocusRef} radius={4} position={[3, 0.13, -1]} />

        {/* shore */}
        <AudioSrc ref={audioObj3Ref} radius={4} position={[2, 0.1, 1]} />

        <AudioSrc
          ref={audioCharSiahRef}
          character="siah"
          position={[liveCharPos.siah.x, 1.5, liveCharPos.siah.y]}
        />
        <AudioSrc
          ref={audioCharRalphRef}
          character="ralph"
          position={[liveCharPos.ralph.x, 1.5, liveCharPos.ralph.y]}
        />
        <AudioSrc
          ref={audioCharOliRef}
          character="oli"
          position={[liveCharPos.oli.x, 1.5, liveCharPos.oli.y]}
        />
        <AudioSrc
          ref={audioCharJoelRef}
          character="joel"
          position={[liveCharPos.joel.x, 1.5, liveCharPos.joel.y]}
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
              style={{ height: "40px", width: "80px" }}
              onClick={(e) => {
                initiateAudio({
                  player: playerRef.current,
                  audioSources: [
                    // jungle
                    {
                      object: audioObj1Ref.current,
                      radius: 3,
                      audio: "/land-sound/jungle.mp3",
                    },

                    // tiger
                    {
                      object: audioObj1FocusRef.current,
                      radius: 2,
                      audio: "/land-sound/tiger.mp3",
                    },

                    // mountain
                    {
                      object: audioObj2Ref.current,
                      radius: 3,
                      audio: "/land-sound/mountain.mp3",
                    },

                    // birds
                    {
                      object: audioObj2FocusRef.current,
                      radius: 2,
                      audio: "/land-sound/bird.mp3",
                    },

                    // shore
                    {
                      object: audioObj3Ref.current,
                      radius: 3,
                      audio: "/land-sound/shore.mp3",
                    },

                    // underwater
                    {
                      object: audioObj3FocusRef.current,
                      radius: 3,
                      audio: "/land-sound/underwater.mp3",
                    },

                    {
                      object: audioCharOliRef.current,
                      audio: "/land-sound/parktones-2.mp3",
                      radius: 2,
                    },
                    {
                      object: audioCharJoelRef.current,
                      audio: "/land-sound/parktones-5.mp3",
                      radius: 2,
                    },
                    {
                      object: audioCharSiahRef.current,
                      audio: "/land-sound/parktones-6.mp3",
                      radius: 2,
                    },
                    {
                      object: audioCharRalphRef.current,
                      audio: "/energy.mp3",
                      radius: 2,
                    },
                  ],
                });
                (e.target as HTMLButtonElement).disabled = true;
              }}
            >
              start
            </button>

            <button
              style={{ height: "40px", width: "80px" }}
              onClick={(e) => {
                triggerGeo();
                (e.target as HTMLButtonElement).disabled = true;
              }}
            >
              locate
            </button>
          </div>

          {/*
						<div style={{ whiteSpace: "pre-line", fontSize: "10px" }}>
							{status}
						</div>

						*/}
          <div>
            I am {myPresence.character}
            <br />
            v1.2
          </div>
          <div>
            {myPresence.position?.x.toFixed(2)}
            <br />
            {myPresence.position?.y.toFixed(2)}
          </div>
        </div>
        {myPresence.character === null && (
          <div
            style={{
              background: "#f3f3f3",
              width: "100%",
              height: "100%",
              zIndex: "40",
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <h1>Select Your Character</h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 100px",
                gridTemplateRows: "50px 50px 50px 40px",
                gap: "10px",
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
                  updateMyPresence({ character: "ralph" });
                }}
              >
                Ralph
              </button>
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
                  updateMyPresence({ character: "ralph" });
                }}
              >
                Ralph
              </button>
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
          </div>
        )}{" "}
      </Html>
    </group>
  );
};

const AudioSrc = forwardRef(
  (
    {
      position,
      character,
      radius,
    }: {
      position: [x: number, y: number, z: number];
      character?: string;
      radius?: number;
    },

    ref: Ref<THREE.Mesh>
  ) => {
    const [personMap, areaSmallMap, areaAlphaMap] = useTexture([
      "/person.png",
      "/area-small-alpha.png",
      "/area-alpha.png",
    ]);
    const color =
      character === "ralph"
        ? "brown"
        : character === "joel"
        ? "orange"
        : character === "oli"
        ? "purple"
        : character === "siah"
        ? "teal"
        : "yellow";

    if (character) {
      return (
        <mesh position={position} ref={ref}>
          <planeBufferGeometry args={[1, 3]} />
          <meshBasicMaterial map={personMap} transparent={true} />
        </mesh>
      );
    }
    return (
      <mesh position={position} ref={ref} rotation={[Math.PI / -2, 0, 0]}>
        <planeGeometry args={[radius ? radius : 0.5, radius ? radius : 0.5]} />
        {/*
					<sphereGeometry args={[radius ? radius / 2 : 0.5, 12, 12]} />
					*/}

        <meshBasicMaterial
          // map={areaMap}
          color="blue"
          transparent={true}
          depthWrite={false}
          alphaMap={radius && radius < 2 ? areaSmallMap : areaAlphaMap}
        />
      </mesh>
    );
  }
);

AudioSrc.displayName = "AudioSrc";
