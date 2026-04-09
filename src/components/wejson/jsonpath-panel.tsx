"use client";

import { transKey } from "@/components/common/locales/normal";
import {
  transWeJsonExecute,
  transWeJsonJsonPathHint,
  transWeJsonJsonPathPlaceholder,
  transWeJsonJsonPathTitle,
  transWeJsonPleaseFormat,
} from "@/components/common/locales/texts";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { css } from "@/gen/styled/css";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import React from "react";

interface Props {
  json: string;
  lang: string;
}

export function JsonPathPanel({ json, lang }: Props) {
  const [open, setOpen] = React.useState(false);
  const [expression, setExpression] = React.useState("$");
  const [result, setResult] = React.useState("");
  const [error, setError] = React.useState("");

  async function evaluate() {
    if (!json) {
      setError(transKey(lang, transWeJsonPleaseFormat));
      setResult("");
      return;
    }
    try {
      // 动态导入避免影响初始包体积
      const { JSONPath } = await import("jsonpath-plus");
      const parsed = JSON.parse(json);
      const found = JSONPath({ path: expression, json: parsed });
      setResult(JSON.stringify(found, null, 2));
      setError("");
    } catch (e) {
      setError(String(e));
      setResult("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") evaluate();
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className={panelStyles.header}>
        <CollapsibleTrigger asChild>
          <button className={panelStyles.trigger}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Search size={14} />
            <span>{transKey(lang, transWeJsonJsonPathTitle)}</span>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className={panelStyles.content}>
        <div className={panelStyles.queryRow}>
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={transKey(lang, transWeJsonJsonPathPlaceholder)}
            className={panelStyles.input}
            spellCheck={false}
          />
          <Button size="sm" onClick={evaluate} disabled={!json}>
            {transKey(lang, transWeJsonExecute)}
          </Button>
        </div>
        <p className={panelStyles.hint}>
          {transKey(lang, transWeJsonJsonPathHint)}
        </p>
        {error && <p className={panelStyles.error}>{error}</p>}
        {result && <pre className={panelStyles.result}>{result}</pre>}
      </CollapsibleContent>
    </Collapsible>
  );
}

const panelStyles = {
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
  queryRow: css`
    display: flex;
    gap: 0.5rem;
    align-items: center;
  `,
  input: css`
    flex: 1;
    font-family: "Courier New", monospace;
    font-size: 0.85rem;
  `,
  hint: css`
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0;
    & code {
      background: #f3f4f6;
      padding: 0.1rem 0.25rem;
      border-radius: 3px;
      font-size: 0.75rem;
    }
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
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 5px;
    padding: 0.75rem;
    font-size: 0.8rem;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    max-height: 20rem;
    overflow-y: auto;
    scrollbar-width: thin;
  `,
};
