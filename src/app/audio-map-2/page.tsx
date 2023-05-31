"use client";
import { Scene } from "./scene";
import { NextPage } from "next";
import { RoomProvider } from "../liveblocks.config";

const Page: NextPage = () => {
  return (
    <RoomProvider
      id="audiomap"
      initialPresence={{ position: { x: 0, y: 0 }, character: null }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          width: "100vw",
          height: "100vh",
        }}
      >
        <Scene />
      </div>
    </RoomProvider>
  );
};

export default Page;
