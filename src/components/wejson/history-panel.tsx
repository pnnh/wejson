"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { css } from "@/gen/styled/css";
import { ChevronDown, ChevronRight, Clock, Trash2, X } from "lucide-react";
import React from "react";
import type { HistoryItem } from "./history";

interface Props {
  history: HistoryItem[];
  onLoad: (content: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onLoad, onRemove, onClear }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className={panelStyles.header}>
        <CollapsibleTrigger asChild>
          <button className={panelStyles.trigger}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Clock size={14} />
            <span>历史记录</span>
            {history.length > 0 && (
              <span className={panelStyles.badge}>{history.length}</span>
            )}
          </button>
        </CollapsibleTrigger>
        {open && history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className={panelStyles.clearBtn}
            onClick={onClear}
          >
            <Trash2 size={13} />
            清空
          </Button>
        )}
      </div>

      <CollapsibleContent className={panelStyles.content}>
        {history.length === 0 ? (
          <p className={panelStyles.empty}>
            暂无历史记录。每次格式化后自动保存。
          </p>
        ) : (
          <ul className={panelStyles.list}>
            {history.map((item) => (
              <li key={item.id} className={panelStyles.item}>
                <button
                  className={panelStyles.itemPreview}
                  onClick={() => onLoad(item.content)}
                  title="点击加载到编辑器"
                >
                  <span className={panelStyles.itemText}>{item.preview}</span>
                  <span className={panelStyles.itemTime}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </button>
                <button
                  className={panelStyles.removeBtn}
                  onClick={() => onRemove(item.id)}
                  title="删除此条记录"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

const panelStyles = {
  header: css`
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
  badge: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    border-radius: 9999px;
    background: #3b82f6;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0 0.25rem;
  `,
  clearBtn: css`
    margin-left: auto;
    font-size: 0.75rem;
    color: #6b7280;
    &:hover {
      color: #ef4444;
    }
  `,
  content: css`
    border: 1px solid #e5e7eb;
    border-top: none;
    border-radius: 0 0 6px 6px;
    background: #fff;
  `,
  empty: css`
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
    color: #9ca3af;
  `,
  list: css`
    list-style: none;
    margin: 0;
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    max-height: 10rem;
    overflow-y: auto;
    scrollbar-width: thin;
  `,
  item: css`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border-radius: 4px;
    &:hover {
      background: #f3f4f6;
    }
  `,
  itemPreview: css`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    cursor: pointer;
    background: none;
    border: none;
    text-align: left;
    min-width: 0;
  `,
  itemText: css`
    flex: 1;
    font-size: 0.78rem;
    font-family: "Courier New", monospace;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  `,
  itemTime: css`
    font-size: 0.72rem;
    color: #9ca3af;
    white-space: nowrap;
    flex-shrink: 0;
  `,
  removeBtn: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    color: #9ca3af;
    border-radius: 3px;
    flex-shrink: 0;
    &:hover {
      color: #ef4444;
      background: #fee2e2;
    }
  `,
};
