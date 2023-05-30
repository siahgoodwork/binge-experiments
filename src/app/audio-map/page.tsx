import { Scene } from "./scene";
import { NextPage } from "next";

const Page: NextPage = () => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        width: "90vw",
        height: "90vh",
      }}
    >
      <Scene />
    </div>
  );
};

export default Page;

export const metadata = { title: "Audio Map" };
