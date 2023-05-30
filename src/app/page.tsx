import { ThreeScene } from "./threejs";

export default function Home() {
  return (
    <main>
      <div id="three-root">
        <ThreeScene />
      </div>
    </main>
  );
}

export const metadata = { title: "lloll" };
