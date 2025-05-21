import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DisplayEditorContent from "@/components/editor/display-editor-content";
import { Dispatch, SetStateAction } from "react";
import { InquiryResponse } from "@/app/(auth)/inquiry/api";

interface ResponseMessageDialogProps {
  isResponseDialogOpen: boolean;
  setIsResponseDialogOpen: Dispatch<SetStateAction<boolean>>;
  inquiryData: InquiryResponse;
}

export default function ResponseMessageDialog({
  isResponseDialogOpen,
  setIsResponseDialogOpen,
  inquiryData,
}: ResponseMessageDialogProps) {
  return (
    <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
          답변 확인
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full h-auto max-w-full max-h-full md:max-w-[70vw] md:max-h-[80vh] overflow-y-auto overflow-x-hidden p-6">
        <DialogHeader>
          <DialogTitle className={"flex items-center gap-2"}>
            답변 확인
            <span className={"block text-sm text-primary"}>
              (답변 담당자: {inquiryData.inquiryResponseUserId} /{" "}
              {inquiryData.inquiryResponseDt})
            </span>
          </DialogTitle>
          <DialogDescription>
            문의한 정보에 대한 답변을 확인하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4 w-full overflow-x-hidden break-words">
          <DisplayEditorContent
            content={inquiryData.inquiryResponseMessage || ""}
          />
        </div>
        <DialogClose asChild>
          <div className={"w-full flex flex-row-reverse"}>
            <Button
              variant="default"
              className="w-full md:w-15 flex justify-center"
            >
              닫기
            </Button>
          </div>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
