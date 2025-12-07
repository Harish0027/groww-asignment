import {
  getStockQuote,
  getHistoricalData,
  StockData,
  StockHistoricalData,
} from "./api";

export type WidgetType = "card" | "table" | "chart";

export async function getWidgetStockData(
  symbols: string[],
  type: WidgetType
): Promise<StockData | StockData[] | Record<string, StockHistoricalData[]>> {
  try {
    if (type === "card") {
      // Card widget should contain only one symbol
      if (symbols.length !== 1) {
        throw new Error("Card widget must have exactly one symbol");
      }
      const stock = await getStockQuote(symbols[0]);
      if (!stock) {
        console.warn(`No data found for symbol: ${symbols[0]}`);
        return {} as StockData; // fallback as empty object to satisfy type
      }
      return stock; // single StockData object
    }

    if (type === "table") {
      // Table can have multiple symbols
      const data: StockData[] = [];
      for (const symbol of symbols) {
        const stock = await getStockQuote(symbol);
        if (stock) data.push(stock);
      }
      return data; // array of StockData
    }

    if (type === "chart") {
      // Chart can have multiple symbols, fetch historical data for each
      const data: Record<string, StockHistoricalData[]> = {};
      for (const symbol of symbols) {
        const history = await getHistoricalData(symbol, "daily"); // default to daily interval
        data[symbol] = history;
      }
      return data; // object with symbol -> historical data array
    }

    throw new Error(`Unsupported widget type: ${type}`);
  } catch (error) {
    console.error("getWidgetStockData error:", error);

    // Return fallback based on widget type
    if (type === "card") return {} as StockData;
    if (type === "table") return [] as StockData[];
    if (type === "chart") return {} as Record<string, StockHistoricalData[]>;

    // fallback, should never hit
    return {} as any;
  }
}
