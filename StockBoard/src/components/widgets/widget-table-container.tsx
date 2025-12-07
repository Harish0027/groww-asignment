import React from "react";
import { StockTable } from "./widget-table";

const WidgetTableContainer = ({ data }: { data: any }) => {
  console.log(
    data + "+++++++++++++++++++++++++++++++++++++++++++++++++++ from tble"
  );
  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Tasks</h2>
          <p className="text-muted-foreground">
            Here's the list of tasks for this workspace!
          </p>
        </div>
        {/* <CreateTaskDialog /> */}
      </div>

      <div>
        <StockTable symbols={data} pagination={[]} />
      </div>
    </div>
  );
};

export default WidgetTableContainer;
