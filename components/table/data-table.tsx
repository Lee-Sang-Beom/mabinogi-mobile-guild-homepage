"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTablePagination } from "./data-table-pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  onRowClick?: (row: TData) => void
  onSelectionChange?: (selectedRows: TData[]) => void
  onDeleteSelected?: (selectedRows: TData[]) => void
  columnLabels?: Record<string, string>
  deleteButtonText?: string
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
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // 모바일 환경에서 기본적으로 일부 컬럼 숨기기
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        const isMobileView = window.innerWidth < 768

        // 모바일에서 자동으로 숨길 컬럼 설정
        if (isMobileView) {
          const newVisibility: VisibilityState = { ...columnVisibility }

          // 중요도가 낮은 컬럼들 숨기기 (예시)
          columns.forEach((column) => {
            const columnId = typeof column.id === "string" ? column.id : ""
            if (["comments", "views", "lastActive"].includes(columnId)) {
              newVisibility[columnId] = false
            }
          })

          setColumnVisibility(newVisibility)
        }
      }

      window.addEventListener("resize", handleResize)
      handleResize() // 초기 로드 시 실행

      return () => window.removeEventListener("resize", handleResize)
    }
  }, [columns])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      let newRowSelection: Record<string, boolean> = {}

      if (typeof updater === "function") {
        newRowSelection = updater(rowSelection)
      } else {
        newRowSelection = updater
      }

      setRowSelection(newRowSelection)

      // 선택된 행 데이터를 외부로 전달
      if (onSelectionChange) {
        const selectedRows = Object.keys(newRowSelection)
          .filter((idx) => newRowSelection[idx])
          .map((idx) => table.getRowModel().rows[Number.parseInt(idx)].original as TData)

        onSelectionChange(selectedRows)
      }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // 선택된 항목 삭제 함수
  const handleDeleteSelected = () => {
    if (onDeleteSelected) {
      const selectedRows = Object.keys(rowSelection)
        .filter((idx) => rowSelection[idx as keyof typeof rowSelection])
        .map((idx) => table.getRowModel().rows[Number.parseInt(idx)].original as TData)

      onDeleteSelected(selectedRows)

      // 선택 상태 초기화 (실제 데이터 삭제는 외부에서 처리)
      setRowSelection({})
    }
  }

  // 행 클릭 핸들러
  const handleRowClick = (row: Row<TData>) => {
    if (onRowClick) {
      onRowClick(row.original)
    }
  }

  // 컬럼 라벨 가져오기
  const getColumnLabel = (columnId: string) => {
    return columnLabels[columnId] || columnId
  }

  return (
    <div className="space-y-4">
      {/* 모바일 뷰에서의 검색 및 필터 UI */}
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2">
          {Object.keys(rowSelection).length > 0 && onDeleteSelected && (
            <Button variant="destructive" onClick={handleDeleteSelected} size="sm" className="whitespace-nowrap">
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
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {getColumnLabel(column.id)}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 테이블 컨테이너 - 모바일에서 가로 스크롤 가능하도록 */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
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
                      // 체크박스 클릭 시 행 클릭 이벤트 방지
                      if ((e.target as HTMLElement).closest('[data-prevent-row-click="true"]')) {
                        return
                      }
                      handleRowClick(row)
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 md:py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 페이지네이션 - 모바일에서도 잘 보이도록 조정 */}
      <DataTablePagination table={table} />
    </div>
  )
}
