import { describe, expect, it } from "vitest";
import { wrapLines } from "./textLayout";

const mono = (s: string): number => s.length * 6; // 6px per character

describe("wrapLines", () => {
  it("keeps short text on one line", () => {
    expect(wrapLines(mono, "Daily metric refresh", 200)).toEqual(["Daily metric refresh"]);
  });

  it("wraps at the last word that fits", () => {
    expect(wrapLines(mono, "Streaming refresh + alerts", 120)).toEqual([
      "Streaming refresh +",
      "alerts",
    ]);
  });

  it("never splits a word wider than the line", () => {
    expect(wrapLines(mono, "Supercalifragilistic ok", 30)).toEqual(["Supercalifragilistic", "ok"]);
  });

  it("returns no lines for empty input", () => {
    expect(wrapLines(mono, "", 100)).toEqual([]);
  });
});
