"use client";

import { css } from "@/gen/styled/css";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import React, { useRef } from "react";

export interface MonacoInputHandle {
  setMarkers: (markers: MonacoEditorNS.IMarkerData[]) => void;
  clearMarkers: () => void;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  onDrop?: (content: string) => void;
  onHandle?: (handle: MonacoInputHandle) => void;
}

export function MonacoInput({ value, onChange, onDrop, onHandle }: Props) {
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any>(null);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    if (onHandle) {
      onHandle({
        setMarkers(markers) {
          const model = editor.getModel();
          if (model) monaco.editor.setModelMarkers(model, "wejson", markers);
        },
        clearMarkers() {
          const model = editor.getModel();
          if (model) monaco.editor.setModelMarkers(model, "wejson", []);
        },
      });
    }
  };

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // 只处理文件拖入；Monaco 会拦截文本拖入，这里专门处理 .json 文件
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = (ev.target?.result as string) ?? "";
      onChange(content);
      onDrop?.(content);
      // 同步到编辑器视图
      editorRef.current?.setValue(content);
    };
    reader.readAsText(file);
  }

  return (
    <div
      className={inputStyles.wrapper}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Editor
        height="100%"
        language="json"
        value={value}
        theme="vs"
        onChange={(val) => onChange(val ?? "")}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbersMinChars: 3,
          padding: { top: 8, bottom: 8 },
          renderLineHighlight: "all",
          smoothScrolling: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

const inputStyles = {
  wrapper: css`
    width: 100%;
    height: 100%;
    /* 拖入文件时显示高亮边框 */
    &[data-dragging] {
      outline: 2px dashed #0070f3;
      outline-offset: -2px;
    }
  `,
};
