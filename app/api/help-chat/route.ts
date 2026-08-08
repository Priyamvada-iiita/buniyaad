import { NextResponse } from 'next/server';
import {
  FAQ_FALLBACK_REPLY,
  FAQ_QUICK_PICKS,
  LLM_DOWN_REPLY,
  findFaqAnswer,
  getHelpSystemPrompt,
  type HelpMessage,
} from '@/lib/help-chat';

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'llama3.2';
const OLLAMA_TIMEOUT_MS = 20_000;

function lastUserMessage(messages: HelpMessage[]) {
  return [...messages].reverse().find((m) => m.role === 'user')?.content?.trim() || '';
}

function isOllamaConfigured() {
  return Boolean((process.env.OLLAMA_BASE_URL || '').trim());
}

async function askOllama(messages: HelpMessage[]): Promise<string | null> {
  const baseUrl = (process.env.OLLAMA_BASE_URL || '').trim();
  if (!baseUrl) return null;

  const model = (process.env.OLLAMA_MODEL || DEFAULT_MODEL).trim();
  const url = `${baseUrl.replace(/\/$/, '')}/api/chat`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: getHelpSystemPrompt() }, ...messages],
      stream: false,
    }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { message?: { content?: string } };
  const text = data.message?.content?.trim();
  return text || null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: HelpMessage[] };
    const messages = (body.messages || []).filter(
      (m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    );

    const lastUser = lastUserMessage(messages);
    if (!lastUser) {
      return NextResponse.json({
        reply: FAQ_FALLBACK_REPLY,
        source: 'fallback',
        suggestions: FAQ_QUICK_PICKS,
      });
    }

    const faq = findFaqAnswer(lastUser);
    if (faq) {
      return NextResponse.json({ reply: faq.answer, source: 'faq', matchedQuestion: faq.question });
    }

    if (isOllamaConfigured()) {
      try {
        const ollamaReply = await askOllama(messages);
        if (ollamaReply) {
          return NextResponse.json({ reply: ollamaReply, source: 'ollama' });
        }
      } catch {
        // Fall through to LLM down message
      }
    }

    return NextResponse.json({
      reply: LLM_DOWN_REPLY,
      source: 'llm_down',
      suggestions: FAQ_QUICK_PICKS,
    });
  } catch {
    return NextResponse.json({
      reply: FAQ_FALLBACK_REPLY,
      source: 'fallback',
      suggestions: FAQ_QUICK_PICKS,
    });
  }
}

export async function GET() {
  const configured = isOllamaConfigured();
  return NextResponse.json({
    ollamaConfigured: configured,
    model: process.env.OLLAMA_MODEL || DEFAULT_MODEL,
    defaultUrl: DEFAULT_OLLAMA_URL,
    mode: configured ? 'ollama_with_faq_fallback' : 'faq_only',
  });
}
