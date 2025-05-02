import React from 'react'
import 'ckeditor5/ckeditor5.css';
import '@/app/editor.css';

interface DisplayEditorContentProps {
  content: string;
}

export default function DisplayEditorContent({ content }: DisplayEditorContentProps) {
  return (
    <div
      className="shadow-lg rounded-xl py-3 px-6 bg-white ck-content text-black"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}