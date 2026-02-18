import { NextRequest } from "next/server";
import { aiClient, AI_MODEL, SYSTEM_BASE } from "@/lib/ai-client";

export const runtime = "nodejs";

// Prompt builders per tool type
function buildPrompt(type: string, params: Record<string, unknown>): string {
  switch (type) {
    case "copywriting": {
      const styleMap: Record<string, string> = {
        标准: "标准专业风格，清晰描述商品卖点",
        精炼: "精炼简洁风格，用最少的字表达最多的信息",
        权威: "权威可信风格，强调品质保证和诚信",
        种草: "种草分享风格，像朋友推荐一样自然有感染力",
      };
      const style = styleMap[params.style as string] ?? styleMap["标准"];
      return `请将以下同行商品描述改写成全新的闲鱼商品文案。
要求：${style}，避免违禁词，突出卖点，不超过200字。
直接输出改写后的文案，不要任何说明或前缀。

同行原文：
${params.text}`;
    }

    case "seo": {
      const samples = (params.samples as string[]).filter(Boolean);
      return `分析以下${samples.length}条闲鱼爆款商品文案，提取关键词规律，生成优化建议。

输出格式（严格按此结构）：
## 核心关键词
（列出5-8个高频关键词）

## 黄金标题矩阵
（给出3个可直接使用的标题，每个不超过30字）

## 优化建议
（2-3条简洁建议）

爆款文案：
${samples.map((s, i) => `【${i + 1}】${s}`).join("\n\n")}`;
    }

    case "qa": {
      return `${SYSTEM_BASE}
用户问题：${params.question}
请给出专业、实用的闲鱼运营建议，控制在150字以内。`;
    }

    case "smart-reply": {
      const scenarioMap: Record<string, string> = {
        砍价应对: "买家正在砍价，需要婉拒同时保留成交可能",
        质量疑虑: "买家对商品质量有疑虑，需要打消顾虑",
        物流咨询: "买家询问物流相关问题",
        竞品比较: "买家拿竞品来比较，需要突出自身优势",
        售后问题: "买家有售后问题需要处理",
        促成交易: "买家犹豫中，需要推动成交",
      };
      const scenario = scenarioMap[params.scenario as string] ?? "";
      return `商品信息：${params.product}
场景：${scenario}
买家消息：${params.message}

请生成一条自然、得体的卖家回复，不超过100字。直接输出回复内容。`;
    }

    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { type: string } & Record<string, unknown>;
    const { type, ...params } = body;

    if (!type) {
      return Response.json({ error: "Missing type" }, { status: 400 });
    }

    const userPrompt = buildPrompt(type, params);

    // Use streaming for real-time response
    const stream = await aiClient.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_BASE },
        { role: "user", content: userPrompt },
      ],
      stream: true,
      max_tokens: 600,
      temperature: 0.7,
    });

    // Return SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let totalTokens = 0;
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`)
              );
            }
            if (chunk.usage) {
              totalTokens = chunk.usage.total_tokens;
            }
          }
          // Send final usage info
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, tokens: totalTokens })}\n\n`
            )
          );
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: String(err) })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[/api/generate]", err);
    return Response.json({ error: "AI service error" }, { status: 500 });
  }
}
