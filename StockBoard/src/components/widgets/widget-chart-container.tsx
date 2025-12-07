// widgets/widget-chart-container.tsx
"use client";

import ChartManager from "./chart/chart-manager";

export default function WidgetChartContainer({ data }: { data: any }) {
  return <ChartManager type="chart" data={data} />;
}
