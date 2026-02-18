"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Modal } from "@/components/ui/modal";
import { showToast } from "@/components/ui/toast";
import { store } from "@/lib/store";

interface ViolationRecord {
  id: string;
  type: string;
  reason: string;
  description: string;
  date: string;
}

const VIOLATION_TYPES = ["全部类型", "限流", "下架", "封号", "扣分", "其他"];
const VIOLATION_REASONS = ["全部原因", "违禁词", "虚假描述", "侵权", "违规图片", "其他"];

const STORAGE_KEY = "violation_records";

function loadRecords(): ViolationRecord[] {
  return store.get<ViolationRecord[]>(STORAGE_KEY, []);
}

function saveRecords(records: ViolationRecord[]) {
  store.set(STORAGE_KEY, records);
}

export default function ViolationRecordsPage() {
  const [records, setRecords] = useState<ViolationRecord[]>(loadRecords);
  const [typeFilter, setTypeFilter] = useState("全部类型");
  const [reasonFilter, setReasonFilter] = useState("全部原因");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: "限流", reason: "违禁词", description: "" });

  const filtered = records.filter((r) => {
    const matchType = typeFilter === "全部类型" || r.type === typeFilter;
    const matchReason = reasonFilter === "全部原因" || r.reason === reasonFilter;
    return matchType && matchReason;
  });

  function handleSubmit() {
    if (!form.description.trim()) {
      showToast("请填写案例描述", "error");
      return;
    }
    const newRecord: ViolationRecord = {
      id: Date.now().toString(),
      type: form.type,
      reason: form.reason,
      description: form.description.trim(),
      date: new Date().toLocaleDateString("zh-CN"),
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    saveRecords(updated);
    setForm({ type: "限流", reason: "违禁词", description: "" });
    setShowModal(false);
    showToast("案例提交成功，感谢分享！", "success");
  }

  return (
    <>
      <PageHeader title="违规记录库" subtitle="社区共建的违规案例，帮你避坑" />

      <div className="px-4 pt-4">
        {/* Filters */}
        <div className="mb-4 flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="flex-1 rounded-xl bg-card px-3 py-2.5 text-sm text-foreground border border-border focus:outline-none focus:border-primary"
          >
            {VIOLATION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="flex-1 rounded-xl bg-card px-3 py-2.5 text-sm text-foreground border border-border focus:outline-none focus:border-primary"
          >
            {VIOLATION_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black whitespace-nowrap touch-feedback"
          >
            + 提交案例
          </button>
        </div>

        {/* Records list */}
        {filtered.length === 0 ? (
          <div className="mt-20 flex flex-col items-center gap-3 text-center">
            <span className="text-5xl">📬</span>
            <p className="font-semibold">暂无记录</p>
            <p className="text-sm text-muted">成为第一个分享违规经历的人</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black touch-feedback"
            >
              + 提交案例
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record) => (
              <div key={record.id} className="rounded-xl bg-card p-4 border border-border">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-danger/20 px-2 py-0.5 text-[11px] text-danger font-medium">
                    {record.type}
                  </span>
                  <span className="rounded-full bg-border px-2 py-0.5 text-[11px] text-muted">
                    {record.reason}
                  </span>
                  <span className="ml-auto text-[11px] text-muted">{record.date}</span>
                </div>
                <p className="text-sm leading-relaxed text-muted">{record.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="提交违规案例"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">违规类型</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-primary"
            >
              {VIOLATION_TYPES.filter((t) => t !== "全部类型").map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">违规原因</label>
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full rounded-xl bg-background px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-primary"
            >
              {VIOLATION_REASONS.filter((r) => r !== "全部原因").map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">案例描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请描述你的违规经历，帮助其他卖家避坑..."
              rows={4}
              className="w-full resize-none rounded-xl bg-background px-3 py-2.5 text-sm border border-border focus:outline-none focus:border-primary placeholder:text-muted"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-black touch-feedback"
          >
            提交案例
          </button>
        </div>
      </Modal>
    </>
  );
}
