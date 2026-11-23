"use client";

import { useState } from "react";

/**
 * Full-height frame for a self-contained artifact page: sizes itself to
 * the artifact's real content height on load, so the iframe never
 * scrolls internally — wheel/touch over it scrolls the page instead.
 * Same-origin only (the artifacts ship from /public on the same host).
 */
export default function ArtifactFrame({
  src,
  title,
  minHeight = 600,
}: {
  src: string;
  title: string;
  minHeight?: number;
}) {
  const [height, setHeight] = useState<number | undefined>(undefined);

  return (
    <iframe
      src={src}
      title={title}
      onLoad={(e) => {
        const doc = e.currentTarget.contentDocument;
        if (!doc) return;
        setHeight(
          Math.max(
            minHeight,
            doc.documentElement.scrollHeight,
            doc.body?.scrollHeight ?? 0,
          ),
        );
      }}
      scrolling="no"
      loading="lazy"
      style={{ height: height ?? minHeight, display: "block", width: "100%", border: 0 }}
    />
  );
}
