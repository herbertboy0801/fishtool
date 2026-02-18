"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { streamGenerate, useQuota } from "@/lib/quota-store";

interface Message {
  role: "user" | "ai";
  content: string;
}

const QUICK_QUESTIONS = [
  { icon: "💡", text: "商品曝光很低怎么办？" },
  { icon: "💰", text: "怎么定价才能卖得快？" },
  { icon: "✏️", text: "标题怎么写更吸引人？" },
  { icon: "🔒", text: "被限流了怎么申诉？" },
];

const MAX_ROUNDS = 3;

export default function QaAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { recordUsage } = useQuota();
  const bottomRef = useRef<HTMLDivElement>(null);

  const rounds = messages.filter((m) => m.role === "user").length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(
    async (question?: string) => {
      const q = (question ?? input).trim();
      if (!q || loading) return;
      if (rounds >= MAX_ROUNDS) return;

      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: q }]);
      setLoading(true);

      const aiMsg: Message = { role: "ai", content: "" };
      setMessages((prev) => [...prev, aiMsg]);

      try {
        const gen = streamGenerate("qa", { question: q });
        let next = await gen.next();
        while (!next.done) {
          const chunk = next.value as string;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + chunk,
            };
            return updated;
          });
          next = await gen.next();
        }
        const { tokens } = next.value as { tokens: number };
        recordUsage(tokens);
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: "出错了，请稍后重试。",
          };
          return updated;
        });
      } finally {
        setLoading(false);
      }
    },
    [input, loading, rounds, recordUsage]
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 0px)" }}>
      <PageHeader
        title="答疑助手"
        subtitle="闲鱼运营问题随时问"
        rightSlot={
          <span className="text-xs text-muted">{rounds}/{MAX_ROUNDS} 轮</span>
        }
      />

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center pt-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-4xl">
              🤖
            </div>
            <p className="mt-4 text-base font-semibold">你好！我是闲鱼运营小助手</p>
            <p className="mt-1 text-xs text-muted">有任何关于闲鱼运营的问题都可以问我，比如：</p>

            <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => handleSend(q.text)}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-xs text-muted hover:border-primary/40 hover:text-foreground transition-all touch-feedback"
                >
                  <span>{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 text-[10px] text-muted/50">📚 知识库：100 条</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-lg">
                🤖
              </div>
            )}
            <div
              className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-black rounded-tr-sm"
                  : "bg-card text-foreground rounded-tl-sm"
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? "▌" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3">
        {rounds >= MAX_ROUNDS ? (
          <p className="text-center text-xs text-muted py-1">
            免费版每次限 {MAX_ROUNDS} 轮对话，升级会员继续使用
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="输入你的问题..."
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted/50 focus:border-primary focus:outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white transition-colors hover:bg-indigo-600 disabled:opacity-40 touch-feedback"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
