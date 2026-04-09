"use client";

import Editor from "@monaco-editor/react";

interface Props {
  value: string;
}

export function MonacoPreview({ value }: Props) {
  return (
    <Editor
      height="100%"
      language="json"
      value={value || "// 无内容"}
      theme="vs"
      options={{
        readOnly: true,
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineNumbersMinChars: 3,
        padding: { top: 8, bottom: 8 },
        renderLineHighlight: "none",
        smoothScrolling: true,
        automaticLayout: true,
        // 只读模式下隐藏光标
        cursorBlinking: "solid",
        cursorWidth: 0,
      }}
    />
  );
}
