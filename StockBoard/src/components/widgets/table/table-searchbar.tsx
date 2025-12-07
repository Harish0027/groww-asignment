import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
      <Input
        placeholder="Search..."
        value={globalFilter ?? ""}
        onChange={(e) => {
          const value = e.target.value;
          setGlobalFilter(value);
          table.setGlobalFilter(value);
        }}
        className="max-w-sm"
      />
    </div>
  );
}
