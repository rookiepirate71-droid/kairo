"use client";

import dynamic from "next/dynamic";

const MarbleScene = dynamic(() => import("./MarbleScene"), {
  ssr: false,
  loading: () => null,
});

export default function HeroCanvas() {
  return (
    <div className="absolute inset-0">
      <MarbleScene />
    </div>
  );
}
