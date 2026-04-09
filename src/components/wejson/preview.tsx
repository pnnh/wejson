"use client";

import { transKey } from "@/components/common/locales/normal";
import { transWeJsonNoContent } from "@/components/common/locales/texts";
import { css } from "@/gen/styled/css";

type TokenType =
  | "key"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "punctuation"
  | "whitespace";

// VS Code Tomorrow Night 配色
const TOKEN_COLORS: Record<TokenType, string> = {
  key: "#9cdcfe",
  string: "#ce9178",
  number: "#b5cea8",
  boolean: "#569cd6",
  null: "#569cd6",
  punctuation: "#d4d4d4",
  whitespace: "inherit",
};

/**
 * 将格式化后的 JSON 字符串拆分成带类型的 token 列表。
 * 输入保证是 JSON.stringify 的合法输出，因此可以用简单的正则驱动状态机处理。
 * 返回的 token.value 均为原始文本，React 渲染时会自动进行 HTML 转义，
 * 彻底消除 dangerouslySetInnerHTML 带来的 XSS 风险。
 */
function tokenizeJson(json: string): Array<{ type: TokenType; value: string }> {
  const tokens: Array<{ type: TokenType; value: string }> = [];
  let i = 0;

  while (i < json.length) {
    const rest = json.slice(i);
    let m: RegExpExecArray | null;

    if ((m = /^[ \t\r\n]+/.exec(rest))) {
      tokens.push({ type: "whitespace", value: m[0] });
      i += m[0].length;
    } else if ((m = /^"(?:[^"\\]|\\.)*"/.exec(rest))) {
      // 如果该字符串后紧跟 ':'，则为 key，否则为 string 值
      const after = rest.slice(m[0].length).trimStart();
      tokens.push({ type: after[0] === ":" ? "key" : "string", value: m[0] });
      i += m[0].length;
    } else if (
      (m = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+\-]?\d+)?/.exec(rest))
    ) {
      tokens.push({ type: "number", value: m[0] });
      i += m[0].length;
    } else if (rest.startsWith("true") || rest.startsWith("false")) {
      const kw = rest.startsWith("true") ? "true" : "false";
      tokens.push({ type: "boolean", value: kw });
      i += kw.length;
    } else if (rest.startsWith("null")) {
      tokens.push({ type: "null", value: "null" });
      i += 4;
    } else {
      tokens.push({ type: "punctuation", value: rest[0] });
      i++;
    }
  }

  return tokens;
}

export function WePreview({
  jsonText,
  lang,
}: {
  jsonText: string;
  lang: string;
}) {
  if (!jsonText) {
    return (
      <code className={previewStyles.previewCode}>
        {transKey(lang, transWeJsonNoContent)}
      </code>
    );
  }

  const tokens = tokenizeJson(jsonText);

  return (
    <code className={previewStyles.previewCode}>
      {tokens.map((token, idx) => (
        // React 将 token.value 作为文本节点渲染，自动转义所有 HTML 特殊字符
        <span key={idx} style={{ color: TOKEN_COLORS[token.type] }}>
          {token.value}
        </span>
      ))}
    </code>
  );
}

const previewStyles = {
  previewCode: css`
    display: block;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.85rem;
    line-height: 1.5;
    padding: 0.75rem;
    white-space: pre-wrap;
    word-break: break-all;
    color: #d4d4d4;
    background: transparent;
  `,
};
