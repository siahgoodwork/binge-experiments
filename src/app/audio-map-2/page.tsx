"use client";
import { Scene } from "./scene";
import { NextPage } from "next";
import { RoomProvider } from "../liveblocks.config";
import { Suspense } from "react";
import { LiveObject } from "@liveblocks/client";
import Head from "next/head";

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

        asiah: new LiveObject({ x: -23, y: -20 }),
        aralph: new LiveObject({ x: -24, y: -20 }),
        aoli: new LiveObject({ x: -25, y: -20 }),
        ajoel: new LiveObject({ x: -26, y: -20 }),
      }}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div
        style={{
          background: "#e1e1e1",
          width: "100vw",
          height: "100%",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Suspense fallback={<div>Loading</div>}>
          <Scene />
        </Suspense>
      </div>
    </RoomProvider>
  );
};

export default Page;
