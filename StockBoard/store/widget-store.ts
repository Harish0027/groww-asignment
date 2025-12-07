"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  getWidgetStockData,
  WidgetType as APIWidgetType,
} from "@/lib/widget-api";

// --------------------
// Widget Types
// --------------------
export type CardWidgetData = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
};

export type TableWidgetData = CardWidgetData[];
export type ChartPoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
export type ChartWidgetData = ChartPoint[];
export type WidgetType = "card" | "table" | "chart";

export interface Widget {
  id: string;
  title: string;
  type: WidgetType;
  data: CardWidgetData | TableWidgetData | ChartWidgetData;
  symbols: string[];
  createdAt: string;
  refreshInterval?: number;
}

// --------------------
// Store Interface
// --------------------
interface WidgetStoreState {
  widgets: Widget[];
  refreshTimer: any;

  addWidget: (
    widget: Omit<Widget, "id" | "createdAt" | "data">
  ) => Promise<void>;
  updateWidgetData: (
    id: string,
    data: CardWidgetData | TableWidgetData | ChartWidgetData
  ) => void;
  removeWidget: (id: string) => void;
  refreshWidget: (id: string) => void;
  clearWidgets: () => void;
  startRefreshPolling: () => void;
  stopRefreshPolling: () => void;
}

// --------------------
// Store Implementation
// --------------------
export const useWidgetStore = create<WidgetStoreState>()(
  persist(
    (set, get) => ({
      widgets: [],
      refreshTimer: null,

      addWidget: async (widget) => {
        try {
          const data = await getWidgetStockData(
            widget.symbols,
            widget.type as APIWidgetType
          );

          let formattedData: CardWidgetData | TableWidgetData | ChartWidgetData;
          if (widget.type === "card") formattedData = data as CardWidgetData;
          else if (widget.type === "table")
            formattedData = data as TableWidgetData;
          else {
            const chartData: ChartWidgetData = [];
            const dataObj = data as Record<string, ChartPoint[]>;
            Object.values(dataObj).forEach((arr) => chartData.push(...arr));
            formattedData = chartData;
          }

          const newWidget: Widget = {
            ...widget,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            data: formattedData,
          };

          set((state) => ({ widgets: [...state.widgets, newWidget] }));
        } catch (err) {
          console.error("[WidgetStore] Failed to add widget:", err);
        }
      },

      updateWidgetData: (id, data) => {
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, data } : w)),
        }));
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }));
      },

      refreshWidget: async (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (!widget) return;

        try {
          const newData = await getWidgetStockData(
            widget.symbols,
            widget.type as APIWidgetType
          );
          let formattedData: CardWidgetData | TableWidgetData | ChartWidgetData;

          if (widget.type === "card") formattedData = newData as CardWidgetData;
          else if (widget.type === "table")
            formattedData = newData as TableWidgetData;
          else {
            const chartData: ChartWidgetData = [];
            const dataObj = newData as Record<string, ChartPoint[]>;
            Object.values(dataObj).forEach((arr) => chartData.push(...arr));
            formattedData = chartData;
          }

          get().updateWidgetData(id, formattedData);
        } catch (err) {
          console.error(
            `[WidgetStore] Failed to refresh widget ${widget.title}:`,
            err
          );
        }
      },

      clearWidgets: () => set({ widgets: [] }),

      startRefreshPolling: () => {
        if (get().refreshTimer) return;

        const timer = setInterval(() => {
          get().widgets.forEach((w) => {
            if (w.refreshInterval) get().refreshWidget(w.id);
          });
        }, 1000);

        set({ refreshTimer: timer });
      },

      stopRefreshPolling: () => {
        clearInterval(get().refreshTimer);
        set({ refreshTimer: null });
      },
    }),
    {
      name: "widget-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
      partialize: (state) => ({ widgets: state.widgets }),
    }
  )
);

// Auto-start polling
if (typeof window !== "undefined") {
  const store = useWidgetStore.getState();
  if (!store.refreshTimer) store.startRefreshPolling();
}
