"use client";

import { transKey } from "@/components/common/locales/normal";
import {
  transWeJsonCopied,
  transWeJsonCopyFormatted,
  transWeJsonCopyMinified,
  transWeJsonDownload,
  transWeJsonFormat,
  transWeJsonInputLabel,
  transWeJsonLoadingEditor,
  transWeJsonLoadingPreview,
  transWeJsonMinify,
  transWeJsonModeJson,
  transWeJsonModeJson5,
  transWeJsonPreviewLabel,
  transWeJsonSortAsc,
  transWeJsonSortDesc,
} from "@/components/common/locales/texts";
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
import {
  buildJpg,
  buildPng,
  buildSvg,
  EXPORT_THEMES,
  type ExportTheme,
} from "./export-json";
import { SchemaPanel } from "./schema-panel";
import { XmlPanel } from "./xml-panel";
import { YamlPanel } from "./yaml-panel";

// Monaco 组件使用 dynamic import 避免 SSR — loading 文本在组件内部通过 lang prop 渲染
const MonacoInput = dynamic(
  () => import("./monaco-input").then((m) => ({ default: m.MonacoInput })),
  { ssr: false },
);
const MonacoPreview = dynamic(
  () => import("./monaco-preview").then((m) => ({ default: m.MonacoPreview })),
  { ssr: false },
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

const MAX_INPUT_SIZE = 50_000; // 50 KB — prevents runaway large pastes

export function WeJsonClient({ lang }: { lang: string }) {
  const [rawContent, setRawContent] = React.useState("");
  const [errMsg, setErrMsg] = React.useState("");
  const [parsedContent, setParsedContent] = React.useState("");
  const [inputMode, setInputMode] = React.useState<"json" | "json5">("json");
  const [copyLabel, setCopyLabel] = React.useState("");
  const [editorMounted, setEditorMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<ExportTheme>("github-light");
  const [exporting, setExporting] = React.useState<"svg" | "png" | "jpg" | null>(null);
  const editorHandleRef = useRef<MonacoInputHandle | null>(null);
  const { history, addToHistory, removeFromHistory, clearHistory } =
    useJsonHistory();

  async function parse(raw: string): Promise<unknown | null> {
    if (inputMode === "json5") {
      try {
        const { default: JSON5 } = await import("json5");
        const parsed = JSON5.parse(raw);
        setErrMsg("");
        editorHandleRef.current?.clearMarkers();
        return parsed;
      } catch (error) {
        const errStr = String(error);
        setErrMsg("Invalid JSON5: " + errStr);
        return null;
      }
    }
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

  async function handleFormat() {
    const parsed = await parse(rawContent);
    if (parsed !== null) {
      const formatted = JSON.stringify(parsed, null, 2);
      setParsedContent(formatted);
      addToHistory(rawContent.trim());
    }
  }

  async function handleMinify() {
    const parsed = await parse(rawContent);
    if (parsed !== null) {
      setParsedContent(JSON.stringify(parsed));
    }
  }

  async function handleSort(direction: "asc" | "desc") {
    const parsed = await parse(rawContent);
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

  async function handleExport(format: "svg" | "png" | "jpg") {
    if (!parsedContent || exporting) return;
    setExporting(format);
    try {
      if (format === "svg") {
        const svg = await buildSvg(parsedContent, theme);
        const a = document.createElement("a");
        a.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        a.download = "preview.svg";
        a.click();
      } else if (format === "png") {
        const blob = await buildPng(parsedContent, theme);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "preview.png";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await buildJpg(parsedContent, theme);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "preview.jpg";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      setErrMsg("Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button size="sm" onClick={handleFormat}>
          {transKey(lang, transWeJsonFormat)}
        </Button>
        <Button size="sm" variant="outline" onClick={handleMinify}>
          <Minimize2 size={14} />
          {transKey(lang, transWeJsonMinify)}
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleSort("asc")}>
          <ArrowDownAZ size={14} />
          {transKey(lang, transWeJsonSortAsc)}
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleSort("desc")}>
          <ArrowUpAZ size={14} />
          {transKey(lang, transWeJsonSortDesc)}
        </Button>
        <div className={styles.spacer} />
        <Button
          size="sm"
          variant="outline"
          disabled={!parsedContent}
          onClick={() => handleCopy(parsedContent, "formatted")}
        >
          <Copy size={14} />
          {copyLabel === "formatted"
            ? transKey(lang, transWeJsonCopied)
            : transKey(lang, transWeJsonCopyFormatted)}
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
          {copyLabel === "minified"
            ? transKey(lang, transWeJsonCopied)
            : transKey(lang, transWeJsonCopyMinified)}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!parsedContent}
          onClick={() => downloadJson(parsedContent)}
        >
          <Download size={14} />
          {transKey(lang, transWeJsonDownload)}
        </Button>
      </div>

      <div className={styles.editArea}>
        <div className={styles.panel}>
          <div className={styles.panelLabel}>
            <span>{transKey(lang, transWeJsonInputLabel)}</span>
            <div className={styles.modeGroup}>
              <label className={styles.modeOption}>
                <input
                  type="radio"
                  name="wejson-input-mode"
                  value="json"
                  checked={inputMode === "json"}
                  onChange={() => setInputMode("json")}
                />
                {transKey(lang, transWeJsonModeJson)}
              </label>
              <label className={styles.modeOption}>
                <input
                  type="radio"
                  name="wejson-input-mode"
                  value="json5"
                  checked={inputMode === "json5"}
                  onChange={() => setInputMode("json5")}
                />
                {transKey(lang, transWeJsonModeJson5)}
              </label>
            </div>
          </div>
          <div className={styles.editorWrap}>
            {!editorMounted && (
              <div className={styles.editorLoading} id="editor-loading-input">
                {transKey(lang, transWeJsonLoadingEditor)}
              </div>
            )}
            <MonacoInput
              value={rawContent}
              onChange={setRawContent}
              inputMode={inputMode}
              maxLength={MAX_INPUT_SIZE}
              onHandle={(h) => {
                editorHandleRef.current = h;
                setEditorMounted(true);
              }}
            />
          </div>
        </div>
        <div className={styles.panel}>
          <div className={styles.panelLabel}>
            <span>{transKey(lang, transWeJsonPreviewLabel)}</span>
            <div className={styles.previewActions}>
              <select
                className={styles.themeSelect}
                value={theme}
                onChange={(e) => setTheme(e.target.value as ExportTheme)}
              >
                {EXPORT_THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                disabled={!parsedContent || exporting !== null}
                onClick={() => handleExport("svg")}
              >
                <Download size={12} />
                {exporting === "svg" ? "…" : "SVG"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!parsedContent || exporting !== null}
                onClick={() => handleExport("png")}
              >
                <Download size={12} />
                {exporting === "png" ? "…" : "PNG"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!parsedContent || exporting !== null}
                onClick={() => handleExport("jpg")}
              >
                <Download size={12} />
                {exporting === "jpg" ? "…" : "JPG"}
              </Button>
            </div>
          </div>
          <div className={styles.editorWrap}>
            {!editorMounted && (
              <div className={styles.editorLoading} id="editor-loading-preview">
                {transKey(lang, transWeJsonLoadingPreview)}
              </div>
            )}
            <MonacoPreview value={parsedContent} lang={lang} theme={theme} />
          </div>
        </div>
      </div>

      <HistoryPanel
        lang={lang}
        history={history}
        onLoad={handleLoadHistory}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      <JsonPathPanel lang={lang} json={parsedContent} />
      <YamlPanel lang={lang} json={parsedContent} />
      <XmlPanel lang={lang} json={parsedContent} />
      <SchemaPanel lang={lang} json={parsedContent} />

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
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `,
  modeGroup: css`
    display: flex;
    gap: 0.6rem;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
  `,
  modeOption: css`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    user-select: none;
  `,
  previewActions: css`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-left: auto;
  `,
  themeSelect: css`
    font-size: 0.72rem;
    padding: 0.15rem 0.3rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #fff;
    color: #374151;
    cursor: pointer;
    outline: none;
    &:focus {
      border-color: #6b7280;
    }
  `,
  editorWrap: css`
    flex: 1;
    min-height: 0;
    background: #fff;
  `,
  editorLoading: css`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
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
