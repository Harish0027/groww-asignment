"use client";

import { motion } from "framer-motion";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SortableGrid, { SortableItem } from "@/components/SortableGrid";
import { StockCard } from "@/components/stock-card";
import WidgetChartContainer from "./widgets/widget-chart-container";
import WidgetTableContainer from "./widgets/widget-table-container";
import { useWidgetStore } from "../../store/widget-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUIStore } from "../../store/ui-store";
import { StockData } from "@/lib/api";

export default function DashboardWidgets() {
  const widgets = useWidgetStore((s) => s.widgets);
  const setAddWidgetOpen = useUIStore((s) => s.setAddWidgetOpen);
  const setWidgetsOrder = useWidgetStore((s) => s.setWidgetsOrder);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
  };

  if (!widgets || widgets.length === 0)
    return (
      <section className="space-y-4 md:space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Dashboard Widgets
          </h2>
        </div>
        <div className="flex justify-center items-center h-40 text-muted-foreground">
          No widgets available
        </div>
      </section>
    );

  return (
    <section className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
          Dashboard Widgets
        </h2>

        {/* Desktop Add Widget Button */}
        <Button
          variant="secondary"
          className="hidden md:flex"
          onClick={() => setAddWidgetOpen(true)}
        >
          Add Widget
        </Button>

        {/* Mobile Add Widget Button */}
        <Button
          size="sm"
          className="md:hidden"
          onClick={() => setAddWidgetOpen(true)}
        >
          +
        </Button>
      </div>

      <motion.div
        className="responsive-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <SortableGrid items={widgets} setItems={setWidgetsOrder}>
          {widgets.map((widget) => (
            <SortableItem key={widget.id} id={widget.id}>
              <motion.div variants={item}>
                <WidgetRenderer widget={widget} />
              </motion.div>
            </SortableItem>
          ))}
        </SortableGrid>
      </motion.div>
    </section>
  );
}

function WidgetRenderer({ widget }: { widget: any }) {
  const { title, type, id, data, symbols } = widget;

  console.log("WidgetRenderer - widget:", widget); //  debug each widget
  console.log("WidgetRenderer - data:", data); //  debug data for widget

  const refreshWidget = useWidgetStore((s) => s.refreshWidget);
  const removeWidget = useWidgetStore((s) => s.removeWidget);

  const handleRefresh = () => refreshWidget(id);
  const handleRemove = () => removeWidget(id);

  const showCardWarning = type === "card" && symbols.length > 1;

  // Fallback data for card widget
  const stockData: any =
    type === "card"
      ? (data as StockData) || {
          symbol: symbols[0] || "N/A",
          name: "N/A",
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
        }
      : null;

  return (
    <div className="bg-background rounded-lg p-4 shadow w-full min-h-[150px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{title}</h3>
        <Button size="icon" onClick={handleRefresh} variant="ghost">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {showCardWarning && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Card widget cannot have multiple symbols.
          </AlertDescription>
        </Alert>
      )}

      {!data && type !== "card" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No data available.</AlertDescription>
        </Alert>
      )}

      {type === "card" && !showCardWarning && (
        <StockCard stock={stockData} showRemoveButton onRemove={handleRemove} />
      )}

      {type === "table" && <WidgetTableContainer data={data || []} />}

      {type === "chart" && <WidgetChartContainer data={symbols || []} />}
    </div>
  );
}
