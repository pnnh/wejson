"use client";

import { transKey } from "@/components/common/locales/normal";
import { transWeJsonNoContent } from "@/components/common/locales/texts";
import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  lang: string;
}

export function MonacoPreview({ value, lang }: Props) {
  return (
    <Editor
      height="100%"
      language="json"
      value={value || `// ${transKey(lang, transWeJsonNoContent)}`}
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
