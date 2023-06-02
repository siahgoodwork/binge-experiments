import { Scene } from "./scene";
import { NextPage } from "next";

const Page: NextPage = () => {
  return (
    <div
      style={{
        background: "#E1E1E1",
        width: "100vw",
        height: "100vh",
      }}
    >
      <Scene />
    </div>
  );
};

export default Page;

export const metadata = { title: "Audio Map" };
