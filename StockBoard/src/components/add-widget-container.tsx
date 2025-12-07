"use client";

import { useUIStore } from "../../store/ui-store";
import { AddWidgetCard } from "./add-widget-card";
import AddWidgetDialog from "./add-widget-dialog";

export function AddWidgetContainer() {
  const addWidgetOpen = useUIStore((s) => s.addWidgetOpen);
  const setAddWidgetOpen = useUIStore((s) => s.setAddWidgetOpen);

  return (
    <>
      <AddWidgetCard onClick={() => setAddWidgetOpen(true)} />
      <AddWidgetDialog open={addWidgetOpen} setOpen={setAddWidgetOpen} />
    </>
  );
}
