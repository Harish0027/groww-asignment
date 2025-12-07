"use client";

import { useState } from "react";
import { AddWidgetCard } from "./add-widget-card";
import AddWidgetDialog from "./add-widget-dialog";

export function AddWidgetContainer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AddWidgetCard onClick={() => setOpen(true)} />
      <AddWidgetDialog open={open} setOpen={setOpen} />
    </>
  );
}
