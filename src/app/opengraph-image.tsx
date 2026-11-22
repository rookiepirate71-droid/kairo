import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Oraculum — Consult the oracle without leaving your shell";

export default function opengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0c0a",
          color: "#ede6d6",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 110, letterSpacing: 8 }}>
          ORACV·VM
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            fontStyle: "italic",
            color: "#a98a44",
          }}
        >
          Consult the oracle
          without leaving your shell
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 20,
            color: "#4a453c",
            letterSpacing: 3,
          }}
        >
          PROPHECY · PRECEDENT · YOUR NEXT COMMAND
        </div>
      </div>
    ),
    size,
  );
}
