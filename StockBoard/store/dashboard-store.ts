"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { StockData, getTrendingStocks, getStockQuote } from "@/lib/api";

interface Portfolio {
  id: string;
  name: string;
  stocks: string[];
  createdAt: string;
}

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  isAbove: boolean;
  createdAt: string;
  triggered: boolean;
}

interface StoreState {
  trendingStocks: StockData[];
  watchlist: string[];
  watchlistStocks: StockData[];
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;

  priceAlerts: PriceAlert[];
  triggeredAlerts: PriceAlert[];

  isLoading: boolean;
  apiError: boolean;

  refreshStocks: () => Promise<void>;

  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;

  createPortfolio: (name: string) => void;
  deletePortfolio: (id: string) => void;
  addToPortfolio: (portfolioId: string, symbol: string) => void;
  removeFromPortfolio: (portfolioId: string, symbol: string) => void;
  getPortfolioStocks: (portfolioId: string) => Promise<StockData[]>;

  setActivePortfolio: (p: Portfolio | null) => void;

  createPriceAlert: (
    symbol: string,
    targetPrice: number,
    isAbove: boolean
  ) => void;
  deletePriceAlert: (id: string) => void;
  getAlertedStocks: () => Promise<StockData[]>;
  clearTriggeredAlerts: () => void;

  resetAndRetryStocks: () => void;

  failureCount: number;
  pollingTimer: any;
  startPolling: () => void;
}

export const useStockStore = create<StoreState>()(
  persist(
    (set, get) => ({
      trendingStocks: [],
      watchlist: [],
      watchlistStocks: [],
      portfolios: [],
      activePortfolio: null,

      priceAlerts: [],
      triggeredAlerts: [],

      isLoading: false,
      apiError: false,

      failureCount: 0,
      pollingTimer: null,

      //---------------------------------------------------
      // REFRESH STOCKS
      //---------------------------------------------------
      refreshStocks: async () => {
        const { watchlist } = get();
        set({ isLoading: true });

        try {
          const trending = await getTrendingStocks();

          if (Array.isArray(trending) && trending.length > 0) {
            const prev = JSON.stringify(get().trendingStocks);
            const next = JSON.stringify(trending);

            if (prev !== next) set({ trendingStocks: trending });

            set({ failureCount: 0, apiError: false });
          } else {
            set({ failureCount: get().failureCount + 1 });
          }

          if (watchlist.length > 0) {
            const stocks = await Promise.all(
              watchlist.map((symbol) => getStockQuote(symbol))
            );

            set({
              watchlistStocks: stocks.filter((s): s is StockData => s !== null),
            });
          }
        } catch (err) {
          set({ failureCount: get().failureCount + 1 });
        } finally {
          set({ isLoading: false });

          if (get().failureCount >= 3) {
            clearInterval(get().pollingTimer);
            set({ apiError: true });
          }
        }
      },

      //---------------------------------------------------
      // POLLING (safe for Next.js)
      //---------------------------------------------------
      startPolling: () => {
        if (get().pollingTimer) return; // Prevent double timers

        const timer = setInterval(() => {
          get().refreshStocks();
        }, 15000);

        set({ pollingTimer: timer });
      },

      //---------------------------------------------------
      // WATCHLIST
      //---------------------------------------------------
      addToWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist
            : [...state.watchlist, symbol],
        })),

      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
        })),

      isInWatchlist: (symbol) => get().watchlist.includes(symbol),

      
     ,

      //---------------------------------------------------
      // PRICE ALERTS
      //---------------------------------------------------
      createPriceAlert: (symbol, targetPrice, isAbove) => {
        if (!get().watchlist.includes(symbol)) {
          get().addToWatchlist(symbol);
        }

        const alert: PriceAlert = {
          id: Date.now().toString(),
          symbol,
          targetPrice,
          isAbove,
          createdAt: new Date().toISOString(),
          triggered: false,
        };

        set((state) => ({ priceAlerts: [...state.priceAlerts, alert] }));
      },

      deletePriceAlert: (id) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.id !== id),
        })),

      getAlertedStocks: async () => {
        const symbols = [...new Set(get().priceAlerts.map((a) => a.symbol))];
        if (symbols.length === 0) return [];

        const stocks = await Promise.all(symbols.map((s) => getStockQuote(s)));
        return stocks.filter((s): s is StockData => s !== null);
      },

      clearTriggeredAlerts: () => set({ triggeredAlerts: [] }),

      //---------------------------------------------------
      // RESET AFTER FAILURE
      //---------------------------------------------------
      resetAndRetryStocks: () => {
        set({ failureCount: 0, apiError: false });
        get().refreshStocks();

        if (!get().pollingTimer) get().startPolling();
      },
    }),

    //---------------------------------------------------
    // PERSIST (FIXED FOR NEXT.JS)
    //---------------------------------------------------
    {
      name: "stock-store",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") return localStorage;

        // Server-side fallback (no warnings)
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),

      partialize: (state) => ({
        watchlist: state.watchlist,
        portfolios: state.portfolios,
        priceAlerts: state.priceAlerts,
      }),
    }
  )
);

// RUN ONLY ON CLIENT
if (typeof window !== "undefined") {
  const store = useStockStore.getState();

  if (!store.pollingTimer) store.startPolling();
  store.refreshStocks();
}
