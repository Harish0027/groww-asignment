"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DataTablePagination } from "./table/table-pagination";
import { DataTableColumnHeader } from "./table/table-column-header";
import { DataTableToolbar } from "./table/table-searchbar";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = "d06fke9r01qg26s7lp40d06fke9r01qg26s7lp4g";

// ---------------- Columns ----------------
const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Company" />
    ),
  },
  {
    accessorKey: "symbol",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Symbol" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
  },
  {
    accessorKey: "change",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Change" />
    ),
  },

  {
    accessorKey: "marketCap",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Market Cap" />
    ),
  },
];

// ---------------- Component ----------------
interface StockTableProps {
  symbols: string[]; // IMPORTANT: new prop
  pagination: any;
}

export function StockTable({ symbols, pagination }: StockTableProps) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { pageNumber = 1, pageSize = 10 } = pagination || {};

  // ---------------- Fetch Function ----------------
  async function fetchStock(symbol: string) {
    const quoteUrl = `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const profileUrl = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    const [quoteRes, profileRes] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl),
    ]);

    const quoteData = await quoteRes.json();
    const profileData = await profileRes.json();
    console.log(
      quoteData.v + "quotieeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    );
    return {
      symbol,
      name: profileData.name || symbol,
      price: quoteData.c,
      change: quoteData.d,
      changePercent: quoteData.dp,
      volume: quoteData.v,
      marketCap: profileData.marketCapitalization
        ? profileData.marketCapitalization * 1000000
        : undefined,
      high: quoteData.h,
      low: quoteData.l,
      open: quoteData.o,
      previousClose: quoteData.pc,
    };
  }

  // ---------------- Fetch All Symbols ----------------
  React.useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    (async () => {
      setLoading(true);
      const results = await Promise.all(symbols.map((s) => fetchStock(s)));
      console.log("reusltiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii" + results[0].volume);
      setData(results);
      setLoading(false);
    })();
  }, [symbols]);

  // ---------------- Table State ----------------
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  });

  if (loading)
    return (
      <div className="text-center p-10 text-lg font-medium">Loading...</div>
    );

  return (
    <div className="w-full space-y-2">
      <div className="block w-full lg:flex lg:items-center lg:justify-between">
        <DataTableToolbar table={table} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto w-full lg:w-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllLeafColumns().map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                className="capitalize"
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center p-6">
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        table={table}
        totalCount={data.length}
        pageNumber={pageNumber}
        pageSize={pageSize}
      />
    </div>
  );
}
