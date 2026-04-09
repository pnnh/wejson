"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { css } from "@/gen/styled/css";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Copy,
  Download,
  Minimize2,
} from "lucide-react";
import dynamic from "next/dynamic";
import React, { useRef } from "react";
import { useJsonHistory } from "./history";
import { HistoryPanel } from "./history-panel";
import { JsonPathPanel } from "./jsonpath-panel";
import type { MonacoInputHandle } from "./monaco-input";

// Monaco 组件使用 dynamic import 避免 SSR
const MonacoInput = dynamic(
  () => import("./monaco-input").then((m) => ({ default: m.MonacoInput })),
  {
    ssr: false,
    loading: () => <div className={styles.editorLoading}>加载编辑器…</div>,
  },
);
const MonacoPreview = dynamic(
  () => import("./monaco-preview").then((m) => ({ default: m.MonacoPreview })),
  {
    ssr: false,
    loading: () => <div className={styles.editorLoading}>加载预览…</div>,
  },
);

// 递归对对象所有层级的 key 进行排序
function sortKeys(value: unknown, direction: "asc" | "desc" = "asc"): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortKeys(item, direction));
  }
  if (value !== null && typeof value === "object") {
    const sorted = Object.keys(value as Record<string, unknown>)
      .sort((a, b) =>
        direction === "asc" ? a.localeCompare(b) : b.localeCompare(a),
      )
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeys((value as Record<string, unknown>)[key], direction);
        return acc;
      }, {});
    return sorted;
  }
  return value;
}

function downloadJson(content: string, filename = "data.json") {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function WeJsonClient() {
  const [rawContent, setRawContent] = React.useState("");
  const [errMsg, setErrMsg] = React.useState("");
  const [parsedContent, setParsedContent] = React.useState("");
  const [copyLabel, setCopyLabel] = React.useState("");
  const editorHandleRef = useRef<MonacoInputHandle | null>(null);
  const { history, addToHistory, removeFromHistory, clearHistory } =
    useJsonHistory();

  function parse(raw: string): unknown | null {
    try {
      const parsed = JSON.parse(raw);
      setErrMsg("");
      editorHandleRef.current?.clearMarkers();
      return parsed;
    } catch (error) {
      const errStr = String(error);
      setErrMsg("Invalid JSON: " + errStr);
      // 尝试从错误信息中提取行列号，标注到 Monaco 编辑器
      const pos = extractPosition(errStr, raw);
      if (pos && editorHandleRef.current) {
        editorHandleRef.current.setMarkers([
          {
            startLineNumber: pos.line,
            startColumn: pos.col,
            endLineNumber: pos.line,
            endColumn: pos.col + 1,
            message: errStr,
            severity: 8, // MarkerSeverity.Error
          },
        ]);
      }
      return null;
    }
  }

  function handleFormat() {
    const parsed = parse(rawContent);
    if (parsed !== null) {
      const formatted = JSON.stringify(parsed, null, 2);
      setParsedContent(formatted);
      addToHistory(rawContent.trim());
    }
  }

  function handleMinify() {
    const parsed = parse(rawContent);
    if (parsed !== null) {
      setParsedContent(JSON.stringify(parsed));
    }
  }

  function handleSort(direction: "asc" | "desc") {
    const parsed = parse(rawContent);
    if (parsed !== null) {
      setParsedContent(JSON.stringify(sortKeys(parsed, direction), null, 2));
    }
  }

  async function handleCopy(content: string, label: string) {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopyLabel(label);
    setTimeout(() => setCopyLabel(""), 1500);
  }

  function handleLoadHistory(content: string) {
    setRawContent(content);
    setErrMsg("");
    setParsedContent("");
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button size="sm" onClick={handleFormat}>
          格式化
        </Button>
        <Button size="sm" variant="outline" onClick={handleMinify}>
          <Minimize2 size={14} />
          压缩
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleSort("asc")}>
          <ArrowDownAZ size={14} />
          排序 A→Z
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleSort("desc")}>
          <ArrowUpAZ size={14} />
          排序 Z→A
        </Button>
        <div className={styles.spacer} />
        <Button
          size="sm"
          variant="outline"
          disabled={!parsedContent}
          onClick={() => handleCopy(parsedContent, "formatted")}
        >
          <Copy size={14} />
          {copyLabel === "formatted" ? "已复制!" : "复制格式化"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!parsedContent}
          onClick={() => {
            try {
              handleCopy(JSON.stringify(JSON.parse(parsedContent)), "minified");
            } catch {
              /* ignore */
            }
          }}
        >
          <Copy size={14} />
          {copyLabel === "minified" ? "已复制!" : "复制压缩"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!parsedContent}
          onClick={() => downloadJson(parsedContent)}
        >
          <Download size={14} />
          下载
        </Button>
      </div>

      <div className={styles.editArea}>
        <div className={styles.panel}>
          <div className={styles.panelLabel}>输入 JSON</div>
          <div className={styles.editorWrap}>
            <MonacoInput
              value={rawContent}
              onChange={setRawContent}
              onHandle={(h) => {
                editorHandleRef.current = h;
              }}
            />
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelLabel}>预览</div>
          <div className={styles.editorWrap}>
            <MonacoPreview value={parsedContent} />
          </div>
        </div>
      </div>

      <HistoryPanel
        history={history}
        onLoad={handleLoadHistory}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      <JsonPathPanel json={parsedContent} />

      {errMsg && (
        <Alert variant="destructive">
          <AlertDescription>{errMsg}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

const styles = {
  container: css`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 0;
  `,
  toolbar: css`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  `,
  spacer: css`
    flex: 1;
  `,
  editArea: css`
    display: flex;
    flex-direction: row;
    gap: 1rem;
    height: 28rem;
  `,
  panel: css`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  `,
  panelLabel: css`
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  `,
  editorWrap: css`
    flex: 1;
    min-height: 0;
    background: #1e1e1e;
  `,
  editorLoading: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1e1e1e;
    color: #6b7280;
    font-size: 0.85rem;
    height: 100%;
  `,
};

// 尝试从 JSON.parse 抛出的错误消息中提取行列号
// 不同运行时格式不同，做尽力解析
function extractPosition(
  errMsg: string,
  source: string,
): { line: number; col: number } | null {
  // V8: "Unexpected token x in JSON at position N"
  const posMatch = /at position (\d+)/.exec(errMsg);
  if (posMatch) {
    const offset = parseInt(posMatch[1], 10);
    return offsetToLineCol(source, offset);
  }
  // Firefox / Safari: "JSON Parse error: Unexpected token" without position
  return null;
}

function offsetToLineCol(
  source: string,
  offset: number,
): { line: number; col: number } {
  const lines = source.slice(0, offset).split("\n");
  return {
    line: lines.length,
    col: (lines[lines.length - 1]?.length ?? 0) + 1,
  };
}
