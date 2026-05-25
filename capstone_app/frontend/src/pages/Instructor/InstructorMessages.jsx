import { useEffect, useMemo, useState } from 'react';
import { Clock3, MessageSquare, Search, Send, User } from 'lucide-react';
import {
  MESSAGE_TOPIC_OPTIONS,
  fetchConversationMessages,
  fetchInstructorMessageThreads,
  markConversationAsRead,
  sendMessageForThread,
  subscribeToMessages,
} from '../../api/messages';

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

function ProgressRow({ label, value }) {
  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-blue-900">{value || 'Not yet available'}</p>
    </div>
  );
}

export default function InstructorMessages() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedThreadKey, setSelectedThreadKey] = useState('');
  const [draft, setDraft] = useState('');
  const [topicId, setTopicId] = useState(MESSAGE_TOPIC_OPTIONS[0].id);
  const [isSending, setIsSending] = useState(false);
  const [classFilter, setClassFilter] = useState('All Classes');
  const [topicFilter, setTopicFilter] = useState('All Topics');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [classOptions, setClassOptions] = useState(['All Classes']);
  const [topicOptions, setTopicOptions] = useState(['All Topics']);
  const [statusOptions, setStatusOptions] = useState(['All', 'Unread', 'Replied']);
  const [showProgress, setShowProgress] = useState(false);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.threadKey === selectedThreadKey) || null,
    [threads, selectedThreadKey],
  );

  const loadThreads = async ({ keepSelection = true } = {}) => {
    try {
      const payload = await fetchInstructorMessageThreads({
        classFilter,
        topicFilter,
        statusFilter,
        search: searchTerm,
      });

      const loadedThreads = payload.threads || [];
      setThreads(loadedThreads);
      setClassOptions(payload.classFilterOptions || ['All Classes']);
      setTopicOptions(payload.topicFilterOptions || ['All Topics']);
      setStatusOptions(payload.statusFilterOptions || ['All', 'Unread', 'Replied']);

      if (!keepSelection || !selectedThreadKey) {
        setSelectedThreadKey(loadedThreads[0]?.threadKey || '');
        return;
      }

      const exists = loadedThreads.some((thread) => thread.threadKey === selectedThreadKey);
      if (!exists) {
        setSelectedThreadKey(loadedThreads[0]?.threadKey || '');
      }
    } catch (loadError) {
      setError(loadError.message || 'Failed to load student conversations.');
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const payload = await fetchInstructorMessageThreads({
          classFilter: 'All Classes',
          topicFilter: 'All Topics',
          statusFilter: 'All',
          search: '',
        });

        if (!active) return;
        const loadedThreads = payload.threads || [];
        setThreads(loadedThreads);
        setClassOptions(payload.classFilterOptions || ['All Classes']);
        setTopicOptions(payload.topicFilterOptions || ['All Topics']);
        setStatusOptions(payload.statusFilterOptions || ['All', 'Unread', 'Replied']);
        setSelectedThreadKey(loadedThreads[0]?.threadKey || '');
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || 'Failed to load student conversations.');
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    loadThreads();
  }, [classFilter, topicFilter, statusFilter, searchTerm]);

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
        setError(loadError.message || 'Failed to load conversation messages.');
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
  }, [selectedThread?.conversationId, classFilter, topicFilter, statusFilter, searchTerm]);

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
      const newThreadKey = `${selectedThread.classId}::${selectedThread.studentId}`;
      setSelectedThreadKey(newThreadKey);
      await loadThreads({ keepSelection: true });

      if (result.conversationId) {
        const rows = await fetchConversationMessages(result.conversationId);
        setMessages(rows);
      }
    } catch (sendError) {
      setError(sendError.message || 'Failed to send reply.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <p className="text-sm font-semibold text-slate-500">Loading student messages...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-black text-blue-900 tracking-tight">Instructor Messages</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">Reply to student concerns by class, topic, and unread status.</p>
      </div>

      {error ? (
        <Card className="border-orange-200 bg-orange-50">
          <p className="text-sm font-semibold text-orange-700">{error}</p>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[350px_1fr]">
        <Card className="h-fit p-0 overflow-hidden">
          <div className="border-b border-blue-100 px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-blue-900">Student Messages</h2>
          </div>

          <div className="grid gap-2 border-b border-blue-100 p-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filter by Class</label>
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700 outline-none focus:border-blue-300"
            >
              {classOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filter by Topic</label>
            <select
              value={topicFilter}
              onChange={(event) => setTopicFilter(event.target.value)}
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700 outline-none focus:border-blue-300"
            >
              {topicOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700 outline-none focus:border-blue-300"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Search Student</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search student name..."
                className="w-full rounded-xl border border-blue-100 bg-blue-50 py-2 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
              />
            </div>
          </div>

          <div className="max-h-[530px] overflow-y-auto">
            {threads.length === 0 ? (
              <p className="px-4 py-5 text-sm font-semibold text-slate-500">No student conversations for this filter.</p>
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
                        <p className="text-sm font-black text-blue-900">{thread.studentName}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                            {thread.className}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                            {thread.topicTitle}
                          </span>
                        </div>
                      </div>
                      {thread.unreadCount > 0 ? (
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white">
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-600">{thread.lastMessage}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-slate-500">{formatTimeLabel(thread.lastMessageAt)}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          thread.status === 'Unread'
                            ? 'bg-orange-100 text-orange-700'
                            : thread.status === 'Replied'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {thread.status || 'All'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="flex min-h-[620px] flex-col p-0 overflow-hidden">
          <div className="border-b border-blue-100 px-5 py-4">
            <h2 className="text-base font-black uppercase tracking-[0.16em] text-blue-900">
              Conversation with {selectedThread?.studentName || 'Student'}
            </h2>
            {selectedThread ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                  {selectedThread.className}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  {selectedThread.topicTitle}
                </span>
                <button
                  type="button"
                  onClick={() => setShowProgress(true)}
                  className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50"
                >
                  View Progress
                </button>
              </div>
            ) : null}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-blue-50/30 px-4 py-4">
            {!selectedThread ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500">
                <User className="h-7 w-7" />
                <p className="mt-2 text-sm font-semibold">Select a student conversation.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500">
                <MessageSquare className="h-7 w-7" />
                <p className="mt-2 text-sm font-semibold">No messages yet in this conversation.</p>
              </div>
            ) : (
              messages.map((message) => {
                const mine = message.senderRole === 'instructor';
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
            <div className="grid gap-2 md:grid-cols-[190px_1fr_auto]">
              <select
                value={topicId}
                onChange={(event) => setTopicId(event.target.value)}
                className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700 outline-none focus:border-blue-300"
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
                placeholder="Type your reply..."
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
                Send Reply
              </button>
            </div>
          </div>
        </Card>
      </div>

      {showProgress && selectedThread ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border-2 border-blue-100 bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-blue-900">{selectedThread.studentName} Progress</h3>
                <p className="text-sm font-medium text-slate-500">
                  {selectedThread.className} • Related topic: {selectedThread.topicTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProgress(false)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ProgressRow label="Pre-Test Score" value={selectedThread.studentProgress?.preTestScore} />
              <ProgressRow label="Post-Test Score" value={selectedThread.studentProgress?.postTestScore} />
              <ProgressRow label="Quiz Score" value={selectedThread.studentProgress?.quizScore} />
              <ProgressRow label="Activity Score" value={selectedThread.studentProgress?.activityScore} />
              <ProgressRow label="Mini-Game Score" value={selectedThread.studentProgress?.miniGameScore} />
              <ProgressRow label="Current Topic Progress" value={selectedThread.studentProgress?.currentTopicProgress} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
