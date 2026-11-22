import { PILLARS } from "@/lib/constants";

/**
 * Specimen-plate data for the Pillars section (pass 07).
 *
 * One source array for order, copy and labels; the drawing engine in
 * `sections/Pillars.tsx` branches on `order` (see its `sil()` switch).
 * `label.cellY`/`label.cellDist` are plate-grid cells (CELL px each).
 */
export interface OrderLabel {
  text: string;
  side: "L" | "R";
  cellY: number;
  cellDist: number;
}

export interface OrderPlate {
  /** silhouette index consumed by the engine's sil() switch */
  order: number;
  name: string;
  benefit: string;
  labels: OrderLabel[];
  /** sr-only sentence naming the parts of the capital */
  sr: string;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"] as const;

export function plateNumeral(i: number): string {
  return `PLATE ${ROMAN[i] ?? i + 1}`;
}

const pillarBenefit = (name: string): string =>
  PILLARS.find((p) => p.name === name)?.benefit ?? "";

export const ORDERS: OrderPlate[] = [
  {
    order: 0,
    name: "Doric",
    benefit: pillarBenefit("Doric"),
    labels: [
      { text: "ABACUS", side: "L", cellY: 6.5, cellDist: 12 },
      { text: "ECHINUS", side: "R", cellY: 9, cellDist: 10 },
      { text: "FLUTES", side: "L", cellY: 28, cellDist: 8 },
      { text: "NO BASE", side: "R", cellY: 44, cellDist: 8 },
    ],
    sr: "Doric capital: abacus, echinus, fluted shaft, no base.",
  },
  {
    order: 1,
    name: "Ionic",
    benefit: pillarBenefit("Ionic"),
    labels: [
      { text: "VOLUTE", side: "L", cellY: 10, cellDist: 14 },
      { text: "ECHINUS", side: "R", cellY: 10, cellDist: 8 },
      { text: "FILLETS", side: "L", cellY: 28, cellDist: 7 },
      { text: "BASE", side: "R", cellY: 46, cellDist: 9 },
    ],
    sr: "Ionic capital: volutes, echinus, filleted fluted shaft, base.",
  },
  {
    order: 2,
    name: "Corinthian",
    benefit: pillarBenefit("Corinthian"),
    labels: [
      { text: "VOLUTE", side: "L", cellY: 8, cellDist: 14 },
      { text: "ACANTHUS", side: "R", cellY: 13, cellDist: 10 },
      { text: "SLENDER", side: "L", cellY: 30, cellDist: 6 },
      { text: "BASE", side: "R", cellY: 46, cellDist: 9 },
    ],
    sr: "Corinthian capital: volutes, acanthus bell, slender fluted shaft, base.",
  },
  {
    order: 3,
    name: "Tuscan",
    benefit: pillarBenefit("Tuscan"),
    labels: [
      { text: "ABACUS", side: "L", cellY: 6.5, cellDist: 12 },
      { text: "ECHINUS", side: "R", cellY: 9, cellDist: 10 },
      { text: "NO FLUTES", side: "L", cellY: 28, cellDist: 8 },
      { text: "TORUS", side: "R", cellY: 46, cellDist: 9 },
    ],
    sr: "Tuscan capital: abacus, echinus, plain unfluted shaft, torus base.",
  },
  {
    order: 4,
    name: "Composite",
    benefit: pillarBenefit("Composite"),
    labels: [
      { text: "VOLUTE", side: "L", cellY: 10, cellDist: 14 },
      { text: "ACANTHUS", side: "R", cellY: 15, cellDist: 10 },
      { text: "FLUTES", side: "L", cellY: 30, cellDist: 6 },
      { text: "BASE", side: "R", cellY: 46, cellDist: 9 },
    ],
    sr: "Composite capital: Ionic volutes over a Corinthian acanthus bell, fluted shaft, base.",
  },
  {
    order: 5,
    name: "Caryatid",
    benefit: pillarBenefit("Caryatid"),
    labels: [
      { text: "CAPITAL", side: "L", cellY: 2.5, cellDist: 12 },
      { text: "HEAD", side: "R", cellY: 6.5, cellDist: 8 },
      { text: "PEPLUM", side: "L", cellY: 26, cellDist: 8 },
      { text: "GAIT", side: "R", cellY: 40, cellDist: 7 },
    ],
    sr: "Caryatid: basket capital, head, shoulders, draped peplum over one relaxed leg.",
  },
];
