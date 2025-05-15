"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { InquiryResponse } from "@/app/(auth)/inquiry/api";
import { InquiryStep } from "@/app/(auth)/inquiry/internal";

/**
 * @name inquiryColumnLabels
 * @description 출력할 columns의 label
 */
export const inquiryColumnLabels = {
  step: "단계",
  title: "제목",
  writeUserId: "작성자",
  mngDt: "작성일",
};

/**
 * @name inquiryColumns
 * @description 문의사항 테이블 컬럼
 */
export const inquiryColumns: ColumnDef<InquiryResponse>[] = [
  {
    accessorKey: "step",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="진행도" />
    ),
    cell: ({ row }) => {
      const inquiryStep = row.getValue("step") as InquiryStep;

      return (
        <Badge
          variant={"default"}
          className={cn(
            "whitespace-nowrap",
            inquiryStep === "INQUIRY_STEP_IN_PROGRESS" && "bg-red-500",
            inquiryStep === "INQUIRY_STEP_RESOLVED" && "bg-amber-500",
          )}
        >
          {inquiryStep === "INQUIRY_STEP_IN_PROGRESS" ? "검토중" : "답변완료"}
        </Badge>
      );
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
