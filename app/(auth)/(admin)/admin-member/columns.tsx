"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/column-header";
import { User } from "next-auth";

/**
 * @name userColumnLabels
 * @description 출력할 columns의 label
 */
export const userColumnLabels = {
  id: "제목",
  job: "직업",
  mngDt: "최종 수정일",
};

/**
 * @name userColumns
 * @description 게시판 형태의 컬럼 정의
 */
export const userColumns: ColumnDef<User>[] = [
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
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="닉네임" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("id")}</div>;
    },
  },
  {
    accessorKey: "job",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="직업" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("job")}</div>;
    },
  },
  {
    accessorKey: "mngDt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="최종 수정일" />
    ),
  },
];
