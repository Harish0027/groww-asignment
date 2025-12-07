"use client";

import { create } from "zustand";

interface UIStore {
  addWidgetOpen: boolean;
  setAddWidgetOpen: (open: boolean) => void;
  toggleAddWidgetOpen: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  addWidgetOpen: false,
  setAddWidgetOpen: (open) => set({ addWidgetOpen: open }),
  toggleAddWidgetOpen: () =>
    set((state) => ({ addWidgetOpen: !state.addWidgetOpen })),
}));
