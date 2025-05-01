"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DataTableColumnHeader } from "@/components/table/column-header"

// 공지사항 데이터 타입 정의
export type Announcement = {
  id: number
  title: string
  author: string
  date: string
  views: number
  comments: number
  excerpt: string
  priority: "high" | "medium" | "low"
}

// 컬럼 정의
export const columns: ColumnDef<Announcement>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="모두 선택"
        data-prevent-row-click="true"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()} data-prevent-row-click="true">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="행 선택"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => <DataTableColumnHeader column={column} title="중요도" />,
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string

      return (
        <Badge
          variant={priority === "high" ? "destructive" : priority === "medium" ? "default" : "secondary"}
          className={cn(
            "whitespace-nowrap",
            priority === "high" && "bg-red-500",
            priority === "medium" && "bg-amber-500",
            priority === "low" && "bg-slate-500",
          )}
        >
          {priority === "high" ? "중요" : priority === "medium" ? "일반" : "낮음"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="제목" />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("title")}</div>
    },
  },
  {
    accessorKey: "author",
    header: ({ column }) => <DataTableColumnHeader column={column} title="작성자" />,
  },
  {
    accessorKey: "date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="작성일" />,
  },
]
