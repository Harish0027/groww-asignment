"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, TrendingUp, X } from "lucide-react";
import { searchStocks, SearchResult, getTrendingStocks } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WidgetStockSearch({
  compact = false,
  selectedStocks,
  setSelectedStocks,
}: {
  compact?: boolean;
  selectedStocks?: SearchResult[];
  setSelectedStocks?: (stocks: SearchResult[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("search");
  const [trendingStocks, setTrendingStocks] = useState<SearchResult[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 1) return setResults([]);
    setIsLoading(true);
    try {
      const res = await searchStocks(searchQuery);
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  useEffect(() => {
    (async () => {
      try {
        const trending = await getTrendingStocks();
        setTrendingStocks(
          trending.map((s) => ({
            ...s,
            type: "Equity",
            region: "US",
            currency: "USD",
          }))
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSelect = (stock: SearchResult) => {
    if (setSelectedStocks && selectedStocks) {
      if (!selectedStocks.some((s) => s.symbol === stock.symbol))
        setSelectedStocks([...selectedStocks, stock]);
    }
    setQuery("");
    setResults([]);
  };

  const handleRemove = (symbol: string) => {
    if (setSelectedStocks && selectedStocks) {
      setSelectedStocks(selectedStocks.filter((s) => s.symbol !== symbol));
    }
  };

  const currentSelectedStocks = selectedStocks || [];

  const renderStockItem = (stock: SearchResult, index: number) => (
    <motion.li
      key={stock.symbol}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        className="w-full text-left px-3 py-2 hover:bg-accent/50 transition-colors flex justify-between items-center rounded-md"
        onClick={() => handleSelect(stock)}
      >
        <div>
          <p className="font-medium text-sm">{stock.symbol}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[160px]">
            {stock.name}
          </p>
        </div>
        <span className="text-[10px] bg-muted px-2 py-1 rounded-full">
          {stock.region}
        </span>
      </button>
    </motion.li>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative mb-3 w-full">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder="Search for a stock..."
          className="pl-9 pr-4 py-2 h-9 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-3 h-8 text-xs">
          <TabsTrigger value="search" className="flex items-center gap-1">
            <Search className="h-3.5 w-3.5" /> Search
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-hide mt-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <ul>{results.map(renderStockItem)}</ul>
            ) : query.trim() === "" ? (
              <div className="flex flex-col justify-center items-center h-20 text-muted-foreground text-xs">
                <p>Start typing to search stocks</p>
              </div>
            ) : (
              <div className="flex justify-center items-center h-20 text-xs text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-hide">
            {trendingStocks.length > 0 ? (
              <ul>{trendingStocks.map(renderStockItem)}</ul>
            ) : (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {currentSelectedStocks.length > 0 && (
        <div className="mt-3">
          <h3 className="text-xs font-medium mb-2">Selected Stocks</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <AnimatePresence>
              {currentSelectedStocks.map((stock) => (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="relative min-w-[120px] bg-muted/40 p-2 rounded"
                >
                  <X
                    className="absolute top-1 right-1 h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-red-500 transition"
                    onClick={() => handleRemove(stock.symbol)}
                  />
                  <p className="font-medium text-sm">{stock.symbol}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {stock.name}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
