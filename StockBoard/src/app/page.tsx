import { Metadata } from "next";
import { SiteWrapper } from "@/components/site-wrapper";
import { StockSearch } from "@/components/stock-search";
import TrendingStocks from "@/components/trending-stocks";
import { AddWidgetContainer } from "@/components/add-widget-container";
import WidgetTableContainer from "@/components/widgets/widget-table-container";
import WidgetChartContainer from "@/components/widgets/widget-chart-container";
import DashboardWidgets from "@/components/widget-dashboard";

export const metadata: Metadata = {
  title: "Dashboard | Home",
  description:
    "Track real-time stock market data with interactive charts and watch your favorite stocks",
};

export default function HomePage() {
  return (
    <SiteWrapper>
      <section className="space-y-6 md:space-y-8">
        <div className="text-center py-4 md:py-6 space-y-4">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto px-4">
            Track real-time stock market data with interactive charts. Search
            for stocks and add them to your watchlist.
          </p>
        </div>

        {/*<TrendingStocks /> */}
        <DashboardWidgets />
        <AddWidgetContainer />
        {/*
        <WidgetTableContainer />
        <WidgetChartContainer />
         */}
      </section>
    </SiteWrapper>
  );
}
