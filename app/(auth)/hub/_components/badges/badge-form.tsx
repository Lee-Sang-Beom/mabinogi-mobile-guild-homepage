"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { badgeFormSchema, BadgeFormSchemaType } from "../../schema";

interface BadgeFormProps {
  defaultValues?: BadgeFormSchemaType;
  onSubmitAction: (data: BadgeFormSchemaType) => void;
  onCancelAction: () => void;
  isEditing?: boolean;
}

export function BadgeForm({
  defaultValues,
  onSubmitAction,
  onCancelAction,
  isEditing = false,
}: BadgeFormProps) {
  const form = useForm<BadgeFormSchemaType>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: defaultValues,
  });

  const handleSubmit = (data: BadgeFormSchemaType) => {
    onSubmitAction(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <DialogHeader>
          <DialogTitle>{isEditing ? "뱃지 수정" : "새 뱃지 추가"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <FormField
            control={form.control}
            name="badge.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>뱃지명</FormLabel>
                <FormControl>
                  <Input placeholder="뱃지 이름을 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="badge.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>뱃지 설명</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="뱃지에 대한 설명을 입력하세요"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>획득 난이도</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={"w-full"}>
                      <SelectValue placeholder="난이도를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="쉬움">쉬움</SelectItem>
                    <SelectItem value="보통">보통</SelectItem>
                    <SelectItem value="어려움">어려움</SelectItem>
                    <SelectItem value="매우 어려움">매우 어려움</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isAcquisitionConditionsOpen"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">획득 조건 공개</FormLabel>
                  <FormDescription>
                    획득 조건을 공개할지 여부를 설정합니다. 비공개 시 사용자에게
                    조건이 표시되지 않습니다.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acquisitionConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>획득 조건</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="뱃지 획득 조건을 입력하세요"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imgName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`이미지 파일명 (확장자 포함)`}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="이미지 이름을 입력하세요 (예: badge-champion.png)"
                    {...field}
                  />
                </FormControl>
                <FormDescription className={"text-red-400 text-xs"}>
                  이미지 파일은 <strong>홈페이지 개발 담당자</strong>
                  에게 따로 전달해 주셔야 도감 썸네일이 등록됩니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancelAction}>
            취소
          </Button>
          <Button type="submit">{isEditing ? "수정" : "추가"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
