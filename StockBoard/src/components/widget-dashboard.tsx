"use client";

import { motion } from "framer-motion";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SortableGrid, { SortableItem } from "@/components/SortableGrid";
import { StockCard } from "@/components/stock-card";
import WidgetChartContainer from "./widgets/widget-chart-container";
import WidgetTableContainer from "./widgets/widget-table-container";
import { useWidgetStore, Widget } from "../../store/widget-store";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardWidgets() {
  const widgets = useWidgetStore((s) => s.widgets);

  console.log("DashboardWidgets - widgets from store:", widgets); // ✅ debug widgets

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
      </div>

      <motion.div
        className="responsive-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <SortableGrid items={widgets} setItems={() => {}}>
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

function WidgetRenderer({ widget }: any) {
  const { title, type, id, data, symbols } = widget;

  console.log("WidgetRenderer - widget:", widget); // ✅ debug each widget
  console.log("WidgetRenderer - data:", data); // ✅ debug data for widget

  const refreshWidget = useWidgetStore((s) => s.refreshWidget);
  const removeWidget = useWidgetStore((s) => s.removeWidget);

  const handleRefresh = () => refreshWidget(id);
  const handleRemove = () => removeWidget(id);

  const showCardWarning = type === "card" && symbols.length > 1;

  return (
    <div className="bg-background rounded-lg p-4 shadow w-full">
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
            Card widget cannot have multiple symbols. Consider switching to
            Table view.
          </AlertDescription>
        </Alert>
      )}

      {!data && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No data available.</AlertDescription>
        </Alert>
      )}

      {data && (
        <>
          {type === "card" && !showCardWarning && (
            <StockCard
              stock={data as any}
              showRemoveButton
              onRemove={handleRemove}
            />
          )}
          {type === "table" && <WidgetTableContainer data={data} />}
          {type === "chart" && <WidgetChartContainer data={data} />}
        </>
      )}
    </div>
  );
}
