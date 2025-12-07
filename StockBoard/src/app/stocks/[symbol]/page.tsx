"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownRight,
  Star,
  RefreshCw,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StockData,
  StockHistoricalData,
  getStockQuote,
  getHistoricalData,
} from "@/lib/api";
import { SiteWrapper } from "@/components/site-wrapper";
import { StockChart } from "@/components/stock-chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { StockSearch } from "@/components/stock-search";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useStockStore } from "../../../../store/dashboard-store";

function StockDetails() {
  const params = useParams<{ symbol: string }>();
  const symbol = params.symbol as string;

  // Zustand store hooks
  const addToWatchlist = useStockStore((state) => state.addToWatchlist);
  const removeFromWatchlist = useStockStore(
    (state) => state.removeFromWatchlist
  );
  const isInWatchlist = useStockStore((state) => state.isInWatchlist);

  const [stock, setStock] = useState<StockData | null>(null);
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>(
    []
  );
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle watchlist
  const toggleWatchlist = () => {
    if (isInWatchlist(symbol)) removeFromWatchlist(symbol);
    else addToWatchlist(symbol);
  };

  // Fetch stock data
  const fetchStockData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const stockData = await getStockQuote(symbol);
      setStock(stockData);

      const histData = await getHistoricalData(symbol, timeframe);
      setHistoricalData(Array.isArray(histData) ? histData : []);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  useEffect(() => {
    setIsLoading(true);
    fetchStockData();
    const intervalId = setInterval(fetchStockData, 15000); // Poll every 15s
    return () => clearInterval(intervalId);
  }, [symbol, timeframe, fetchStockData]);

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as "daily" | "weekly" | "monthly");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  // Format large numbers
  const formatLargeNumber = (num?: number) =>
    num ? num.toLocaleString("en-US") : "-";

  const safeToFixed = (value?: number, digits = 2, fallback = "-") => {
    return typeof value === "number" && !isNaN(value)
      ? value.toFixed(digits)
      : fallback;
  };

  const calculateYTD = () => Math.random() * 20 - 10; // Mock YTD

  if (isLoading && !stock) {
    return (
      <div className="py-6 md:py-10 flex justify-center">
        <div className="animate-pulse space-y-4 md:space-y-6 w-full max-w-4xl">
          <div className="h-8 bg-muted rounded w-1/3 sm:w-1/4"></div>
          <div className="h-48 sm:h-64 bg-muted rounded"></div>
          <div className="h-32 sm:h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <motion.div
        className="py-6 md:py-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Stock not found</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto px-4 sm:px-0">
          We couldn't find the stock you’re looking for.
        </p>
        <div className="max-w-md mx-auto px-4 sm:px-0">
          <StockSearch />
        </div>
      </motion.div>
    );
  }

  const ytdReturn = calculateYTD();
  const isPositiveYTD = ytdReturn >= 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={symbol}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-6 md:space-y-8"
      >
        {/* Stock Header */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-4 md:pb-6"
          variants={itemVariants}
        >
          <div>
            <div className="flex items-start gap-2 md:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {symbol}
              </h1>
              <div className="flex gap-2 items-center mt-1">
                <Toggle
                  aria-label="Toggle watchlist"
                  pressed={isInWatchlist(symbol)}
                  onPressedChange={toggleWatchlist}
                  className="transition-all duration-300"
                >
                  <Star
                    className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 ${
                      isInWatchlist(symbol)
                        ? "fill-yellow-400 text-yellow-400"
                        : ""
                    }`}
                  />
                </Toggle>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={fetchStockData}
                  disabled={isRefreshing}
                  className="h-8 w-8"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className="sr-only">Refresh</span>
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg mt-1">
              {stock.name}
            </p>
          </div>

          <motion.div
            className="flex flex-col items-start md:items-end mt-2 md:mt-0"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="flex items-center gap-2">
              <div className="text-2xl sm:text-3xl font-bold">
                ${safeToFixed(stock.price)}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Last updated: {new Date().toLocaleTimeString()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div
              className={`flex items-center ${
                stock.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stock.change >= 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span>{safeToFixed(Math.abs(stock.change))}</span>
              <span className="ml-1">
                ({safeToFixed(Math.abs(stock.changePercent))}%)
              </span>
            </div>
            <div
              className={`text-xs mt-1 ${
                isPositiveYTD ? "text-green-500" : "text-red-500"
              }`}
            >
              YTD: {isPositiveYTD ? "+" : ""}
              {safeToFixed(ytdReturn)}%
            </div>
          </motion.div>
        </motion.div>

        {/* Price History */}
        <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Price History
            </h2>
            <Tabs
              defaultValue="daily"
              value={timeframe}
              onValueChange={handleTimeframeChange}
              className="w-full sm:w-auto max-w-[300px]"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={timeframe}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <StockChart data={historicalData} symbol={symbol} />
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function StockPage() {
  return (
    <SiteWrapper>
      <StockDetails />
    </SiteWrapper>
  );
}
