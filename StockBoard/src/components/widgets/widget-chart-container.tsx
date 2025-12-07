"use client";

import StockComparisonManager from "./chart/chart-manager";

const WidgetChartContainer = ({ data }: { data: any }) => {
  return <StockComparisonManager data={data} type={"chart"} />;
};

export default WidgetChartContainer;
