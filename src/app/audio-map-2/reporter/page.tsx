"use client";
import { NextPage } from "next";
import { useCallback, useState } from "react";

const Page: NextPage = () => {
  const [status, setStatus] = useState("");
  const success: PositionCallback = useCallback(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const heading = position.coords.heading;
      setStatus(`lat: ${latitude}, lon: ${longitude}, head: ${heading}`);
    },
    [setStatus]
  );

  const error = () => {};

  const triggerGeo = () => {
    navigator.geolocation.watchPosition(success, error);
  };
  return (
    <div
      style={{
        border: "1px solid #ccc",
        width: "100vw",
        height: "100vh",
      }}
    >
      <button
        onClick={() => {
          triggerGeo();
        }}
      >
        Go
      </button>
      <br />
      {status}
    </div>
  );
};

export default Page;
