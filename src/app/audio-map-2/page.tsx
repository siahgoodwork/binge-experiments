"use client";
import { Scene } from "./scene";
import { NextPage } from "next";
import { RoomProvider } from "../liveblocks.config";
import { Suspense } from "react";
import { LiveObject } from "@liveblocks/client";

const Page: NextPage = () => {
  return (
    <RoomProvider
      id="audiomap"
      initialPresence={{ position: { x: 0, y: 0 }, character: null }}
      initialStorage={{
        siah: new LiveObject({ x: -23, y: -20 }),
        ralph: new LiveObject({ x: -24, y: -20 }),
        oli: new LiveObject({ x: -25, y: -20 }),
        joel: new LiveObject({ x: -26, y: -20 }),
      }}
    >
      <Suspense fallback={<div>Loading</div>}>
        <div
          style={{
            border: "1px solid #ccc",
            width: "100vw",
            height: "100vh",
          }}
        >
          <Scene />
        </div>
      </Suspense>
    </RoomProvider>
  );
};

export default Page;
