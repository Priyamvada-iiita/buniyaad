'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FAQ_QUICK_PICKS } from '@/lib/help-chat';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  source?: string;
};

const MINIMIZED_KEY = 'buniyaad-help-minimized';

function HelpBotIcon({ className = 'text-lg' }: { className?: string }) {
  return <span className={className} aria-hidden>💬</span>;
}

export default function HelpChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<'faq_only' | 'ollama_with_faq_fallback'>('faq_only');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! Main Buniyaad help hoon. Orders, payments, seller setup, ya RFQ — kuch bhi poochho.',
      source: 'welcome',
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hidden = pathname?.startsWith('/internal/');

  useEffect(() => {
    if (localStorage.getItem(MINIMIZED_KEY) === '1') {
      setMinimized(true);
    }
  }, []);

  useEffect(() => {
    fetch('/api/help-chat')
      .then((r) => r.json())
      .then((d) => setMode(d.mode || 'faq_only'))
      .catch(() => setMode('faq_only'));
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const setMinimizedPref = (value: boolean) => {
    setMinimized(value);
    localStorage.setItem(MINIMIZED_KEY, value ? '1' : '0');
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/help-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Sorry, kuch issue aaya. Thodi der baad try karein.',
          source: data.source,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Network error — please try again.', source: 'error' },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (hidden) return null;

  return (
    <>
      {open ? (
        <div className="fixed bottom-5 right-4 z-overlay w-full max-w-xs rounded-2xl border border-concrete-200 bg-white shadow-2xl flex flex-col overflow-hidden max-h-mobile-menu sm:max-w-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-concrete-200 bg-ink text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rebar-600 text-sm">
                💬
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">Buniyaad Help</p>
                <p className="text-2xs text-concrete-300 truncate">
                  {mode === 'ollama_with_faq_fallback' ? 'AI + FAQs' : 'Instant answers'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMinimizedPref(true);
                  setOpen(false);
                }}
                className="h-7 w-7 rounded-full text-concrete-300 hover:text-white hover:bg-graphite-700 flex items-center justify-center text-base leading-none"
                aria-label="Minimize to icon"
                title="Minimize"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-7 w-7 rounded-full text-concrete-300 hover:text-white hover:bg-graphite-700 flex items-center justify-center text-xl leading-none"
                aria-label="Close help chat"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-concrete-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-rebar-600 text-white'
                      : 'bg-white border border-concrete-200 text-graphite-800'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending ? <p className="text-xs text-graphite-500 animate-pulse">Typing…</p> : null}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 pt-2 pb-1 border-t border-concrete-200 bg-white">
            <div className="flex gap-1.5 overflow-x-auto pb-2">
              {FAQ_QUICK_PICKS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={sending}
                  className="shrink-0 text-2xs px-2 py-1 rounded-full border border-concrete-200 bg-concrete-50 hover:bg-rebar-50 hover:border-rebar-200 text-graphite-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <form
            className="flex gap-2 p-3 border-t border-concrete-200 bg-white"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              className="input-field text-xs flex-1 py-2"
              placeholder="Type your question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={sending || !input.trim()} className="btn-primary text-xs py-2 px-3 shrink-0">
              Send
            </button>
          </form>
        </div>
      ) : minimized ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          onDoubleClick={(e) => {
            e.preventDefault();
            setMinimizedPref(false);
          }}
          className="fixed bottom-5 right-4 z-overlay h-12 w-12 rounded-full bg-rebar-600 text-white shadow-lg hover:bg-rebar-700 hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="Open Buniyaad help chat"
          title="Tap for help · Double-tap to show full button"
        >
          <span className="relative">
            <HelpBotIcon />
            {mode === 'ollama_with_faq_fallback' ? (
              <span
                className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-signal-green border-2 border-white"
                title="AI enabled"
              />
            ) : null}
          </span>
        </button>
      ) : (
        <div className="fixed bottom-5 right-4 z-overlay w-full max-w-xs rounded-2xl border border-concrete-200 bg-white shadow-lg overflow-hidden sm:max-w-sm">
          <button
            type="button"
            onClick={() => setMinimizedPref(true)}
            className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-concrete-100 text-graphite-600 hover:bg-concrete-200 hover:text-ink flex items-center justify-center text-sm leading-none"
            aria-label="Minimize help chat to icon"
            title="Minimize"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full p-3.5 pr-10 hover:bg-concrete-50 transition-colors text-left flex gap-3 items-start group"
            aria-label="Open Buniyaad help chat"
          >
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rebar-600 text-white text-lg shadow-md">
              <HelpBotIcon />
              {mode === 'ollama_with_faq_fallback' ? (
                <span
                  className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-signal-green border-2 border-white"
                  title="AI enabled"
                />
              ) : null}
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-[13px] font-semibold text-ink leading-snug">How can I help you?</span>
              <span className="block text-[11px] text-graphite-600 mt-1 leading-snug">
                Ask questions — orders, payments, sellers…
              </span>
              <span className="block text-[11px] font-semibold text-rebar-600 mt-2 group-hover:underline">
                Chat now →
              </span>
            </span>
          </button>
        </div>
      )}
    </>
  );
}
