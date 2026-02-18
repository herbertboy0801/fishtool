"use client";

import { useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { showToast } from "@/components/ui/toast";
import { store, addToCollection } from "@/lib/store";

interface LogEntry {
  id?: string;
  createdAt?: number;
  date: string;
  actions: string[];
  note: string;
}

const ACTION_TYPES = [
  { key: "上架新品", icon: "🆕" },
  { key: "下架商品", icon: "📦" },
  { key: "改价调整", icon: "💰" },
  { key: "刷新商品", icon: "🔄" },
  { key: "回复买家", icon: "💬" },
  { key: "推广投放", icon: "📢" },
  { key: "优化主图", icon: "📸" },
  { key: "优化标题", icon: "✏️" },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${m}月${day}日 周${weekDays[d.getDay()]}`;
}

export default function OperationLogPage() {
  const [tab, setTab] = useState<"list" | "record">("record");
  const [logs, setLogs] = useState<LogEntry[]>(() =>
    store.get<LogEntry[]>("op_logs", [])
  );

  // Record form state
  const [date, setDate] = useState(todayStr());
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const toggleAction = useCallback((key: string) => {
    setSelectedActions((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  }, []);

  const todayLogged = logs.some((l) => l.date === todayStr());

  const handleSave = useCallback(() => {
    if (selectedActions.length === 0 && !note.trim()) {
      showToast("请选择运营动作或填写备注", "warning");
      return;
    }

    // Remove existing entry for same date
    const existing = store.get<LogEntry[]>("op_logs", []);
    const filtered = existing.filter((l) => l.date !== date);
    const newEntry: LogEntry = {
      id: `log_${date}`,
      date,
      actions: selectedActions,
      note: note.trim(),
      createdAt: Date.now(),
    };
    const updated = [newEntry, ...filtered].slice(0, 90);
    store.set("op_logs", updated);
    setLogs(updated);

    showToast("已保存运营日志", "success");
    setTab("list");
  }, [date, selectedActions, note]);

  const handleLoadForEdit = useCallback(
    (log: LogEntry) => {
      setDate(log.date);
      setSelectedActions(log.actions);
      setNote(log.note);
      setTab("record");
    },
    []
  );

  return (
    <div>
      <PageHeader title="操作日志" subtitle="记录每日运营与动作复盘" />

      {/* Today status banner */}
      {todayLogged && tab === "record" && (
        <div
          className="mx-4 mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 touch-feedback"
          onClick={() => setTab("list")}
        >
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-medium text-green-400">今日已全部录入</p>
            <p className="text-xs text-muted">点击查看或修改今日数据</p>
          </div>
        </div>
      )}

      <div className="px-4 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex rounded-xl bg-card p-1">
          {(["record", "list"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all touch-feedback ${
                tab === t ? "bg-primary text-black" : "text-muted"
              }`}
            >
              {t === "record" ? "✏️ 录入" : "📋 列表"}
            </button>
          ))}
        </div>

        {tab === "record" && (
          <>
            {/* Date */}
            <div className="rounded-xl bg-card p-4">
              <label className="mb-1.5 block text-xs text-muted">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Action types */}
            <div className="rounded-xl bg-card p-4">
              <p className="mb-3 text-sm font-medium">今日运营动作</p>
              <div className="grid grid-cols-4 gap-2">
                {ACTION_TYPES.map((a) => (
                  <button
                    key={a.key}
                    onClick={() => toggleAction(a.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl py-3 text-xs transition-all touch-feedback ${
                      selectedActions.includes(a.key)
                        ? "bg-primary/20 border border-primary/50 text-primary"
                        : "bg-background border border-border text-muted"
                    }`}
                  >
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-[10px] leading-tight text-center">{a.key}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="rounded-xl bg-card p-4">
              <label className="mb-1.5 block text-sm font-medium">备注 / 复盘</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="今天有什么发现？遇到什么问题？明天该怎么优化..."
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-black transition-colors hover:bg-primary-hover touch-feedback"
            >
              💾 保存日志
            </button>
          </>
        )}

        {tab === "list" && (
          <>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <span className="text-5xl">📒</span>
                <p className="mt-3 text-sm font-medium">暂无运营日志</p>
                <p className="mt-1 text-xs text-muted">每天记录运营动作，复盘成长更快</p>
                <button
                  onClick={() => setTab("record")}
                  className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black touch-feedback"
                >
                  开始记录
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => handleLoadForEdit(log)}
                    className="rounded-xl bg-card p-4 touch-feedback cursor-pointer hover:bg-card-hover transition-colors"
                  >
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {formatDate(log.date)}
                      </span>
                      {log.date === todayStr() && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">
                          今天
                        </span>
                      )}
                    </div>

                    {log.actions.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {log.actions.map((a) => {
                          const at = ACTION_TYPES.find((x) => x.key === a);
                          return (
                            <span
                              key={a}
                              className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
                            >
                              {at?.icon} {a}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {log.note && (
                      <p className="text-xs text-muted line-clamp-2">{log.note}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
