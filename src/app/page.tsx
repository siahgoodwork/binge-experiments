"use client";

import dynamic from "next/dynamic";
// import { ThreeScene } from "./threejs";
const ThreeScene = dynamic(
  () => import("./threejs").then((mod) => mod.ThreeScene),
  { ssr: false }
);

export default function Home() {
  return (
    <main>
      <div id="three-root">
        <ThreeScene />
      </div>
    </main>
  );
}
