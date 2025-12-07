"use client";

import { useState, useEffect } from "react";
import { SiteWrapper } from "@/components/site-wrapper";
import {
  StockData,
  StockHistoricalData,
  getStockQuote,
  getHistoricalData,
} from "@/lib/api";
import { StockSearch } from "@/components/stock-search";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { useStockStore } from "../../../store/dashboard-store";

// Color palette for different stocks in the comparison chart
const chartColors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#ff6b6b",
  "#6bd7ff",
  "#d88884",
];

function StockComparisonManager() {
  const [comparedStocks, setComparedStocks] = useState<StockData[]>([]);
  const [historicalData, setHistoricalData] = useState<{
    [key: string]: StockHistoricalData[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [normalizeData, setNormalizeData] = useState(true);

  // Zustand store for global watchlist if needed
  const addToWatchlist = useStockStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStockStore((s) => s.removeFromWatchlist);
  const isInWatchlist = useStockStore((s) => s.isInWatchlist);

  // Add a stock to comparison
  const handleAddStock = async (symbol: string) => {
    if (comparedStocks.some((s) => s.symbol === symbol)) return;
    setIsLoading(true);
    try {
      const stockData = await getStockQuote(symbol);
      if (stockData) {
        setComparedStocks((prev) => [...prev, stockData]);
        await fetchHistoricalData(symbol, timeframe);
      }
    } catch (err) {
      console.error(`Error adding stock ${symbol}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove stock
  const handleRemoveStock = (symbol: string) => {
    setComparedStocks((prev) => prev.filter((s) => s.symbol !== symbol));
    setHistoricalData((prev) => {
      const newData = { ...prev };
      delete newData[symbol];
      return newData;
    });
  };

  // Fetch historical data
  const fetchHistoricalData = async (
    symbol: string,
    interval: "daily" | "weekly" | "monthly"
  ) => {
    try {
      const data = await getHistoricalData(symbol, interval);
      setHistoricalData((prev) => ({ ...prev, [symbol]: data }));
    } catch (err) {
      console.error(`Error fetching historical data for ${symbol}:`, err);
    }
  };

  // Update all historical data when timeframe changes
  useEffect(() => {
    if (comparedStocks.length === 0) return;
    const updateAll = async () => {
      setIsLoading(true);
      await Promise.all(
        comparedStocks.map((stock) =>
          fetchHistoricalData(stock.symbol, timeframe)
        )
      );
      setIsLoading(false);
    };
    updateAll();
  }, [timeframe, comparedStocks]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!Object.keys(historicalData).length) return [];
    const firstSymbol = Object.keys(historicalData)[0];
    const firstStockData = historicalData[firstSymbol];
    if (!firstStockData?.length) return [];

    const startingValues: { [key: string]: number } = {};
    if (normalizeData) {
      Object.keys(historicalData).forEach((symbol) => {
        const data = historicalData[symbol];
        if (data?.length) startingValues[symbol] = data[0].close;
      });
    }

    return firstStockData.map((point, index) => {
      const dp: Record<string, string | number> = { date: point.date };
      Object.keys(historicalData).forEach((symbol) => {
        const data = historicalData[symbol];
        if (data && index < data.length) {
          dp[symbol] = normalizeData
            ? ((data[index].close - startingValues[symbol]) /
                startingValues[symbol]) *
              100
            : data[index].close;
        }
      });
      return dp;
    });
  };

  const chartData = prepareChartData();

  const formatYAxis = (value: number) =>
    normalizeData ? `${value.toFixed(0)}%` : `$${value.toFixed(0)}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-background border p-2 rounded shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <div className="space-y-1 mt-1">
            {payload.map((entry: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs font-medium">{entry.name}:</span>
                <span className="text-xs">
                  {normalizeData
                    ? entry.value.toFixed(2) + "%"
                    : "$" + entry.value.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Compare Stocks
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze and compare performance of multiple stocks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Add Stocks */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Add Stocks</h2>
            <div className="space-y-3">
              <StockSearch onSelect={handleAddStock} />
              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              )}

              {comparedStocks.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Selected Stocks</h3>
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {comparedStocks.map((stock, index) => (
                        <motion.li
                          key={stock.symbol}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  chartColors[index % chartColors.length],
                              }}
                            />
                            <span className="font-medium">{stock.symbol}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleRemoveStock(stock.symbol)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">
                              Remove {stock.symbol}
                            </span>
                          </Button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Chart Options */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-3">Chart Options</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Time Range</h3>
                <Tabs
                  value={timeframe}
                  onValueChange={(v) =>
                    setTimeframe(v as "daily" | "weekly" | "monthly")
                  }
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">Display</h3>
                <div className="flex gap-2">
                  <Button
                    variant={normalizeData ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNormalizeData(true)}
                    className="flex-1"
                  >
                    <LineChartIcon className="h-4 w-4 mr-1" /> Relative %
                  </Button>
                  <Button
                    variant={!normalizeData ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNormalizeData(false)}
                    className="flex-1"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" /> Actual $
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3">
          {comparedStocks.length === 0 ? (
            <div className="border rounded-lg p-8 text-center h-full flex flex-col items-center justify-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Stocks to Compare</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Add stocks using the search box to start comparing their
                performance
              </p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="border rounded-lg p-8 flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Performance Comparison</h2>
                <div className="text-xs text-muted-foreground">
                  {normalizeData ? "% Change (normalized)" : "Stock Price ($)"}
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickMargin={8}
                    />
                    <YAxis
                      tickFormatter={formatYAxis}
                      tick={{ fontSize: 12 }}
                      tickMargin={8}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {comparedStocks.map((stock, i) => (
                      <Line
                        key={stock.symbol}
                        type="monotone"
                        dataKey={stock.symbol}
                        name={stock.symbol}
                        stroke={chartColors[i % chartColors.length]}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <SiteWrapper>
      <StockComparisonManager />
    </SiteWrapper>
  );
}
