"use client";

import React from "react";
import { ChevronDown, ChevronRight, ShieldCheck, Wand2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { css } from "@/gen/styled/css";

interface Props {
  /** 格式化后的 JSON 字符串（被校验数据） */
  json: string;
}

const PLACEHOLDER = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "age":  { "type": "integer", "minimum": 0 }
  },
  "required": ["name"]
}`;

// ── Schema 推断 ────────────────────────────────────────────────────────────────

type SchemaNode =
  | { type: "null" }
  | { type: "boolean" }
  | { type: "integer" }
  | { type: "number" }
  | { type: "string" }
  | { type: "array"; items?: SchemaNode }
  | {
      type: "object";
      properties: Record<string, SchemaNode>;
      required: string[];
    };

/**
 * 根据任意 JSON 值递归推断 JSON Schema（Draft-07 兼容）。
 * 策略：
 *  - null            → {type: "null"}
 *  - boolean         → {type: "boolean"}
 *  - 整数            → {type: "integer"}
 *  - 小数            → {type: "number"}
 *  - string          → {type: "string"}
 *  - 空数组          → {type: "array"}
 *  - 同类型数组       → {type: "array", items: <推断自第一个元素>}
 *  - 混合类型数组     → {type: "array"}（items 省略，表示 any）
 *  - 对象            → {type: "object", properties: {...}, required: [...所有键]}
 */
function inferSchema(value: unknown): SchemaNode {
  if (value === null) return { type: "null" };
  if (typeof value === "boolean") return { type: "boolean" };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { type: "integer" } : { type: "number" };
  }
  if (typeof value === "string") return { type: "string" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "array" };
    const firstSchema = inferSchema(value[0]);
    // 检查数组中所有元素的顶层 type 是否一致
    const allSameType = value.every(
      (v) => inferSchema(v).type === firstSchema.type,
    );
    return allSameType
      ? { type: "array", items: firstSchema }
      : { type: "array" };
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const properties: Record<string, SchemaNode> = {};
    for (const key of Object.keys(obj)) {
      properties[key] = inferSchema(obj[key]);
    }
    return {
      type: "object",
      properties,
      required: Object.keys(obj),
    };
  }
  // fallback（不应到达）
  return { type: "string" };
}

/** 将推断结果转为带 $schema 声明的完整 Draft-07 Schema 对象 */
function buildFullSchema(value: unknown): object {
  const schema = inferSchema(value) as Record<string, unknown>;
  return { $schema: "http://json-schema.org/draft-07/schema#", ...schema };
}

// ── 校验结果类型 ───────────────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
}

// ── 组件 ───────────────────────────────────────────────────────────────────────

export function SchemaPanel({ json }: Props) {
  const [open, setOpen] = React.useState(false);
  const [schemaText, setSchemaText] = React.useState("");
  const [result, setResult] = React.useState<ValidationResult | null>(null);
  const [error, setError] = React.useState("");

  function handleGenerate() {
    if (!json) {
      setError("请先格式化 JSON");
      return;
    }
    try {
      const data = JSON.parse(json);
      const generated = buildFullSchema(data);
      setSchemaText(JSON.stringify(generated, null, 2));
      setResult(null);
      setError("");
    } catch (e) {
      setError(String(e));
    }
  }

  async function validate() {
    if (!json) {
      setError("请先格式化 JSON");
      setResult(null);
      return;
    }
    if (!schemaText.trim()) {
      setError("请输入 JSON Schema");
      setResult(null);
      return;
    }
    try {
      const Ajv = (await import("ajv")).default;
      const ajv = new Ajv({ allErrors: true });

      let schema: unknown;
      try {
        schema = JSON.parse(schemaText);
      } catch {
        setError("JSON Schema 格式错误，请检查语法");
        setResult(null);
        return;
      }

      let data: unknown;
      try {
        data = JSON.parse(json);
      } catch {
        setError("数据 JSON 解析失败，请先格式化");
        setResult(null);
        return;
      }

      const validate = ajv.compile(schema as object);
      const valid = validate(data);

      if (valid) {
        setResult({ valid: true, errors: [] });
      } else {
        const errors = (validate.errors ?? []).map((e) => ({
          path: e.instancePath || "(root)",
          message: e.message ?? "未知错误",
        }));
        setResult({ valid: false, errors });
      }
      setError("");
    } catch (e) {
      setError(String(e));
      setResult(null);
    }
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className={s.header}>
        <CollapsibleTrigger asChild>
          <button className={s.trigger}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <ShieldCheck size={14} />
            <span>JSON Schema 校验</span>
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className={s.content}>
        <div className={s.hintRow}>
          <p className={s.hint}>
            输入 JSON Schema（支持 Draft-07），点击校验查看数据是否符合规范。
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerate}
            disabled={!json}
            title="根据当前格式化的 JSON 自动推断并生成 Schema"
          >
            <Wand2 size={13} />从 JSON 生成
          </Button>
        </div>
        <textarea
          className={s.schemaInput}
          value={schemaText}
          onChange={(e) => setSchemaText(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          rows={8}
        />
        <div className={s.actionRow}>
          <Button size="sm" onClick={validate} disabled={!json}>
            校验
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setResult(null);
              setError("");
            }}
          >
            清除结果
          </Button>
        </div>
        {error && <p className={s.error}>{error}</p>}
        {result && (
          <div className={result.valid ? s.passBox : s.failBox}>
            {result.valid ? (
              <span className={s.passText}>
                ✓ 校验通过，数据符合 Schema 规范
              </span>
            ) : (
              <>
                <span className={s.failText}>
                  ✗ 校验失败，共 {result.errors.length} 个错误
                </span>
                <ul className={s.errorList}>
                  {result.errors.map((e, i) => (
                    <li key={i} className={s.errorItem}>
                      <code className={s.errorPath}>{e.path}</code>
                      <span>{e.message}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
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
  hint: css`
    font-size: 0.78rem;
    color: #6b7280;
    margin: 0;
    flex: 1;
  `,
  hintRow: css`
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  `,
  schemaInput: css`
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    padding: 0.625rem;
    font-family: "Courier New", monospace;
    font-size: 0.82rem;
    line-height: 1.6;
    color: #1e293b;
    background: #f8fafc;
    resize: vertical;
    outline: none;
    &:focus {
      border-color: #3b82f6;
      background: #fff;
    }
  `,
  actionRow: css`
    display: flex;
    gap: 0.5rem;
  `,
  error: css`
    font-size: 0.8rem;
    color: #ef4444;
    margin: 0;
    font-family: "Courier New", monospace;
    white-space: pre-wrap;
  `,
  passBox: css`
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 5px;
    padding: 0.625rem 0.875rem;
  `,
  failBox: css`
    background: #fff7f7;
    border: 1px solid #fecaca;
    border-radius: 5px;
    padding: 0.625rem 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,
  passText: css`
    font-size: 0.85rem;
    font-weight: 600;
    color: #16a34a;
  `,
  failText: css`
    font-size: 0.85rem;
    font-weight: 600;
    color: #dc2626;
  `,
  errorList: css`
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    max-height: 14rem;
    overflow-y: auto;
    scrollbar-width: thin;
  `,
  errorItem: css`
    display: flex;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #374151;
    align-items: baseline;
  `,
  errorPath: css`
    background: #fee2e2;
    color: #b91c1c;
    border-radius: 3px;
    padding: 0.1rem 0.35rem;
    font-size: 0.75rem;
    white-space: nowrap;
    flex-shrink: 0;
  `,
};
