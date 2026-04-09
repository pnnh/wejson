"use client";

import { transKey } from "@/components/common/locales/normal";
import {
  transWeJsonCopied,
  transWeJsonCopy,
  transWeJsonDownloadYaml,
  transWeJsonExportYaml,
  transWeJsonPleaseFormat,
  transWeJsonReconvert,
  transWeJsonYamlHint,
} from "@/components/common/locales/texts";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { css } from "@/gen/styled/css";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileCode,
} from "lucide-react";
import React from "react";

interface Props {
  json: string;
  lang: string;
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function YamlPanel({ json, lang }: Props) {
  const [open, setOpen] = React.useState(false);
  const [yaml, setYaml] = React.useState("");
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  async function convert() {
    if (!json) {
      setError(transKey(lang, transWeJsonPleaseFormat));
      setYaml("");
      return;
    }
    try {
      const { dump } = await import("js-yaml");
      const parsed = JSON.parse(json);
      setYaml(dump(parsed, { indent: 2, lineWidth: -1 }));
      setError("");
    } catch (e) {
      setError(String(e));
      setYaml("");
    }
  }

  // 展开时自动触发转换
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !yaml && !error) convert();
  }

  async function handleCopy() {
    if (!yaml) return;
    await navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <div className={s.header}>
        <CollapsibleTrigger asChild>
          <button className={s.trigger}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <FileCode size={14} />
            <span>{transKey(lang, transWeJsonExportYaml)}</span>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className={s.content}>
        <div className={s.actionRow}>
          <Button
            size="sm"
            variant="outline"
            onClick={convert}
            disabled={!json}
          >
            {transKey(lang, transWeJsonReconvert)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!yaml}
          >
            <Copy size={13} />
            {copied
              ? transKey(lang, transWeJsonCopied)
              : transKey(lang, transWeJsonCopy)}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadText(yaml, "data.yaml", "text/yaml")}
            disabled={!yaml}
          >
            <Download size={13} />
            {transKey(lang, transWeJsonDownloadYaml)}
          </Button>
        </div>
        {error && <p className={s.error}>{error}</p>}
        {yaml && <pre className={s.result}>{yaml}</pre>}
        {!yaml && !error && (
          <p className={s.hint}>{transKey(lang, transWeJsonYamlHint)}</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

const s = {
  header: css`
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.25rem 0.5rem;
    background: #f9fafb;
  `,
  trigger: css`
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    flex: 1;
    text-align: left;
    background: none;
    border: none;
    padding: 0.25rem;
    &:hover {
      color: #111827;
    }
  `,
  content: css`
    border: 1px solid #e5e7eb;
    border-top: none;
    border-radius: 0 0 6px 6px;
    background: #fff;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,
  actionRow: css`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  `,
  hint: css`
    font-size: 0.78rem;
    color: #9ca3af;
    margin: 0;
  `,
  error: css`
    font-size: 0.8rem;
    color: #ef4444;
    margin: 0;
    font-family: "Courier New", monospace;
    white-space: pre-wrap;
    word-break: break-all;
  `,
  result: css`
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #1e293b;
    border-radius: 5px;
    padding: 0.75rem;
    font-size: 0.8rem;
    font-family: "Courier New", monospace;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    max-height: 20rem;
    overflow-y: auto;
    scrollbar-width: thin;
  `,
};
