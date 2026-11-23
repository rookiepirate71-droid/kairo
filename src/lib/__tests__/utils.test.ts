import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BAYER_4X4, bayerThreshold } from "../dither";
import { ASCII_RAMP_DARK, toAscii } from "../ascii";
import { clamp01, easeInOutCubic, easeOutBack, easeOutExpo, lerp } from "../easing";
import {
  EXPLORE_ITEMS,
  EXPLORE_STEPS,
  FAQ,
  MARQUEE_ITEMS,
  NAV_LINKS,
  numeralFor,
  PILLARS,
  PLANS,
  SECTION_IDS,
  TABLETS,
  TESSERAE,
} from "../constants";

describe("dither", () => {
  it("has 16 normalized bayer values", () => {
    expect(BAYER_4X4).toHaveLength(16);
    for (const v of BAYER_4X4) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("wraps at any resolution", () => {
    expect(bayerThreshold(0, 0)).toBeCloseTo(0, 5);
    expect(bayerThreshold(4, 4)).toBe(bayerThreshold(0, 0));
  });
});

describe("ascii", () => {
  it("produces cols x (cols*aspect) grid", () => {
    const out = toAscii({ cols: 10, aspect: 0.5, lumaAt: () => 0.5 });
    const lines = out.split("\n");
    expect(lines).toHaveLength(5);
    for (const line of lines) expect(line).toHaveLength(10);
  });

  it("dark pixels get dense glyphs on a dark-on-light ramp", () => {
    const out = toAscii({
      cols: 2,
      aspect: 1,
      lumaAt: (x) => (x < 0.5 ? 0 : 1),
    });
    const lines = out.split("\n");
    expect(lines[0]?.startsWith(ASCII_RAMP_DARK[0] ?? "@")).toBe(true);
    expect(
      lines[0]?.endsWith(ASCII_RAMP_DARK[ASCII_RAMP_DARK.length - 1] ?? " "),
    ).toBe(true);
  });
});

describe("easing", () => {
  it("clamps to [0, 1]", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(1.5)).toBe(1);
  });

  it("eases the endpoints", () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeOutBack(1)).toBe(1);
  });

  it("lerps linearly", () => {
    expect(lerp(10, 20, 0.25)).toBe(12.5);
  });
});

describe("numeralFor", () => {
  it("generates sequential numerals from section order (marquee unnumbered)", () => {
    expect(numeralFor("manifesto")).toBe("I");
    expect(numeralFor("pillars")).toBe("II");
    expect(numeralFor("temple")).toBe("III");
    expect(numeralFor("access")).toBe("VIII");
  });

  it("numbers every declared section without gaps", () => {
    const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    SECTION_IDS.forEach((id, i) => {
      expect(numeralFor(id)).toBe(ROMAN[i]);
    });
  });

  it("returns empty for unknown ids", () => {
    expect(numeralFor("nonexistent" as never)).toBe("");
  });
});

describe("content invariants", () => {
  it("declares six pillars, seven tesserae, three plans, five tablets", () => {
    expect(PILLARS).toHaveLength(6);
    expect(TESSERAE).toHaveLength(7);
    expect(PLANS).toHaveLength(3);
    expect(TABLETS).toHaveLength(5);
    expect(FAQ.length).toBeGreaterThanOrEqual(5);
    expect(MARQUEE_ITEMS.length).toBeGreaterThanOrEqual(4);
  });

  it("pillar icons are 8x8 pixel grids with an ascii twin", () => {
    for (const p of PILLARS) {
      expect(p.pixels).toHaveLength(8);
      for (const row of p.pixels) {
        expect(row).toMatch(/^[01]{8}$/);
      }
      expect(p.ascii.length).toBeGreaterThan(0);
      expect(p.benefit.length).toBeGreaterThan(0);
    }
  });

  it("pricing is coherent: paid tiers have prices, enterprise does not", () => {
    for (const plan of PLANS) {
      if (plan.id === "emperor") {
        expect(plan.monthly).toBeNull();
        expect(plan.annual).toBeNull();
      } else {
        expect(typeof plan.monthly).toBe("number");
        expect(typeof plan.annual).toBe("number");
        expect(plan.monthly as number).toBeGreaterThan(0);
        expect(plan.annual as number).toBeLessThan(plan.monthly as number);
        expect(plan.annual).toBe(Math.round((plan.monthly as number) * 0.85));
      }
    }
    expect(PLANS.filter((p) => p.featured)).toHaveLength(1);
  });

  it("nav links all point at declared sections or routes", () => {
    for (const l of NAV_LINKS) {
      if (l.href.startsWith("#")) {
        expect((SECTION_IDS as readonly string[]).includes(l.href.slice(1))).toBe(
          true,
        );
      } else {
        expect(l.href.startsWith("/")).toBe(true);
      }
    }
  });

  it("explore library is coherent", () => {
    expect(EXPLORE_ITEMS.length).toBe(TESSERAE.length + PILLARS.length + 4);
    const cats = new Set(EXPLORE_ITEMS.map((i) => i.category));
    expect(cats).toEqual(new Set(["Build", "Pillar", "Rite"]));
    for (const item of EXPLORE_ITEMS) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.blurb.length).toBeGreaterThan(0);
      if (item.category === "Build") {
        expect(item.image?.startsWith("/generated/")).toBe(true);
      } else {
        expect(item.pixels?.every((r) => /^[01]{8}$/.test(r))).toBe(true);
      }
    }
    expect(EXPLORE_ITEMS.filter((i) => i.featured).length).toBeGreaterThanOrEqual(4);
    expect(EXPLORE_STEPS).toHaveLength(3);
  });

  it("every tessera carries alt text and a description", () => {
    for (const t of TESSERAE) {
      expect(t.alt.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.image.startsWith("/generated/")).toBe(true);
    }
    expect(new Set(TESSERAE.map((t) => t.id)).size).toBe(TESSERAE.length);
  });

  it("no lorem ipsum or placeholder copy anywhere", () => {
    const all = JSON.stringify({
      PILLARS,
      TESSERAE,
      PLANS,
      TABLETS,
      FAQ,
      MARQUEE_ITEMS,
    });
    expect(all.toLowerCase()).not.toContain("lorem");
    expect(all.toLowerCase()).not.toContain("ipsum");
    expect(all.toLowerCase()).not.toContain("welcome to our");
  });
});

// Regression: useRevealOrigin once registered its handlers on `window`, where
// `e.currentTarget` is the Window, so `target.getBoundingClientRect()` threw a
// TypeError on every pointermove anywhere on the page. Listeners must attach
// to the card element from the ref instead.
describe("useRevealOrigin listener registration", () => {
  const source = readFileSync(
    path.resolve(__dirname, "../../hooks/useRevealOrigin.ts"),
    "utf8",
  );

  it("attaches pointer/focus listeners to the card element, never window", () => {
    expect(source).not.toMatch(/window\.addEventListener\(/);
    expect(source).not.toMatch(/window\.removeEventListener\(/);
    expect(source).toMatch(/card\.addEventListener\("pointermove"/);
    expect(source).toMatch(/card\.addEventListener\("focusin"/);
  });

  it("guards against a missing card ref before wiring listeners", () => {
    expect(source).toMatch(/if \(!card\) return/);
  });
});

// Regression: Tesserae registered its arrow-key handler on `document`, so
// ArrowLeft/ArrowRight scrolled the carousel page-wide — even while typing in
// the Senate email input — and any second document-level handler would drive
// it twice. Arrow keys must work only when the carousel viewport has focus.
describe("Tesserae key listener registration", () => {
  const source = readFileSync(
    path.resolve(__dirname, "../../components/sections/Tesserae.tsx"),
    "utf8",
  );

  it("attaches keydown to the carousel viewport, never document", () => {
    expect(source).not.toMatch(/document\.addEventListener\("keydown"/);
    expect(source).not.toMatch(/document\.removeEventListener\("keydown"/);
    expect(source).toMatch(/node\.addEventListener\("keydown"/);
    expect(source).toMatch(/node\.removeEventListener\("keydown"/);
  });

  it("guards against a missing viewport node before wiring listeners", () => {
    expect(source).toMatch(/if \(!node\) return/);
  });

  it("keeps the embla viewport ref wired to the same element", () => {
    expect(source).toMatch(/emblaRef\(node\)/);
  });
});

// Regression: FinalCta held the magnetic button's offset in React state and
// called setOffset on every mousemove, re-rendering the whole section up to
// ~60x/s. The transform must be applied imperatively to the button ref and
// rAF-throttled — never through component state.
describe("FinalCta magnetic button registration", () => {
  const source = readFileSync(
    path.resolve(__dirname, "../../components/sections/FinalCta.tsx"),
    "utf8",
  );

  it("drives the transform via the button ref, never React state", () => {
    expect(source).not.toMatch(/useState/);
    expect(source).not.toMatch(/setOffset/);
    expect(source).toMatch(/\.style\.transform = `translate\(/);
    expect(source).toMatch(/const el = btnRef\.current/);
  });

  it("throttles mousemove work to requestAnimationFrame", () => {
    expect(source).toMatch(/requestAnimationFrame\(/);
    expect(source).toMatch(/cancelAnimationFrame\(rafRef\.current\)/);
  });

  it("cancels the pending frame on unmount", () => {
    expect(source).toMatch(/useEffect\(\(\) => \(\) => cancelAnimationFrame\(rafRef\.current\), \[\]\)/);
  });
});
