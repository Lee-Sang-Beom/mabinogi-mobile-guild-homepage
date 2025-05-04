"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { NoticeResponse } from "./api";

/**
 * @name noticeColumnLabels
 * @description 출력할 columns의 label
 */
export const noticeColumnLabels = {
  title: "제목",
  priority: "중요도",
  writeUserId: "작성자",
  mngDt: "작성일",
};

/**
 * @name noticeColumns
 * @description 게시판 형태의 컬럼 정의
 */
export const noticeColumns: ColumnDef<NoticeResponse>[] = [
  {
    id: "select",
    header: ({ table }) => {
      // 체크박스 상태 변경 핸들러를 메모이제이션
      const onCheckedChange = (checked: boolean) => {
        table.toggleAllPageRowsSelected(checked);
      };

      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={onCheckedChange}
          aria-label="모두 선택"
          data-prevent-row-click="true"
        />
      );
    },
    cell: ({ row }) => {
      // 체크박스 상태 변경 핸들러를 메모이제이션
      const onCheckedChange = (checked: boolean) => {
        row.toggleSelected(checked);
      };

      return (
        <div onClick={(e) => e.stopPropagation()} data-prevent-row-click="true">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={onCheckedChange}
            aria-label="행 선택"
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="중요도" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;

      return (
        <Badge
          variant={
            priority === "high"
              ? "destructive"
              : priority === "medium"
                ? "default"
                : "secondary"
          }
          className={cn(
            "whitespace-nowrap",
            priority === "high" && "bg-red-500",
            priority === "medium" && "bg-amber-500",
            priority === "low" && "bg-slate-500"
          )}
        >
          {priority === "high"
            ? "중요"
            : priority === "medium"
              ? "일반"
              : "낮음"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="제목" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("title")}</div>;
    },
  },
  {
    accessorKey: "writeUserId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="작성자" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("writeUserId")}</div>;
    },
  },
  {
    accessorKey: "mngDt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="작성일" />
    ),
  },
];

/**
 * @name nonSelectionNoticeColumns
 * @description 체크박스가 없는 게시판 형태의 컬럼 정의
 */
export const nonSelectionNoticeColumns: ColumnDef<NoticeResponse>[] = [
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="중요도" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string;

      return (
        <Badge
          variant={
            priority === "high"
              ? "destructive"
              : priority === "medium"
                ? "default"
                : "secondary"
          }
          className={cn(
            "whitespace-nowrap",
            priority === "high" && "bg-red-500",
            priority === "medium" && "bg-amber-500",
            priority === "low" && "bg-slate-500"
          )}
        >
          {priority === "high"
            ? "중요"
            : priority === "medium"
              ? "일반"
              : "낮음"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="제목" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("title")}</div>;
    },
  },
  {
    accessorKey: "writeUserId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="작성자" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("writeUserId")}</div>;
    },
  },
  {
    accessorKey: "mngDt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="작성일" />
    ),
  },
];
