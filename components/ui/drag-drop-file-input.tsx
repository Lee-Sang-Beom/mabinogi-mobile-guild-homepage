"use client";

import type * as React from "react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, FileIcon, Download, Upload } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

interface DragDropFileInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  name: string; // React Hook Form에서 사용할 필드 이름
  label?: string; // 라벨 텍스트
  buttonText?: string; // 버튼에 표시될 텍스트
  dropzoneText?: string; // 드롭존 안내 문구
  multiple?: boolean; // 다중 파일 업로드 허용 여부
  showFileList?: boolean; // 파일 리스트 표시 여부
  allowDelete?: boolean; // 파일 삭제 허용 여부
  allowDownload?: boolean; // 파일 다운로드 허용 여부
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  dropzoneClassName?: string;
  fileListClassName?: string;
  onChange?: (files: File[]) => void; // 외부에서 컨트롤할 수 있도록 하는 change 콜백
  value?: File[]; // 외부에서 컨트롤할 파일 value (react-hook-form이 아닐때 유효)
  useFormMode?: boolean; // react-hook-form 사용여부
}

export function DragDropFileInput({
  name,
  label = "파일 선택",
  buttonText = "파일 찾기",
  dropzoneText = "파일을 여기에 끌어다 놓거나 클릭하여 업로드하세요",
  multiple = false,
  showFileList = true,
  allowDelete = true,
  allowDownload = true,
  className,
  inputClassName,
  buttonClassName,
  dropzoneClassName,
  fileListClassName,
  onChange,
  value,
  useFormMode = true,
  ...props
}: DragDropFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const formContext = useFormContext();

  // 폼 모드 여부 확인 (FormProvider 내부에 있는지 확인)
  const isFormMode =
    useFormMode && formContext !== null && formContext !== undefined;

  // 현재 파일 목록 (form 값 또는 내부 상태)
  const files = isFormMode
    ? (formContext?.watch?.(name) as File[]) || []
    : value || internalFiles;

  // 외부 value prop이 변경되면 내부 상태 업데이트
  useEffect(() => {
    if (!isFormMode && value) {
      setInternalFiles(value);
    }
  }, [value, isFormMode]);

  const updateFiles = (updatedFiles: File[]) => {
    if (isFormMode) {
      formContext.setValue(name, updatedFiles, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      setInternalFiles(updatedFiles);
      if (onChange) onChange(updatedFiles);
    }
  };

  // 파일 변경 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;

    updateFiles(updatedFiles as File[]);

    // 동일한 파일을 다시 선택할 수 있도록 input의 값을 초기화
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // 파일 삭제 핸들러
  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    updateFiles(updatedFiles);
  };

  // 전체 삭제 핸들러
  const handleClearAll = () => {
    updateFiles([]);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // 다운로드 핸들러
  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 드롭 영역 진입 시 실행
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  // 드롭 영역에서 벗어날 시 실행
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  // 지속적으로 드롭 영역에서 움직일 시 실행
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  // 드롭 영역에서 파일 수신
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const droppedFiles = event.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    if (!multiple && droppedFiles.length > 1) {
      toast.error("단일 파일만 업로드할 수 있습니다.");
      return;
    }

    const newFiles = Array.from(droppedFiles);

    // multiple이 아닐때는 기존에 올려두었던 파일이 사라짐
    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    updateFiles(updatedFiles);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col space-y-2">
        {label && <label className="text-sm font-medium">{label}</label>}
        <Input
          ref={inputRef}
          type="file"
          className={cn("hidden", inputClassName)}
          onChange={handleFileChange}
          multiple={multiple}
          {...props}
        />

        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300",
            dropzoneClassName,
          )}
          onDragEnter={handleDragEnter} // 해당영역 요소 위로 진입할 때
          onDragLeave={handleDragLeave} // 드래그된 객체가 영역 밖으로 이동할 때
          onDragOver={handleDragOver} // 해당영역 위에 있을 때 지속 발생
          onDrop={handleDrop} // 드래그된 객체가 영역 내에서 놓일 때
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2 cursor-pointer">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-500">{dropzoneText}</p>
            <p className="text-xs text-gray-400">
              {multiple
                ? "여러 파일을 선택할 수 있습니다"
                : "파일을 선택하세요"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn("mt-2", buttonClassName)}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>

      {showFileList && files.length > 0 && (
        <div
          className={cn("border rounded-md overflow-hidden", fileListClassName)}
        >
          <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
            <h4 className="text-sm font-medium">
              선택된 파일 ({files.length}개)
            </h4>
            {allowDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleClearAll}
              >
                <X size={16} className="mr-1" />
                모두 삭제
              </Button>
            )}
          </div>
          <ul className="divide-y">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex justify-between items-center p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileIcon size={16} className="text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  {allowDownload && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                    >
                      <Download size={14} />
                    </Button>
                  )}
                  {allowDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file);
                      }}
                    >
                      <X size={14} />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
