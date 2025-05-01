"use client"

import React from "react"
import dynamic from "next/dynamic"

// CKEditor를 클라이언트 측에서만 동적으로 로드
const CKEditorComponent = dynamic(() => import("./custom-editor"),{
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] border rounded-md flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">에디터 로딩 중...</p>
      </div>
    ),
  },
)

interface EditorComponentProps {
  /**
   * @content: 내용 state 값
   */
  content: string
  /**
   * @onContentChange: 내용이 바뀔 때마다 실행되는 콜백함수
   */
  onContentChange: (value: string) => void
}

const EditorComponent = React.forwardRef(({ content, onContentChange }: EditorComponentProps) => {
  return <CKEditorComponent content={content} onContentChange={onContentChange} />
})

EditorComponent.displayName = "EditorComponent"
export default EditorComponent
