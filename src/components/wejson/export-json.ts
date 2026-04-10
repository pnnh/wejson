import type { Highlighter } from "shiki";

export const EXPORT_THEMES = [
  { value: "github-light", label: "GitHub Light" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "dracula", label: "Dracula" },
  { value: "nord", label: "Nord" },
  { value: "one-dark-pro", label: "One Dark Pro" },
] as const;

export type ExportTheme = (typeof EXPORT_THEMES)[number]["value"];

// Single highlighter loaded with ALL themes so shikiToMonaco can register them all
// and theme switching only needs monaco.editor.setTheme() — no re-patching.
let _highlighter: Highlighter | null = null;
// shikiToMonaco patches Monaco's tokenizer globally; only needs to happen once.
let _monacoPatched = false;

async function getHighlighter(): Promise<Highlighter> {
  if (_highlighter) return _highlighter;
  const { createHighlighter } = await import("shiki");
  _highlighter = await createHighlighter({
    themes: EXPORT_THEMES.map((t) => t.value),
    langs: ["json"],
  });
  return _highlighter;
}

/** Register shiki themes with Monaco and apply the selected theme. */
export async function applyShikiThemeToMonaco(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  monaco: any,
  theme: ExportTheme,
): Promise<void> {
  const hl = await getHighlighter();
  if (!_monacoPatched) {
    const { shikiToMonaco } = await import("@shikijs/monaco");
    shikiToMonaco(hl, monaco);
    _monacoPatched = true;
  }
  monaco.editor.setTheme(theme);
}

// --- SVG generation ---

const FONT_FAMILY =
  "'Consolas', ui-monospace, 'SF Mono', Menlo, Monaco, 'Courier New', monospace";
const FONT_SIZE = 13;
const LINE_HEIGHT = 20;
/** Approximate character width for 13px monospace. */
const CHAR_WIDTH = 7.82;
const PAD = { top: 12, right: 24, bottom: 12, left: 8 };
const LINE_NUM_GAP = 10;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function buildSvg(code: string, theme: ExportTheme): Promise<string> {
  const hl = await getHighlighter();
  const result = hl.codeToTokens(code, { lang: "json", theme });
  const lines = result.tokens;
  const bg = result.bg ?? "#ffffff";
  const fg = result.fg ?? "#000000";

  const lineCount = lines.length;
  const numDigits = String(lineCount).length;
  const numColWidth = numDigits * CHAR_WIDTH;
  const codeX = PAD.left + numColWidth + LINE_NUM_GAP;

  const maxCodeChars = Math.max(
    ...lines.map((line) => line.reduce((s, t) => s + t.content.length, 0)),
    20,
  );
  const svgWidth = Math.ceil(codeX + maxCodeChars * CHAR_WIDTH + PAD.right);
  const svgHeight = PAD.top + lineCount * LINE_HEIGHT + PAD.bottom;

  const parts: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = PAD.top + i * LINE_HEIGHT + FONT_SIZE;

    parts.push(
      `<text x="${PAD.left + numColWidth}" y="${y}" ` +
        `font-family="${FONT_FAMILY}" font-size="${FONT_SIZE}" ` +
        `fill="rgba(127,127,127,0.55)" text-anchor="end">${i + 1}</text>`,
    );

    if (line.length === 0) continue;

    const tspans = line
      .map((token) => {
        const color = token.color ?? fg;
        const bold = (token.fontStyle ?? 0) & 1 ? ' font-weight="bold"' : "";
        const italic = (token.fontStyle ?? 0) & 2 ? ' font-style="italic"' : "";
        return `<tspan fill="${color}"${bold}${italic}>${escapeXml(token.content)}</tspan>`;
      })
      .join("");

    parts.push(
      `<text x="${codeX}" y="${y}" xml:space="preserve" ` +
        `font-family="${FONT_FAMILY}" font-size="${FONT_SIZE}">${tspans}</text>`,
    );
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" ` +
    `width="${svgWidth}" height="${svgHeight}" ` +
    `viewBox="0 0 ${svgWidth} ${svgHeight}">\n` +
    `<rect width="${svgWidth}" height="${svgHeight}" fill="${bg}"/>\n` +
    parts.join("\n") +
    `\n</svg>`
  );
}

type ImageMime = "image/png" | "image/jpeg";

function svgToBlob(svg: string, mime: ImageMime, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    const svgBlob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = img.naturalWidth * 2;
      canvas.height = img.naturalHeight * 2;
      const ctx = canvas.getContext("2d")!;
      // JPEG has no alpha channel — fill canvas with white before drawing
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Canvas toBlob failed"));
        },
        mime,
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG to image failed"));
    };
    img.src = url;
  });
}

export async function buildPng(code: string, theme: ExportTheme): Promise<Blob> {
  return svgToBlob(await buildSvg(code, theme), "image/png");
}

export async function buildJpg(code: string, theme: ExportTheme): Promise<Blob> {
  return svgToBlob(await buildSvg(code, theme), "image/jpeg", 0.92);
}
