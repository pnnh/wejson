"use client";

import { transKey } from "@/components/common/locales/normal";
import { transWeJsonNoContent } from "@/components/common/locales/texts";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import { useEffect, useRef } from "react";
import { applyShikiThemeToMonaco, type ExportTheme } from "./export-json";

interface Props {
  value: string;
  lang: string;
  theme?: ExportTheme;
  // Exposes the Monaco global so the parent can drive theme changes
  onMonacoReady?: (monaco: unknown) => void;
}

export function MonacoPreview({
  value,
  lang,
  theme = "github-light",
  onMonacoReady,
}: Props) {
  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any>(null);

  // Re-apply theme whenever it changes after initial mount
  useEffect(() => {
    if (monacoRef.current) {
      applyShikiThemeToMonaco(monacoRef.current, theme);
    }
  }, [theme]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    onMonacoReady?.(monaco);
    applyShikiThemeToMonaco(monaco, theme);
  };

  return (
    <Editor
      height="100%"
      language="json"
      value={value || `// ${transKey(lang, transWeJsonNoContent)}`}
      onMount={handleMount}
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
        cursorBlinking: "solid",
        cursorWidth: 0,
      }}
    />
  );
}
