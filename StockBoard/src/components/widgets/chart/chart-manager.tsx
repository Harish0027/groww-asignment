"use client";

import { useState, useEffect } from "react";
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

// Chart colors
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

interface Props {
  data?: any[];
  type?: "card" | "table" | "chart";
}

export default function WidgetChartContainer({ data, type }: Props) {
  const [comparedStocks, setComparedStocks] = useState<StockData[]>([]);
  const [historicalData, setHistoricalData] = useState<{
    [key: string]: StockHistoricalData[];
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [normalizeData, setNormalizeData] = useState(true);

  // Add stock
  const handleAddStock = async (symbol: string) => {
    if (comparedStocks.some((s) => s.symbol === symbol)) return;

    setIsLoading(true);
    try {
      const stockData = await getStockQuote(symbol);
      if (stockData) {
        setComparedStocks((prev) => [...prev, stockData]);
        await fetchHistoricalData(symbol, timeframe);
      }
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
    } catch (e) {
      console.error(e);
    }
  };

  // Update data on timeframe change
  useEffect(() => {
    if (comparedStocks.length === 0) return;
    const update = async () => {
      setIsLoading(true);
      await Promise.all(
        comparedStocks.map((s) => fetchHistoricalData(s.symbol, timeframe))
      );
      setIsLoading(false);
    };
    update();
  }, [timeframe, comparedStocks]);

  // Prepare chart data
  const prepareChartData = () => {
    if (Object.keys(historicalData).length === 0) return [];
    const firstSymbol = Object.keys(historicalData)[0];
    const firstStockData = historicalData[firstSymbol];
    if (!firstStockData || firstStockData.length === 0) return [];

    const startingValues: Record<string, number> = {};
    if (normalizeData) {
      Object.keys(historicalData).forEach((symbol) => {
        const data = historicalData[symbol];
        startingValues[symbol] = data[0].close;
      });
    }

    return firstStockData.map((point, index) => {
      const obj: Record<string, any> = { date: point.date };
      Object.keys(historicalData).forEach((symbol) => {
        const data = historicalData[symbol];
        if (index < data.length) {
          obj[symbol] = normalizeData
            ? ((data[index].close - startingValues[symbol]) /
                startingValues[symbol]) *
              100
            : data[index].close;
        }
      });
      return obj;
    });
  };

  const chartData = prepareChartData();

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload) {
      return (
        <div className="bg-background border p-2 rounded shadow-lg">
          <p className="font-medium text-sm">{label}</p>
          {payload.map((item: any, i: number) => (
            <div className="flex gap-2 text-xs mt-1" key={i}>
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}: </span>
              <span>
                {normalizeData
                  ? `${item.value.toFixed(2)}%`
                  : `$${item.value.toFixed(2)}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Compare Stocks</h1>

      {/* Container wraps left + chart options + chart */}
      <div
        className={`flex flex-col gap-6 ${
          type === "chart" ? "w-full" : "lg:flex-row"
        }`}
      >
        {/* Left panel: Add Stocks + Chart Options */}
        <div
          className={`flex flex-col gap-6 ${
            type === "chart" ? "w-full" : "lg:w-1/4 w-full"
          }`}
        >
          {/* Add Stocks */}
          {type !== "chart" && (
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Add Stocks</h2>
              <StockSearch onSelect={handleAddStock} />

              {isLoading && (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 animate-spin border-b-2 border-primary rounded-full" />
                </div>
              )}

              {comparedStocks.length > 0 && (
                <ul className="mt-4 space-y-2">
                  <AnimatePresence>
                    {comparedStocks.map((stock, i) => (
                      <motion.li
                        key={stock.symbol}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center justify-between bg-muted/40 p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                chartColors[i % chartColors.length],
                            }}
                          />
                          <span>{stock.symbol}</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStock(stock.symbol)}
                          className="h-7 w-7"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          )}

          {/* Chart Options */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Chart Options</h2>

            <div>
              <h3 className="text-sm font-medium mb-2">Time Range</h3>
              <Tabs
                value={timeframe}
                onValueChange={(val) =>
                  setTimeframe(val as "daily" | "weekly" | "monthly")
                }
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Display</h3>
              <div className="flex gap-2 w-full">
                <Button
                  className="flex-1"
                  variant={normalizeData ? "default" : "outline"}
                  onClick={() => setNormalizeData(true)}
                >
                  <LineChartIcon className="h-4 w-4 mr-1" />
                  Relative %
                </Button>

                <Button
                  className="flex-1"
                  variant={!normalizeData ? "default" : "outline"}
                  onClick={() => setNormalizeData(false)}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Actual $
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div
          className={`border rounded-lg p-4 ${
            type === "chart" ? "w-full" : "lg:w-3/4 w-full"
          }`}
        >
          {comparedStocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium">No Stocks Selected</h2>
              <p className="text-muted-foreground mt-2">
                Add stocks using the search box to compare their performance.
              </p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex justify-center p-20">
              <div className="h-8 w-8 animate-spin border-b-2 border-primary rounded-full" />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-medium mb-4">
                Performance Comparison
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(v) => (normalizeData ? `${v}%` : `$${v}`)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {comparedStocks.map((s, i) => (
                      <Line
                        key={s.symbol}
                        type="monotone"
                        dataKey={s.symbol}
                        stroke={chartColors[i % chartColors.length]}
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
