"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WidgetStockSearch } from "./widget-stock-search";
import { SearchResult } from "@/lib/api";
import { useWidgetStore, WidgetType } from "../../store/widget-store";

interface AddWidgetDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddWidgetDialog({
  open,
  setOpen,
}: AddWidgetDialogProps) {
  const [widgetName, setWidgetName] = useState("");
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [displayMode, setDisplayMode] = useState<WidgetType>("card");
  const [selectedStocks, setSelectedStocks] = useState<SearchResult[]>([]);

  const addWidgetToStore = useWidgetStore((s) => s.addWidget);

  const handleAddWidget = async () => {
    if (selectedStocks.length === 0) {
      alert("Please select at least one stock");
      return;
    }

    let finalDisplayMode = displayMode;
    if (displayMode === "card" && selectedStocks.length > 1) {
      console.warn(
        "Card widget cannot have multiple stocks. Switching to Table mode."
      );
      finalDisplayMode = "table";
    }

    const symbols = selectedStocks.map((s) => s.symbol);

    await addWidgetToStore({
      title: widgetName || `${symbols.join(", ")} Widget`,
      type: finalDisplayMode,
      symbols,
      refreshInterval: refreshInterval * 1000,
    });

    setWidgetName("");
    setSelectedStocks([]);
    setDisplayMode("card");
    setRefreshInterval(30);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-4 bg-background border border-border shadow-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Add Widget</DialogTitle>
          <DialogDescription className="text-xs">
            Configure widget settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Widget Name</label>
            <Input
              className="h-8 text-sm"
              placeholder="Widget Name"
              value={widgetName}
              onChange={(e) => setWidgetName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">
              Refresh Interval (sec)
            </label>
            <Input
              className="h-8 text-sm"
              type="number"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Display Mode</label>
            <div className="flex gap-2">
              {["card", "table", "chart"].map((mode) => (
                <button
                  key={mode}
                  className={`px-3 py-1.5 text-xs rounded-md border hover:bg-accent transition ${
                    displayMode === mode ? "bg-accent/50" : ""
                  }`}
                  onClick={() => setDisplayMode(mode as WidgetType)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-3">
          <WidgetStockSearch
            compact
            selectedStocks={selectedStocks}
            setSelectedStocks={setSelectedStocks}
          />
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="h-8 text-sm"
          >
            Cancel
          </Button>
          <Button
            className="h-8 text-sm"
            onClick={handleAddWidget}
            disabled={selectedStocks.length === 0}
          >
            Add Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
