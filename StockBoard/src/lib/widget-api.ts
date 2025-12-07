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
): Promise<
  StockData | StockData[] | Record<string, StockHistoricalData[]> | string[]
> {
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
      const data: StockData[] = [];

      for (const symbol of symbols) {
        const stock = await getStockQuote(symbol);
        if (stock) data.push(stock);
      }

      return data;
    }

    if (type === "chart") {
      // ⬇⬇⬇ FIXED: return symbols directly
      return symbols;
    }

    throw new Error(`Unsupported widget type: ${type}`);
  } catch (error) {
    console.error("getWidgetStockData error:", error);

    // fallback returns
    if (type === "card") return {} as StockData;
    if (type === "table") return [] as StockData[];
    if (type === "chart") return [] as string[];

    return {} as any;
  }
}
