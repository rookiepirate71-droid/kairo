"use client";

import { create } from "zustand";

interface OracleState {
  /** index of the open order in the MosaicCarousel modal, or null */
  activeOrder: number | null;
  openOrder: (i: number) => void;
  closeOrder: () => void;
  /** number of times the visitor has consulted the oracle */
  consultations: number;
  consult: () => void;
}

export const useOracleStore = create<OracleState>((set) => ({
  activeOrder: null,
  openOrder: (i) => set({ activeOrder: i }),
  closeOrder: () => set({ activeOrder: null }),
  consultations: 0,
  consult: () => set((s) => ({ consultations: s.consultations + 1 })),
}));
