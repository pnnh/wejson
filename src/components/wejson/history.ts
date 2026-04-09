"use client";

import { useCallback, useEffect, useState } from "react";

const HISTORY_KEY = "wejson_history";
const MAX_HISTORY = 10;

export interface HistoryItem {
  id: string;
  content: string;
  /** 内容前 60 个字符预览 */
  preview: string;
  timestamp: number;
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryItem[];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    // localStorage 不可用时静默失败
  }
}

export function useJsonHistory() {
  // 初始值固定为 []，确保 SSR 与客户端首次渲染一致，避免 hydration mismatch
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 挂载后才从 localStorage 恢复历史记录
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addToHistory = useCallback((content: string) => {
    if (!content.trim()) return;
    const preview = content.replace(/\s+/g, " ").trim().slice(0, 60);
    setHistory((prev) => {
      // 去重：移除内容完全相同的旧记录
      const deduped = prev.filter((h) => h.content !== content);
      const item: HistoryItem = {
        id: crypto.randomUUID(),
        content,
        preview,
        timestamp: Date.now(),
      };
      const next = [item, ...deduped].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}
