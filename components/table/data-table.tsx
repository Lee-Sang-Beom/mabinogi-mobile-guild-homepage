"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "./data-table-pagination";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  onSelectionChange?: (selectedRows: TData[]) => void;
  onDeleteSelected?: (selectedRows: TData[]) => void;
  columnLabels?: Record<string, string>;
  deleteButtonText?: string;
  isAvailableDelete: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = "title",
  searchPlaceholder = "검색...",
  onRowClick,
  onSelectionChange,
  onDeleteSelected,
  columnLabels = {},
  deleteButtonText = "선택 삭제",
  isAvailableDelete,
}: DataTableProps<TData, TValue>) {
  // 상태를 useRef로 초기화하여 첫 렌더링에만 설정
  const initialState = React.useRef({
    sorting: [] as SortingState,
    columnFilters: [] as ColumnFiltersState,
    columnVisibility: {} as VisibilityState,
    rowSelection: {} as Record<string, boolean>,
  }).current;

  const [sorting, setSorting] = React.useState<SortingState>(
    initialState.sorting
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    initialState.columnFilters
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialState.columnVisibility);
  const [rowSelection, setRowSelection] = React.useState<
    Record<string, boolean>
  >(initialState.rowSelection);
  const [searchValue, setSearchValue] = React.useState<string>("");

  // 데이터가 변경될 때 선택 상태 초기화
  React.useEffect(() => {
    setRowSelection({});
  }, [data]);

  // 테이블 인스턴스를 메모이제이션
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      let newRowSelection: Record<string, boolean> = {};

      if (typeof updater === "function") {
        newRowSelection = updater(rowSelection);
      } else {
        newRowSelection = updater;
      }

      setRowSelection(newRowSelection);

      // 선택된 행 데이터를 외부로 전달
      if (onSelectionChange) {
        const selectedRows = Object.keys(newRowSelection)
          .filter((idx) => newRowSelection[idx])
          .map((idx) => {
            const rowIndex = parseInt(idx, 10);
            return table.getRowModel().rows[rowIndex]?.original as TData;
          })
          .filter(Boolean);

        onSelectionChange(selectedRows);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // 검색 필드 변경 핸들러
  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);

      // 검색 컬럼이 존재하는 경우에만 필터 적용
      const column = table.getColumn(searchKey);
      if (column) {
        column.setFilterValue(value);
      }
    },
    [searchKey, table]
  );

  // 선택된 항목 삭제 핸들러
  const handleDeleteSelected = React.useCallback(() => {
    if (onDeleteSelected) {
      const selectedRows = Object.keys(rowSelection)
        .filter((idx) => rowSelection[idx])
        .map((idx) => {
          const rowIndex = parseInt(idx, 10);
          return table.getRowModel().rows[rowIndex]?.original as TData;
        })
        .filter(Boolean);

      onDeleteSelected(selectedRows);
      setRowSelection({});
    }
  }, [onDeleteSelected, rowSelection, table]);

  // 행 클릭 핸들러
  const handleRowClick = React.useCallback(
    (row: Row<TData>) => {
      if (onRowClick) {
        onRowClick(row.original);
      }
    },
    [onRowClick]
  );

  // 컬럼 라벨 가져오기
  const getColumnLabel = React.useCallback(
    (columnId: string) => {
      return columnLabels[columnId] || columnId;
    },
    [columnLabels]
  );

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 UI */}
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2">
          {Object.keys(rowSelection).length > 0 &&
            onDeleteSelected &&
            isAvailableDelete && (
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                size="sm"
                className="whitespace-nowrap"
              >
                {deleteButtonText}
              </Button>
            )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                컬럼 표시
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  >
                    {getColumnLabel(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead
                      key={header.id}
                      className={cn("whitespace-nowrap", index === 0 && "pl-4")}
                    >
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={(e) => {
                      if (
                        (e.target as HTMLElement).closest(
                          '[data-prevent-row-click="true"]'
                        )
                      ) {
                        return;
                      }
                      handleRowClick(row);
                    }}
                  >
                    {row.getVisibleCells().map((cell, index) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "py-3 md:py-4",
                          "max-w-[150px] truncate whitespace-nowrap overflow-hidden",
                          index === 0 && "pl-4"
                        )}
                      >
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <DataTablePagination
        table={table}
        isDisplaySelectionCount={isAvailableDelete ? true : false}
      />
    </div>
  );
}
