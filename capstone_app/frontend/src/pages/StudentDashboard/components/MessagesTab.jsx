import { useEffect, useMemo, useState } from 'react';
import { Clock3, MessageSquare, Send } from 'lucide-react';
import {
  MESSAGE_TOPIC_OPTIONS,
  fetchConversationMessages,
  fetchStudentMessageThreads,
  markConversationAsRead,
  sendMessageForThread,
  subscribeToMessages,
} from '../../../api/messages';

const Card = ({ children, className = '' }) => (
  <section className={`rounded-2xl border-2 border-blue-100 bg-white p-5 ${className}`}>{children}</section>
);

function formatTimeLabel(value) {
  if (!value) return 'No messages yet';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatBubbleTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function MessagesTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [threads, setThreads] = useState([]);
  const [selectedThreadKey, setSelectedThreadKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [topicId, setTopicId] = useState(MESSAGE_TOPIC_OPTIONS[0].id);
  const [isSending, setIsSending] = useState(false);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.threadKey === selectedThreadKey) || null,
    [threads, selectedThreadKey],
  );

  const loadThreads = async ({ keepSelection = true } = {}) => {
    try {
      const payload = await fetchStudentMessageThreads();
      setThreads(payload.threads || []);

      if (!keepSelection || !selectedThreadKey) {
        const firstThread = payload.threads?.[0];
        setSelectedThreadKey(firstThread?.threadKey || '');
      } else {
        const stillExists = (payload.threads || []).some((thread) => thread.threadKey === selectedThreadKey);
        if (!stillExists) {
          setSelectedThreadKey(payload.threads?.[0]?.threadKey || '');
        }
      }
    } catch (loadError) {
      setError(loadError.message || 'Failed to load conversations.');
    }
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const payload = await fetchStudentMessageThreads();
        if (!active) return;
        const loadedThreads = payload.threads || [];
        setThreads(loadedThreads);
        setSelectedThreadKey(loadedThreads[0]?.threadKey || '');
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || 'Failed to load conversations.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedThread?.conversationId) {
      setMessages([]);
      return;
    }

    let active = true;
    const run = async () => {
      try {
        await markConversationAsRead(selectedThread.conversationId);
        const rows = await fetchConversationMessages(selectedThread.conversationId);
        if (!active) return;
        setMessages(rows);
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || 'Failed to load messages.');
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [selectedThread?.conversationId]);

  useEffect(() => {
    const unsub = subscribeToMessages(() => {
      loadThreads();
      if (selectedThread?.conversationId) {
        fetchConversationMessages(selectedThread.conversationId)
          .then((rows) => setMessages(rows))
          .catch(() => {});
      }
    });

    const intervalId = window.setInterval(() => {
      loadThreads();
    }, 15000);

    return () => {
      unsub();
      window.clearInterval(intervalId);
    };
  }, [selectedThread?.conversationId, selectedThreadKey]);

  const onSend = async () => {
    if (!selectedThread || !draft.trim() || isSending) return;

    setIsSending(true);
    setError('');
    try {
      const result = await sendMessageForThread({
        conversationId: selectedThread.conversationId,
        thread: selectedThread,
        body: draft.trim(),
        topicId,
      });

      setDraft('');
      const newThreadKey = `${selectedThread.classId}::${selectedThread.instructorId}`;
      setSelectedThreadKey(newThreadKey);
      await loadThreads({ keepSelection: true });

      if (result.conversationId) {
        const rows = await fetchConversationMessages(result.conversationId);
        setMessages(rows);
      }
    } catch (sendError) {
      setError(sendError.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <p className="text-sm font-semibold text-slate-500">Loading messages...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <Card className="border-orange-200 bg-orange-50">
          <p className="text-sm font-semibold text-orange-700">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit p-0 overflow-hidden">
          <div className="border-b border-blue-100 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-blue-900">Conversations</h2>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {threads.length === 0 ? (
              <p className="px-4 py-5 text-sm font-semibold text-slate-500">No instructor threads available yet.</p>
            ) : (
              threads.map((thread) => {
                const active = selectedThreadKey === thread.threadKey;
                return (
                  <button
                    key={thread.threadKey}
                    type="button"
                    onClick={() => {
                      setSelectedThreadKey(thread.threadKey);
                      if (thread.topicId) setTopicId(thread.topicId);
                    }}
                    className={`w-full border-b border-blue-50 px-4 py-3 text-left transition ${
                      active ? 'bg-blue-100/70' : 'hover:bg-blue-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-blue-900">{thread.instructorName}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{thread.className}</p>
                      </div>
                      {thread.unreadCount > 0 ? (
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-600">
                      {thread.lastMessage || 'Start a conversation with your instructor.'}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          thread.hasReply ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {thread.hasReply ? 'Replied' : 'Awaiting Reply'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{formatTimeLabel(thread.lastMessageAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="flex min-h-[560px] flex-col p-0 overflow-hidden">
          <div className="border-b border-blue-100 px-5 py-4">
            <h2 className="text-base font-black uppercase tracking-[0.16em] text-blue-900">
              Conversation with {selectedThread?.instructorName || 'Instructor'}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {selectedThread ? `${selectedThread.className} • Topic: ${selectedThread.topicTitle}` : 'Select a conversation to begin.'}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-blue-50/30 px-4 py-4">
            {!selectedThread ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500">
                <MessageSquare className="h-7 w-7" />
                <p className="mt-2 text-sm font-semibold">Choose an instructor conversation.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500">
                <MessageSquare className="h-7 w-7" />
                <p className="mt-2 text-sm font-semibold">No messages yet. Ask your instructor anything about your lesson.</p>
              </div>
            ) : (
              messages.map((message) => {
                const mine = message.senderRole === 'student';
                return (
                  <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] rounded-2xl px-3 py-2 ${mine ? 'bg-blue-700 text-white' : 'bg-white text-blue-900 border border-blue-100'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${mine ? 'text-blue-100' : 'text-slate-500'}`}>
                        {message.senderName}
                      </p>
                      {message.topicTitle ? (
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${mine ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
                          {message.topicTitle}
                        </span>
                      ) : null}
                      <p className="mt-1 text-sm font-semibold leading-5">{message.messageBody}</p>
                      <div className={`mt-1 flex items-center gap-1 text-[10px] ${mine ? 'text-blue-100' : 'text-slate-500'}`}>
                        <Clock3 className="h-3 w-3" />
                        <span>{formatBubbleTime(message.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-blue-100 bg-white px-4 py-3">
            <div className="grid gap-2 md:grid-cols-[180px_1fr_auto]">
              <select
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
                className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-600 outline-none focus:border-blue-300"
              >
                {MESSAGE_TOPIC_OPTIONS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message..."
                className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    onSend();
                  }
                }}
              />
              <button
                type="button"
                onClick={onSend}
                disabled={isSending || !selectedThread || !draft.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
