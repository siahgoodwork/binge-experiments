"use client";

import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

const videoWidth = 300;
const videoHeight = 200;

export const ThreeScene = () => {
  const [mouseX, setMouseX] = useState(0);
  const [mouseXTarget, setMouseXTarget] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const mouseXTargetRef = useRef<number>(0);

  const audioCtxRef = useRef<AudioContext>();

  const audioSrc1Gain = useRef<GainNode>();
  const audioSrc2Gain = useRef<GainNode>();
  const audioSrc3Gain = useRef<GainNode>();

  const startIt = () => {
    let audioCtx: AudioContext | undefined = audioCtxRef.current;
    if (audioCtx === undefined) {
      return;
    }
    let source1 = audioCtx.createBufferSource();
    let source2 = audioCtx.createBufferSource();
    let source3 = audioCtx.createBufferSource();
    let req1 = new XMLHttpRequest();
    let req2 = new XMLHttpRequest();
    let req3 = new XMLHttpRequest();

    req1.open("GET", "/oli-2.m4a", true);
    req3.open("GET", "/clock-ticking-2.mp3", true);
    req2.open("GET", "/joel-2.m4a", true);
    req1.responseType = "arraybuffer";
    req2.responseType = "arraybuffer";
    req3.responseType = "arraybuffer";

    /* @ts-ignore */
    const callbackfn = (req, source, audioSrcGainRef) => () => {
      const audioData = req.response;
      if (audioCtx === undefined) {
        return;
      }
      audioCtx.decodeAudioData(
        audioData,

        (buffer) => {
          if (audioCtx === undefined) {
            return;
          }
          let myBuffer = buffer;
          source.buffer = myBuffer;

          let gainNode = audioCtx.createGain();
          gainNode.connect(audioCtx.destination);
          audioSrcGainRef.current = gainNode;

          source.connect(gainNode);
          source.playbackRate.value = 1;
          source.loop = true;
          source.start();
        }
      );
    };

    req1.onload = callbackfn(req1, source1, audioSrc1Gain);
    req2.onload = callbackfn(req2, source2, audioSrc2Gain);
    req3.onload = callbackfn(req3, source3, audioSrc3Gain);

    req1.send();
    req2.send();
    req3.send();
  };

  useEffect(() => {
    const cb = () => {
      setMouseX(
        (_mouseX) => _mouseX + (mouseXTargetRef.current - _mouseX) / 20
      );
      window.requestAnimationFrame(cb);
    };
    const handle = window.requestAnimationFrame(cb);

    return () => {
      window.cancelAnimationFrame(handle);
    };
  }, []);

  useEffect(() => {
    audioCtxRef.current = new AudioContext();
  }, []);

  useEffect(() => {
    mouseXTargetRef.current = mouseXTarget;
  }, [mouseXTarget]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(() => setModelsLoaded(true));
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then((stream) => {
        let video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  const handleVideoOnPlay = () => {
    setInterval(async () => {
      if (videoRef && videoRef.current) {
        if (canvasRef && canvasRef.current) {
          //@ts-ignore
          canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(
            videoRef.current
          );

          const displaySize = {
            width: videoWidth,
            height: videoHeight,
          };

          faceapi.matchDimensions(canvasRef.current, displaySize);

          const detections = await faceapi
            .detectAllFaces(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();

          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );

          if (resizedDetections[0]) {
            const landmarks = resizedDetections[0].landmarks;
            if (landmarks.positions.length !== 68) {
              return;
            }
            const indices = [
              landmarks.positions[0],
              landmarks.positions[30],
              landmarks.positions[16],
            ];
            const lerp = Math.min(
              1,
              Math.max(
                0,
                (indices[1].x - indices[0].x) / (indices[2].x - indices[0].x)
              )
            );
            setMouseXTarget(() => lerp - 0.5);
          }

          /* draw to canvas 
          canvasRef &&
            canvasRef.current &&
            canvasRef.current
              .getContext("2d")
              ?.clearRect(0, 0, videoWidth, videoHeight);

          canvasRef &&
            canvasRef.current &&
            faceapi.draw.drawFaceLandmarks(
              canvasRef.current,
              resizedDetections
            );
						end draw to canvas */
        }
      }
    }, 100);
  };

  const closeWebcam = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      //@ts-ignore
      videoRef.current.srcObject?.getTracks()?.[0].stop();
      setCaptureVideo(false);
    }
  };

  const normMouseX = 1 - (mouseX + 0.5);

  useEffect(() => {
    const bleed = 0.01;
    if (audioSrc1Gain.current) {
      let a =
        1 - Math.max(0, Math.min(1, Math.abs(normMouseX - 0.165) / 0.165));
      a = Math.min(1, bleed + a);
      audioSrc1Gain.current.gain.value = a;
    }

    if (audioSrc2Gain.current) {
      let a = 1 - Math.max(0, Math.min(1, Math.abs(normMouseX - 0.5) / 0.165));

      a = Math.min(1, bleed + a);
      audioSrc2Gain.current.gain.value = a;
    }

    if (audioSrc3Gain.current) {
      let a = 1 - Math.max(0, Math.min(1, Math.abs(normMouseX - 0.83) / 0.165));
      a = Math.min(1, bleed + a);
      audioSrc3Gain.current.gain.value = a;
    }
  }, [normMouseX]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100%",
        position: "fixed",
        background: "yellow",
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          zIndex: 3,
          transform: "translate(-50%, 0)",
        }}
      >
        {1 - (mouseX + 0.5)}
        <div style={{ display: "flex", padding: "10px", gap: "10px" }}>
          {captureVideo && modelsLoaded ? (
            <button
              onClick={closeWebcam}
              style={{
                cursor: "pointer",
                fontFamily: "'__Patrick_Hand_3ca559', sans-serif",
                lineHeight: "1",
                padding: "5px 15px",
                backgroundColor: "#a784df",
                color: "white",
                fontSize: "15px",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Stop Tracking
            </button>
          ) : (
            <button
              onClick={startVideo}
              style={{
                cursor: "pointer",
                fontFamily: "'__Patrick_Hand_3ca559', sans-serif",
                backgroundColor: "#a784df",
                color: "white",
                lineHeight: "1",
                padding: "5px 15px",
                fontSize: "15px",
                border: "none",
                borderRadius: "10px",
              }}
            >
              Start Tracking
            </button>
          )}

          <button
            onClick={() => {
              startIt();
            }}
            style={{
              cursor: "pointer",
              fontFamily: "'__Patrick_Hand_3ca559', sans-serif",
              lineHeight: "1",
              padding: "5px 15px",
              backgroundColor: "#a784df",
              color: "white",
              fontSize: "15px",
              border: "none",
              borderRadius: "10px",
            }}
          >
            Start Audio
          </button>
        </div>
        {captureVideo ? (
          modelsLoaded ? (
            <div>
              <div
                style={{
                  display: "none",
                }}
              >
                <video //@ts-ignore
                  ref={videoRef}
                  height={videoHeight}
                  width={videoWidth}
                  onPlay={handleVideoOnPlay}
                  style={{ borderRadius: "10px" }}
                />
                {/* @ts-ignore */}
                <canvas ref={canvasRef} style={{ position: "absolute" }} />
              </div>
            </div>
          ) : (
            <div>loading...</div>
          )
        ) : (
          <></>
        )}
      </div>
      <b
        style={{
          width: "10px",
          height: "10px",
          background: "black",
          display: "block",
          textIndent: "-100em",
          overflow: "hidden",
          position: "absolute",
          left: `${window ? window.innerWidth * (1 - (mouseX + 0.5)) : 0}px`,
          top: "50%",
        }}
      >
        .
      </b>
      <div
        className="audioTracks"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <div
          style={{
            width: "33.333%",
            height: "20%",
            borderBottom: "1px solid #fff",
          }}
        >
          <input
            style={{ width: "100%", height: "100%" }}
            type="file"
            id="audio1"
            className="audio"
          />
          {(
            1 - Math.max(0, Math.min(1, Math.abs(normMouseX - 0.165) / 0.165))
          ).toFixed(1)}
        </div>
        <div
          style={{
            width: "33.333%",
            height: "20%",
            borderBottom: "1px solid #fff",
          }}
        >
          <input
            style={{ width: "100%", height: "100%" }}
            type="file"
            id="audio1"
            className="audio"
          />

          {(
            1 - Math.max(0, Math.min(1, Math.abs(normMouseX - 0.5) / 0.165))
          ).toFixed(1)}
        </div>
        <div
          style={{
            width: "33.333%",
            height: "20%",
            borderBottom: "1px solid #fff",
          }}
        >
          <input
            style={{ width: "100%", height: "100%" }}
            type="file"
            id="audio1"
            className="audio"
          />

          {(
            1 - Math.max(0, Math.min(1, Math.abs(normMouseX - 0.83) / 0.165))
          ).toFixed(1)}
        </div>
      </div>
    </div>
  );
};
