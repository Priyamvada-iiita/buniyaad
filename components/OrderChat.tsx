'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getProfileIdForRole } from '@/lib/profiles';

type Message = {
  id: string;
  body: string;
  created_at: string;
  sender_profile_id: string;
};

export default function OrderChat({
  orderId,
  role,
}: {
  orderId: string;
  role: 'buyer' | 'seller';
}) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  useEffect(() => {
    if (!open) return;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const pid = await getProfileIdForRole(supabase, user.id, role);
      setMyProfileId(pid);
      await load();
    })();
  }, [open, orderId, role, supabase]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !myProfileId) return;
    setSending(true);
    const { error } = await supabase.from('order_messages').insert({
      order_id: orderId,
      sender_profile_id: myProfileId,
      body: text.trim(),
    });
    if (!error) {
      setText('');
      await load();
    }
    setSending(false);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-steel-600 mt-2">
        💬 Message {role === 'buyer' ? 'seller' : 'buyer'} about this order
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-concrete-200 bg-concrete-50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-concrete-200 bg-white">
        <p className="text-xs font-semibold">Order chat</p>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-graphite-500">
          Close
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto p-3 space-y-2">
        {!messages.length ? (
          <p className="text-xs text-graphite-500 text-center py-4">No messages yet. Say hi!</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_profile_id === myProfileId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                    mine ? 'bg-rebar-600 text-white' : 'bg-white border border-concrete-200 text-graphite-800'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 p-2 border-t border-concrete-200 bg-white">
        <input
          className="input-field text-xs flex-1 py-2"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={sending || !text.trim()} className="btn-primary text-xs py-2 px-3 shrink-0">
          Send
        </button>
      </form>
    </div>
  );
}
