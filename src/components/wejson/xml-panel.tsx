"use client";

import React from "react";
import { ChevronDown, ChevronRight, Copy, Download, Code2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { css } from "@/gen/styled/css";

interface Props {
  json: string;
}

// 转义 XML 特殊字符（文本节点内）
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 将标签名中不合法的字符替换为下划线（XML tag 不能以数字开头等）
function safeTag(name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9_\-.:]/g, "_");
  return /^[^a-zA-Z_]/.test(sanitized) ? `_${sanitized}` : sanitized;
}

function valueToXml(value: unknown, tag: string, indent: string): string {
  const t = safeTag(tag);
  const next = indent + "  ";

  if (value === null || value === undefined) {
    return `${indent}<${t} nil="true"/>`;
  }
  if (typeof value === "boolean" || typeof value === "number") {
    return `${indent}<${t}>${value}</${t}>`;
  }
  if (typeof value === "string") {
    return `${indent}<${t}>${escapeXml(value)}</${t}>`;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return `${indent}<${t}/>`;
    const items = value.map((v) => valueToXml(v, "item", next)).join("\n");
    return `${indent}<${t}>\n${items}\n${indent}</${t}>`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${indent}<${t}/>`;
    const children = entries.map(([k, v]) => valueToXml(v, k, next)).join("\n");
    return `${indent}<${t}>\n${children}\n${indent}</${t}>`;
  }
  return `${indent}<${t}>${escapeXml(String(value))}</${t}>`;
}

function jsonToXml(json: string, rootTag: string): string {
  const parsed = JSON.parse(json);
  const body = valueToXml(parsed, rootTag, "");
  return `<?xml version="1.0" encoding="UTF-8"?>\n${body}`;
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

export function XmlPanel({ json }: Props) {
  const [open, setOpen] = React.useState(false);
  const [rootTag, setRootTag] = React.useState("root");
  const [xml, setXml] = React.useState("");
  const [error, setError] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  function convert() {
    if (!json) {
      setError("请先格式化 JSON");
      setXml("");
      return;
    }
    try {
      setXml(jsonToXml(json, rootTag || "root"));
      setError("");
    } catch (e) {
      setError(String(e));
      setXml("");
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !xml && !error) convert();
  }

  async function handleCopy() {
    if (!xml) return;
    await navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Collapsible open={open} onOpenChange={handleOpenChange}>
      <div className={s.header}>
        <CollapsibleTrigger asChild>
          <button className={s.trigger}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Code2 size={14} />
            <span>导出 XML</span>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className={s.content}>
        <div className={s.actionRow}>
          <div className={s.rootRow}>
            <span className={s.label}>根标签名</span>
            <Input
              value={rootTag}
              onChange={(e) => setRootTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && convert()}
              placeholder="root"
              className={s.rootInput}
              spellCheck={false}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={convert}
            disabled={!json}
          >
            转换
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            disabled={!xml}
          >
            <Copy size={13} />
            {copied ? "已复制!" : "复制"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadText(xml, "data.xml", "application/xml")}
            disabled={!xml}
          >
            <Download size={13} />
            下载 .xml
          </Button>
        </div>
        {error && <p className={s.error}>{error}</p>}
        {xml && <pre className={s.result}>{xml}</pre>}
        {!xml && !error && (
          <p className={s.hint}>
            展开后自动将格式化 JSON 转为 XML，可自定义根标签名。
          </p>
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
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  `,
  rootRow: css`
    display: flex;
    align-items: center;
    gap: 0.375rem;
  `,
  label: css`
    font-size: 0.78rem;
    color: #6b7280;
    white-space: nowrap;
  `,
  rootInput: css`
    width: 7rem;
    font-family: "Courier New", monospace;
    font-size: 0.82rem;
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
