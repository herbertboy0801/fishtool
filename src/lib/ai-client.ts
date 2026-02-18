import OpenAI from "openai";

if (!process.env.AI_API_KEY) {
  throw new Error("AI_API_KEY is not configured");
}

export const aiClient = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL ?? "https://api.codexzh.com/v1",
});

export const AI_MODEL = process.env.AI_MODEL ?? "gpt-5.2";

/** System prompt shared across all tools */
export const SYSTEM_BASE = `你是闲鱼运营助手，专门帮助闲鱼卖家优化商品文案和运营策略。
回复简洁专业，直接给出结果，不要解释，不要废话。
所有回复使用中文。`;
