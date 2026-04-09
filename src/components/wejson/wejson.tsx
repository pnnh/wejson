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
import React from "react";
import { WePreview } from "./preview";

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

  function parse(raw: string): unknown | null {
    try {
      const parsed = JSON.parse(raw);
      setErrMsg("");
      return parsed;
    } catch (error) {
      setErrMsg("Invalid JSON: " + error);
      return null;
    }
  }

  function handleFormat() {
    const parsed = parse(rawContent);
    if (parsed !== null) {
      setParsedContent(JSON.stringify(parsed, null, 2));
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

  function handleDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawContent((ev.target?.result as string) ?? "");
    };
    reader.readAsText(file);
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
          <textarea
            className={styles.textarea}
            value={rawContent}
            placeholder="在此粘贴 JSON，或拖入 .json 文件…"
            onChange={(e) => setRawContent(e.target.value)}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            spellCheck={false}
          />
        </div>
        <div className={styles.panel}>
          <div className={styles.panelLabel}>预览</div>
          <div className={styles.previewWrap}>
            <WePreview jsonText={parsedContent} />
          </div>
        </div>
      </div>

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
  textarea: css`
    flex: 1;
    width: 100%;
    padding: 0.75rem;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.85rem;
    line-height: 1.5;
    resize: none;
    outline: none;
    background: #1e1e1e;
    color: #d4d4d4;
    border: none;
  `,
  previewWrap: css`
    flex: 1;
    overflow: auto;
    scrollbar-width: thin;
    background: #1e1e1e;
  `,
};
