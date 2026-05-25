import { supabase } from '../supabase';
import {
  DEMO_INSTRUCTOR_LOGIN,
  DEMO_STUDENT_LOGIN,
  getDemoAuthSession,
  getLocalUsers,
} from '../demoAuth';

const LOCAL_MESSAGES_STORAGE_KEY = 'balangkas_messages_v1';
const LOCAL_MESSAGES_EVENT = 'balangkas:messages-updated';
const LOCAL_INSTRUCTOR_CLASSES_KEY = 'balangkas_instructor_classes_v1';
const LOCAL_CLASS_ENROLLMENTS_KEY = 'balangkas_student_class_enrollments_v1';

export const MESSAGE_TOPIC_OPTIONS = [
  { id: 'topic-introduction', title: 'Introduction' },
  { id: 'topic-recursion', title: 'Recursion' },
  { id: 'topic-stack', title: 'Stack' },
  { id: 'topic-queue', title: 'Queue' },
  { id: 'topic-linked-list', title: 'Linked List' },
];

const MESSAGE_TOPIC_LOOKUP = MESSAGE_TOPIC_OPTIONS.reduce((acc, topic) => {
  acc[topic.id] = topic.title;
  return acc;
}, {});

const MESSAGE_STATUS_OPTIONS = ['All', 'Unread', 'Replied'];

let supabaseMessagingAvailable = null;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeEmail(value) {
  return normalizeText(value);
}

function readStorageJson(key, fallback) {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorageJson(key, value) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function dispatchMessagesUpdate() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(LOCAL_MESSAGES_EVENT));
}

function buildLocalUserDirectory(store) {
  const map = new Map();
  const localUsers = getLocalUsers();
  const builtinUsers = [
    {
      id: DEMO_STUDENT_LOGIN.email,
      full_name: DEMO_STUDENT_LOGIN.profile?.full_name || 'Student',
      role: 'student',
    },
    {
      id: DEMO_INSTRUCTOR_LOGIN.email,
      full_name: DEMO_INSTRUCTOR_LOGIN.profile?.full_name || 'Instructor',
      role: 'instructor',
    },
  ];

  [...(store?.users || []), ...builtinUsers, ...localUsers].forEach((entry) => {
    if (!entry) return;
    const entryId = entry.id || entry.email;
    if (!entryId) return;
    map.set(entryId, {
      id: entryId,
      full_name: entry.full_name || entry.profile?.full_name || entry.name || entry.email || 'User',
      role: entry.role || entry.profile?.role || 'student',
    });
  });

  return map;
}

function withName(userMap, userId, fallbackName = 'User') {
  const user = userMap.get(userId);
  return user?.full_name || fallbackName;
}

function formatClassName(classItem) {
  if (!classItem) return 'Unknown Class';
  if (classItem.class_name) return classItem.class_name;

  const section = String(classItem.section || '').trim();
  if (section) return `Section ${section}`;

  return classItem.name || classItem.title || 'Class';
}

function seedLocalStore() {
  const now = Date.now();
  const iso = (offsetMinutes) => new Date(now - offsetMinutes * 60 * 1000).toISOString();

  return {
    version: 1,
    users: [
      { id: DEMO_STUDENT_LOGIN.email, full_name: 'Lee Valero', role: 'student' },
      { id: DEMO_INSTRUCTOR_LOGIN.email, full_name: 'Mr. Dela Cruz', role: 'instructor' },
      { id: 'student-ana-reyes', full_name: 'Ana Reyes', role: 'student' },
      { id: 'student-mark-cruz', full_name: 'Mark Cruz', role: 'student' },
      { id: 'instructor-ms-reyes', full_name: 'Ms. Reyes', role: 'instructor' },
    ],
    classes: [
      { id: 'CLS-1', class_name: 'Section A-12', instructor_id: DEMO_INSTRUCTOR_LOGIN.email, instructor_name: 'Mr. Dela Cruz' },
      { id: 'CLS-2', class_name: 'Section B-09', instructor_id: 'instructor-ms-reyes', instructor_name: 'Ms. Reyes' },
      { id: 'CLS-3', class_name: 'Section C-03', instructor_id: DEMO_INSTRUCTOR_LOGIN.email, instructor_name: 'Mr. Dela Cruz' },
    ],
    class_members: [
      { id: 'cm-1', class_id: 'CLS-1', student_id: DEMO_STUDENT_LOGIN.email },
      { id: 'cm-2', class_id: 'CLS-1', student_id: 'student-ana-reyes' },
      { id: 'cm-3', class_id: 'CLS-2', student_id: 'student-mark-cruz' },
    ],
    conversations: [
      {
        id: 'conv-1',
        student_id: DEMO_STUDENT_LOGIN.email,
        instructor_id: DEMO_INSTRUCTOR_LOGIN.email,
        class_id: 'CLS-1',
        topic_id: 'topic-recursion',
        topic_title: 'Recursion',
        last_message: 'Sir, I still do not understand the base case in recursion.',
        last_message_at: iso(10),
        updated_at: iso(10),
        student_progress: {
          preTestScore: '4/10',
          postTestScore: '7/10',
          quizScore: '8/10',
          activityScore: '15/20',
          miniGameScore: '820 pts',
          currentTopicProgress: 'Recursion - 62%',
        },
      },
      {
        id: 'conv-2',
        student_id: 'student-ana-reyes',
        instructor_id: DEMO_INSTRUCTOR_LOGIN.email,
        class_id: 'CLS-1',
        topic_id: 'topic-stack',
        topic_title: 'Stack',
        last_message: 'Why did I fail the stack mini-game?',
        last_message_at: iso(25),
        updated_at: iso(25),
        student_progress: {
          preTestScore: '5/10',
          postTestScore: '6/10',
          quizScore: '6/10',
          activityScore: '12/20',
          miniGameScore: '540 pts',
          currentTopicProgress: 'Stack - 48%',
        },
      },
      {
        id: 'conv-3',
        student_id: 'student-mark-cruz',
        instructor_id: 'instructor-ms-reyes',
        class_id: 'CLS-2',
        topic_id: 'topic-introduction',
        topic_title: 'Introduction',
        last_message: 'Thank you, ma’am.',
        last_message_at: iso(60),
        updated_at: iso(60),
        student_progress: {
          preTestScore: '8/10',
          postTestScore: '9/10',
          quizScore: '9/10',
          activityScore: '18/20',
          miniGameScore: '980 pts',
          currentTopicProgress: 'Introduction - 96%',
        },
      },
    ],
    messages: [
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: DEMO_STUDENT_LOGIN.email,
        receiver_id: DEMO_INSTRUCTOR_LOGIN.email,
        sender_role: 'student',
        receiver_role: 'instructor',
        class_id: 'CLS-1',
        topic_id: 'topic-recursion',
        topic_title: 'Recursion',
        message_body: 'Sir, I do not understand the base case in recursion.',
        is_read: true,
        created_at: iso(35),
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        sender_id: DEMO_INSTRUCTOR_LOGIN.email,
        receiver_id: DEMO_STUDENT_LOGIN.email,
        sender_role: 'instructor',
        receiver_role: 'student',
        class_id: 'CLS-1',
        topic_id: 'topic-recursion',
        topic_title: 'Recursion',
        message_body: 'The base case is the stopping condition that prevents infinite calls.',
        is_read: true,
        created_at: iso(30),
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        sender_id: DEMO_STUDENT_LOGIN.email,
        receiver_id: DEMO_INSTRUCTOR_LOGIN.email,
        sender_role: 'student',
        receiver_role: 'instructor',
        class_id: 'CLS-1',
        topic_id: 'topic-recursion',
        topic_title: 'Recursion',
        message_body: 'Sir, I still do not understand the base case in recursion.',
        is_read: false,
        created_at: iso(10),
      },
      {
        id: 'msg-4',
        conversation_id: 'conv-2',
        sender_id: 'student-ana-reyes',
        receiver_id: DEMO_INSTRUCTOR_LOGIN.email,
        sender_role: 'student',
        receiver_role: 'instructor',
        class_id: 'CLS-1',
        topic_id: 'topic-stack',
        topic_title: 'Stack',
        message_body: 'Why did I fail the stack mini-game?',
        is_read: false,
        created_at: iso(25),
      },
      {
        id: 'msg-5',
        conversation_id: 'conv-3',
        sender_id: 'student-mark-cruz',
        receiver_id: 'instructor-ms-reyes',
        sender_role: 'student',
        receiver_role: 'instructor',
        class_id: 'CLS-2',
        topic_id: 'topic-introduction',
        topic_title: 'Introduction',
        message_body: 'Thank you, ma’am.',
        is_read: true,
        created_at: iso(60),
      },
    ],
    counters: {
      conversation: 3,
      message: 5,
    },
  };
}

function mergeLocalClassData(store) {
  const next = {
    ...store,
    classes: Array.isArray(store.classes) ? [...store.classes] : [],
    class_members: Array.isArray(store.class_members) ? [...store.class_members] : [],
  };

  const classById = new Map(next.classes.map((item) => [item.id, item]));
  const localClasses = readStorageJson(LOCAL_INSTRUCTOR_CLASSES_KEY, []);
  const classMembers = readStorageJson(LOCAL_CLASS_ENROLLMENTS_KEY, []);

  if (Array.isArray(localClasses)) {
    localClasses.forEach((item) => {
      if (!item?.id) return;
      const merged = {
        id: item.id,
        class_name: item.class_name || formatClassName(item),
        instructor_id: item.instructor_id || DEMO_INSTRUCTOR_LOGIN.email,
        instructor_name: item.instructor_name || 'Instructor',
      };
      classById.set(item.id, {
        ...classById.get(item.id),
        ...merged,
      });
    });
  }

  next.classes = Array.from(classById.values());

  if (Array.isArray(classMembers)) {
    const memberKeySet = new Set(next.class_members.map((entry) => `${entry.class_id}::${entry.student_id}`));
    classMembers.forEach((entry) => {
      if (!entry?.class_id || !entry?.student_id) return;
      const key = `${entry.class_id}::${entry.student_id}`;
      if (memberKeySet.has(key)) return;
      memberKeySet.add(key);
      next.class_members.push({
        id: entry.id || `cm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        class_id: entry.class_id,
        student_id: entry.student_id,
      });
    });
  }

  return next;
}

function ensureLocalStore() {
  const raw = readStorageJson(LOCAL_MESSAGES_STORAGE_KEY, null);
  const base =
    raw &&
    typeof raw === 'object' &&
    Array.isArray(raw.conversations) &&
    Array.isArray(raw.messages) &&
    Array.isArray(raw.classes) &&
    Array.isArray(raw.class_members)
      ? raw
      : seedLocalStore();

  const merged = mergeLocalClassData(base);
  if (!raw) {
    writeStorageJson(LOCAL_MESSAGES_STORAGE_KEY, merged);
  }
  return merged;
}

function saveLocalStore(nextStore) {
  writeStorageJson(LOCAL_MESSAGES_STORAGE_KEY, nextStore);
  dispatchMessagesUpdate();
}

function classIdSetForStudent(store, identityKeys) {
  return new Set(
    (store.class_members || [])
      .filter((entry) => identityKeys.has(entry.student_id))
      .map((entry) => entry.class_id),
  );
}

function classIdSetForInstructor(store, identityKeys) {
  return new Set(
    (store.classes || [])
      .filter((entry) => !entry.instructor_id || identityKeys.has(entry.instructor_id))
      .map((entry) => entry.id),
  );
}

function resolveTopicTitle(topicId) {
  return MESSAGE_TOPIC_LOOKUP[topicId] || 'General';
}

async function resolveIdentity(roleHint) {
  const demo = getDemoAuthSession();
  const localId = normalizeEmail(demo?.email);
  const localRole = demo?.profile?.role || roleHint || 'student';
  const localName = demo?.profile?.full_name || 'User';

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (!error && user?.id) {
      return {
        id: user.id,
        localId,
        fullName: user.user_metadata?.full_name || localName,
        role: user.user_metadata?.role || localRole,
        mode: 'supabase',
      };
    }
  } catch {
    // Fall back to local identity below.
  }

  return {
    id: localId || 'local-user',
    localId,
    fullName: localName,
    role: localRole,
    mode: 'local',
  };
}

async function detectSupabaseMessagingAvailability() {
  if (supabaseMessagingAvailable !== null) {
    return supabaseMessagingAvailable;
  }

  try {
    const [messagesProbe, conversationsProbe] = await Promise.all([
      supabase.from('messages').select('id').limit(1),
      supabase.from('conversations').select('id').limit(1),
    ]);

    supabaseMessagingAvailable = !messagesProbe.error && !conversationsProbe.error;
  } catch {
    supabaseMessagingAvailable = false;
  }

  return supabaseMessagingAvailable;
}

function toIdentityKeys(identity) {
  const keys = new Set([identity.id, identity.localId].filter(Boolean));
  return keys;
}

function sortByLastMessageDesc(rows) {
  return rows.slice().sort((a, b) => {
    const aTime = new Date(a.lastMessageAt || 0).getTime();
    const bTime = new Date(b.lastMessageAt || 0).getTime();
    return bTime - aTime;
  });
}

function messageStatusForInstructor(thread) {
  if ((thread.unreadCount || 0) > 0) return 'Unread';
  return thread.lastSenderRole === 'instructor' ? 'Replied' : 'All';
}

function buildLocalStudentThreads(store, identity) {
  const identityKeys = toIdentityKeys(identity);
  const users = buildLocalUserDirectory(store);
  const classesById = new Map((store.classes || []).map((item) => [item.id, item]));
  const allowedClassIds = classIdSetForStudent(store, identityKeys);

  const studentConversations = (store.conversations || []).filter((conversation) => {
    return identityKeys.has(conversation.student_id) && allowedClassIds.has(conversation.class_id);
  });

  const conversationByPair = new Map();
  studentConversations.forEach((conversation) => {
    const key = `${conversation.class_id}::${conversation.instructor_id}`;
    const current = conversationByPair.get(key);
    if (!current) {
      conversationByPair.set(key, conversation);
      return;
    }

    const currentTime = new Date(current.updated_at || current.last_message_at || 0).getTime();
    const nextTime = new Date(conversation.updated_at || conversation.last_message_at || 0).getTime();
    if (nextTime >= currentTime) {
      conversationByPair.set(key, conversation);
    }
  });

  const connectionRows = [];
  allowedClassIds.forEach((classId) => {
    const classItem = classesById.get(classId);
    if (!classItem) return;
    const instructorId = classItem.instructor_id || DEMO_INSTRUCTOR_LOGIN.email;
    const instructorName = classItem.instructor_name || withName(users, instructorId, 'Instructor');

    connectionRows.push({
      classId,
      className: formatClassName(classItem),
      instructorId,
      instructorName,
    });
  });

  const seenKeys = new Set(connectionRows.map((entry) => `${entry.classId}::${entry.instructorId}`));
  studentConversations.forEach((conversation) => {
    const key = `${conversation.class_id}::${conversation.instructor_id}`;
    if (seenKeys.has(key)) return;
    seenKeys.add(key);

    const classItem = classesById.get(conversation.class_id);
    connectionRows.push({
      classId: conversation.class_id,
      className: formatClassName(classItem),
      instructorId: conversation.instructor_id,
      instructorName: withName(users, conversation.instructor_id, 'Instructor'),
    });
  });

  const rows = connectionRows.map((connection) => {
    const threadKey = `${connection.classId}::${connection.instructorId}`;
    const conversation = conversationByPair.get(threadKey);
    const messages = conversation
      ? (store.messages || []).filter((item) => item.conversation_id === conversation.id)
      : [];
    const unreadCount = messages.filter((item) => identityKeys.has(item.receiver_id) && !item.is_read).length;
    const hasReply = messages.some((item) => item.sender_role === 'instructor');
    const lastMessage = conversation?.last_message || '';
    const lastMessageAt = conversation?.last_message_at || null;
    const lastSenderRole = messages.length ? messages[messages.length - 1].sender_role : null;

    return {
      threadKey,
      conversationId: conversation?.id || null,
      classId: connection.classId,
      className: connection.className,
      instructorId: connection.instructorId,
      instructorName: connection.instructorName,
      studentId: identity.localId || identity.id,
      studentName: identity.fullName,
      topicId: conversation?.topic_id || 'topic-introduction',
      topicTitle: conversation?.topic_title || resolveTopicTitle(conversation?.topic_id || 'topic-introduction'),
      lastMessage,
      lastMessageAt,
      unreadCount,
      hasReply,
      lastSenderRole,
      studentProgress: conversation?.student_progress || null,
    };
  });

  return sortByLastMessageDesc(rows);
}

function buildLocalInstructorThreads(store, identity, filters) {
  const identityKeys = toIdentityKeys(identity);
  const users = buildLocalUserDirectory(store);
  const classesById = new Map((store.classes || []).map((item) => [item.id, item]));
  const handledClassIds = classIdSetForInstructor(store, identityKeys);

  const rows = (store.conversations || [])
    .filter((conversation) => identityKeys.has(conversation.instructor_id) && handledClassIds.has(conversation.class_id))
    .map((conversation) => {
      const messages = (store.messages || []).filter((item) => item.conversation_id === conversation.id);
      const unreadCount = messages.filter((item) => identityKeys.has(item.receiver_id) && !item.is_read).length;
      const classItem = classesById.get(conversation.class_id);
      const className = formatClassName(classItem);
      const topicTitle = conversation.topic_title || resolveTopicTitle(conversation.topic_id);
      const lastSenderRole = messages.length ? messages[messages.length - 1].sender_role : null;
      const status = messageStatusForInstructor({
        unreadCount,
        lastSenderRole,
      });

      return {
        threadKey: `${conversation.class_id}::${conversation.student_id}`,
        conversationId: conversation.id,
        classId: conversation.class_id,
        className,
        studentId: conversation.student_id,
        studentName: withName(users, conversation.student_id, 'Student'),
        instructorId: conversation.instructor_id,
        instructorName: withName(users, conversation.instructor_id, 'Instructor'),
        topicId: conversation.topic_id || 'topic-introduction',
        topicTitle,
        lastMessage: conversation.last_message || '',
        lastMessageAt: conversation.last_message_at || null,
        unreadCount,
        lastSenderRole,
        status,
        studentProgress: conversation.student_progress || null,
      };
    });

  const filteredRows = rows.filter((row) => {
    const classMatch = !filters.classFilter || filters.classFilter === 'All Classes' || row.className === filters.classFilter;
    const topicMatch = !filters.topicFilter || filters.topicFilter === 'All Topics' || row.topicTitle === filters.topicFilter;
    const statusMatch = !filters.statusFilter || filters.statusFilter === 'All' || row.status === filters.statusFilter;
    const searchMatch = !filters.search || normalizeText(row.studentName).includes(normalizeText(filters.search));
    return classMatch && topicMatch && statusMatch && searchMatch;
  });

  return sortByLastMessageDesc(filteredRows);
}

function buildLocalInstructorClassOptions(store, identity) {
  const identityKeys = toIdentityKeys(identity);
  const handledClassIds = classIdSetForInstructor(store, identityKeys);
  const classesById = new Map((store.classes || []).map((item) => [item.id, item]));
  const names = Array.from(handledClassIds)
    .map((classId) => formatClassName(classesById.get(classId)))
    .filter(Boolean);

  return ['All Classes', ...Array.from(new Set(names))];
}

function buildInstructorTopicOptions(threads) {
  const topicSet = new Set(MESSAGE_TOPIC_OPTIONS.map((topic) => topic.title));
  (threads || []).forEach((thread) => {
    if (thread.topicTitle) topicSet.add(thread.topicTitle);
  });
  return ['All Topics', ...Array.from(topicSet)];
}

function getConversationMessagesFromStore(store, conversationId, identity) {
  if (!conversationId) return [];
  const identityKeys = toIdentityKeys(identity);
  const users = buildLocalUserDirectory(store);
  const conversation = (store.conversations || []).find((item) => item.id === conversationId);
  if (!conversation) return [];

  const isParticipant =
    identityKeys.has(conversation.student_id) || identityKeys.has(conversation.instructor_id) || identity.role === 'admin';
  if (!isParticipant) {
    throw new Error('You do not have access to this conversation.');
  }

  return (store.messages || [])
    .filter((item) => item.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    .map((item) => ({
      id: item.id,
      conversationId: item.conversation_id,
      senderId: item.sender_id,
      receiverId: item.receiver_id,
      senderRole: item.sender_role,
      receiverRole: item.receiver_role,
      senderName: withName(users, item.sender_id, 'User'),
      messageBody: item.message_body,
      topicId: item.topic_id,
      topicTitle: item.topic_title || resolveTopicTitle(item.topic_id),
      isRead: Boolean(item.is_read),
      createdAt: item.created_at,
      classId: item.class_id,
    }));
}

function markConversationReadInStore(store, conversationId, identity) {
  const identityKeys = toIdentityKeys(identity);
  let touched = false;
  const nextMessages = (store.messages || []).map((item) => {
    if (item.conversation_id !== conversationId) return item;
    if (!identityKeys.has(item.receiver_id)) return item;
    if (item.is_read) return item;
    touched = true;
    return {
      ...item,
      is_read: true,
    };
  });

  if (!touched) return store;

  const nextStore = {
    ...store,
    messages: nextMessages,
  };
  saveLocalStore(nextStore);
  return nextStore;
}

async function sendLocalMessage(store, identity, payload) {
  const trimmedBody = String(payload.body || '').trim();
  if (!trimmedBody) {
    throw new Error('Message cannot be empty.');
  }

  const topicId = payload.topicId || 'topic-introduction';
  const topicTitle = resolveTopicTitle(topicId);
  const nowIso = new Date().toISOString();
  const identityKeys = toIdentityKeys(identity);
  const classesById = new Map((store.classes || []).map((entry) => [entry.id, entry]));
  const users = buildLocalUserDirectory(store);
  const nextCounters = {
    conversation: Number(store.counters?.conversation || 0),
    message: Number(store.counters?.message || 0),
  };

  let conversation = payload.conversationId
    ? (store.conversations || []).find((item) => item.id === payload.conversationId)
    : null;
  let classId = payload.classId || conversation?.class_id;
  let studentId = conversation?.student_id || payload.studentId;
  let instructorId = conversation?.instructor_id || payload.instructorId;

  if (identity.role === 'student') {
    const studentIdentityId = identity.localId || identity.id;
    studentId = studentIdentityId;
    const allowedClassIds = classIdSetForStudent(store, identityKeys);
    if (!classId || !allowedClassIds.has(classId)) {
      throw new Error('You can only message instructors from your enrolled class.');
    }

    const classItem = classesById.get(classId);
    if (!classItem) {
      throw new Error('Class not found for this message thread.');
    }

    instructorId = instructorId || classItem.instructor_id || DEMO_INSTRUCTOR_LOGIN.email;
    if (classItem.instructor_id && classItem.instructor_id !== instructorId) {
      throw new Error('You can only message your assigned class instructor.');
    }
  } else if (identity.role === 'instructor') {
    if (!classId || !studentId) {
      throw new Error('Missing class or student information for this reply.');
    }

    const handledClassIds = classIdSetForInstructor(store, identityKeys);
    if (!handledClassIds.has(classId)) {
      throw new Error('You can only message students from your handled classes.');
    }

    instructorId = identity.localId || identity.id;
  } else {
    throw new Error('Only students and instructors can send messages.');
  }

  if (!conversation) {
    nextCounters.conversation += 1;
    conversation = {
      id: `conv-${nextCounters.conversation}`,
      student_id: studentId,
      instructor_id: instructorId,
      class_id: classId,
      topic_id: topicId,
      topic_title: topicTitle,
      last_message: '',
      last_message_at: nowIso,
      updated_at: nowIso,
      student_progress: payload.studentProgress || null,
    };
  }

  const senderId = identity.role === 'student' ? studentId : instructorId;
  const receiverId = identity.role === 'student' ? instructorId : studentId;

  nextCounters.message += 1;
  const nextMessage = {
    id: `msg-${nextCounters.message}`,
    conversation_id: conversation.id,
    sender_id: senderId,
    receiver_id: receiverId,
    sender_role: identity.role,
    receiver_role: identity.role === 'student' ? 'instructor' : 'student',
    class_id: classId,
    topic_id: topicId,
    topic_title: topicTitle,
    message_body: trimmedBody,
    is_read: false,
    created_at: nowIso,
  };

  const nextConversationsWithoutCurrent = (store.conversations || []).filter((item) => item.id !== conversation.id);
  const nextConversation = {
    ...conversation,
    topic_id: topicId,
    topic_title: topicTitle,
    last_message: trimmedBody,
    last_message_at: nowIso,
    updated_at: nowIso,
    student_id: studentId,
    instructor_id: instructorId,
    class_id: classId,
    student_name: withName(users, studentId, identity.role === 'student' ? identity.fullName : 'Student'),
    instructor_name: withName(users, instructorId, identity.role === 'instructor' ? identity.fullName : 'Instructor'),
  };

  const nextStore = {
    ...store,
    conversations: [nextConversation, ...nextConversationsWithoutCurrent],
    messages: [...(store.messages || []), nextMessage],
    counters: nextCounters,
  };

  saveLocalStore(nextStore);

  return {
    conversationId: nextConversation.id,
    messageId: nextMessage.id,
  };
}

async function fetchSupabaseThreads(identity, filters) {
  const classRows = identity.role === 'student'
    ? await fetchSupabaseStudentClassLinks(identity.id)
    : await fetchSupabaseInstructorClassLinks(identity.id);
  const allowedClassIds = new Set(classRows.map((row) => row.classId));

  const { data: conversations, error: conversationsError } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (conversationsError) {
    throw new Error(conversationsError.message || 'Failed to load conversations.');
  }

  const filteredConversations = (conversations || []).filter((conversation) => {
    if (identity.role === 'student' && conversation.student_id !== identity.id) return false;
    if (identity.role === 'instructor' && conversation.instructor_id !== identity.id) return false;
    if (!allowedClassIds.has(conversation.class_id)) return false;
    return true;
  });

  const conversationIds = filteredConversations.map((entry) => entry.id);
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', conversationIds.length ? conversationIds : ['__none__']);

  if (messagesError) {
    throw new Error(messagesError.message || 'Failed to load messages.');
  }

  const profiles = await fetchSupabaseProfilesByIds([
    ...new Set(
      filteredConversations.flatMap((entry) => [entry.student_id, entry.instructor_id]).filter(Boolean),
    ),
  ]);
  const classMap = new Map(classRows.map((row) => [row.classId, row]));

  const rows = filteredConversations.map((conversation) => {
    const threadMessages = (messages || []).filter((entry) => entry.conversation_id === conversation.id);
    const unreadCount = threadMessages.filter((entry) => entry.receiver_id === identity.id && !entry.is_read).length;
    const lastSenderRole = threadMessages.length ? threadMessages[threadMessages.length - 1].sender_role : null;

    const classInfo = classMap.get(conversation.class_id);
    const topicTitle = conversation.topic_title || resolveTopicTitle(conversation.topic_id);

    return {
      threadKey:
        identity.role === 'student'
          ? `${conversation.class_id}::${conversation.instructor_id}`
          : `${conversation.class_id}::${conversation.student_id}`,
      conversationId: conversation.id,
      classId: conversation.class_id,
      className: classInfo?.className || 'Class',
      studentId: conversation.student_id,
      studentName: profiles.get(conversation.student_id)?.full_name || 'Student',
      instructorId: conversation.instructor_id,
      instructorName: profiles.get(conversation.instructor_id)?.full_name || 'Instructor',
      topicId: conversation.topic_id || 'topic-introduction',
      topicTitle,
      lastMessage: conversation.last_message || '',
      lastMessageAt: conversation.last_message_at || null,
      unreadCount,
      lastSenderRole,
      hasReply: threadMessages.some((entry) => entry.sender_role === 'instructor'),
      status: messageStatusForInstructor({ unreadCount, lastSenderRole }),
      studentProgress: conversation.student_progress || null,
    };
  });

  if (identity.role === 'student') {
    const existingKeys = new Set(rows.map((row) => row.threadKey));
    classRows.forEach((classItem) => {
      const threadKey = `${classItem.classId}::${classItem.instructorId}`;
      if (existingKeys.has(threadKey)) return;

      rows.push({
        threadKey,
        conversationId: null,
        classId: classItem.classId,
        className: classItem.className,
        studentId: identity.id,
        studentName: identity.fullName,
        instructorId: classItem.instructorId,
        instructorName: classItem.instructorName,
        topicId: 'topic-introduction',
        topicTitle: 'Introduction',
        lastMessage: '',
        lastMessageAt: null,
        unreadCount: 0,
        hasReply: false,
        lastSenderRole: null,
        studentProgress: null,
      });
    });
  }

  let nextRows = rows;
  if (identity.role === 'instructor') {
    nextRows = rows.filter((row) => {
      const classMatch = !filters.classFilter || filters.classFilter === 'All Classes' || row.className === filters.classFilter;
      const topicMatch = !filters.topicFilter || filters.topicFilter === 'All Topics' || row.topicTitle === filters.topicFilter;
      const statusMatch = !filters.statusFilter || filters.statusFilter === 'All' || row.status === filters.statusFilter;
      const searchMatch = !filters.search || normalizeText(row.studentName).includes(normalizeText(filters.search));
      return classMatch && topicMatch && statusMatch && searchMatch;
    });
  }

  return sortByLastMessageDesc(nextRows);
}

async function fetchSupabaseProfilesByIds(userIds) {
  const cleanedIds = Array.from(new Set((userIds || []).filter(Boolean)));
  if (!cleanedIds.length) return new Map();

  let response = await supabase.from('users').select('id, full_name, role').in('id', cleanedIds);
  if (response.error) {
    response = await supabase.from('profiles').select('id, full_name, role').in('id', cleanedIds);
  }

  const map = new Map();
  (response.data || []).forEach((entry) => {
    map.set(entry.id, entry);
  });
  return map;
}

async function fetchSupabaseStudentClassLinks(studentId) {
  const enrollments = await supabase.from('class_members').select('class_id').eq('student_id', studentId);
  if (!enrollments.error) {
    const classIds = (enrollments.data || []).map((entry) => entry.class_id).filter(Boolean);
    if (!classIds.length) return [];
    const classesResult = await supabase.from('classes').select('id, class_name, instructor_id').in('id', classIds);
    const profiles = await fetchSupabaseProfilesByIds((classesResult.data || []).map((entry) => entry.instructor_id));
    return (classesResult.data || []).map((entry) => ({
      classId: entry.id,
      className: entry.class_name || 'Class',
      instructorId: entry.instructor_id,
      instructorName: profiles.get(entry.instructor_id)?.full_name || 'Instructor',
    }));
  }

  const enrollmentFallback = await supabase
    .from('course_enrollments')
    .select('course_id, courses(id, title, instructor_id)')
    .eq('user_id', studentId);
  const courses = (enrollmentFallback.data || []).map((entry) => entry.courses).filter(Boolean);
  const profiles = await fetchSupabaseProfilesByIds(courses.map((entry) => entry.instructor_id));
  return courses.map((course) => ({
    classId: course.id,
    className: course.title || 'Class',
    instructorId: course.instructor_id,
    instructorName: profiles.get(course.instructor_id)?.full_name || 'Instructor',
  }));
}

async function fetchSupabaseInstructorClassLinks(instructorId) {
  const classesResult = await supabase.from('classes').select('id, class_name, instructor_id').eq('instructor_id', instructorId);
  if (!classesResult.error) {
    return (classesResult.data || []).map((entry) => ({
      classId: entry.id,
      className: entry.class_name || 'Class',
      instructorId: entry.instructor_id,
      instructorName: null,
    }));
  }

  const courseResult = await supabase.from('courses').select('id, title, instructor_id').eq('instructor_id', instructorId);
  return (courseResult.data || []).map((entry) => ({
    classId: entry.id,
    className: entry.title || 'Class',
    instructorId: entry.instructor_id,
    instructorName: null,
  }));
}

async function sendSupabaseMessage(identity, payload) {
  const trimmedBody = String(payload.body || '').trim();
  if (!trimmedBody) throw new Error('Message cannot be empty.');

  const topicId = payload.topicId || 'topic-introduction';
  const topicTitle = resolveTopicTitle(topicId);
  const nowIso = new Date().toISOString();

  let conversationId = payload.conversationId;
  if (!conversationId) {
    const insertPayload = {
      student_id: payload.studentId,
      instructor_id: payload.instructorId,
      class_id: payload.classId,
      topic_id: topicId,
      topic_title: topicTitle,
      last_message: trimmedBody,
      last_message_at: nowIso,
      updated_at: nowIso,
    };

    const insertConversation = await supabase.from('conversations').insert(insertPayload).select('id').single();
    if (insertConversation.error) {
      throw new Error(insertConversation.error.message || 'Failed to create conversation.');
    }
    conversationId = insertConversation.data.id;
  }

  const senderRole = identity.role;
  const receiverRole = senderRole === 'student' ? 'instructor' : 'student';
  const senderId = senderRole === 'student' ? payload.studentId : payload.instructorId;
  const receiverId = senderRole === 'student' ? payload.instructorId : payload.studentId;

  const messageInsert = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    sender_role: senderRole,
    receiver_role: receiverRole,
    class_id: payload.classId,
    topic_id: topicId,
    topic_title: topicTitle,
    message_body: trimmedBody,
    is_read: false,
    created_at: nowIso,
  });

  if (messageInsert.error) {
    throw new Error(messageInsert.error.message || 'Failed to send message.');
  }

  const updateConversation = await supabase
    .from('conversations')
    .update({
      topic_id: topicId,
      topic_title: topicTitle,
      last_message: trimmedBody,
      last_message_at: nowIso,
      updated_at: nowIso,
    })
    .eq('id', conversationId);

  if (updateConversation.error) {
    throw new Error(updateConversation.error.message || 'Failed to update conversation.');
  }

  return {
    conversationId,
  };
}

function normalizeThreadPayload(identity, thread) {
  if (!thread) {
    throw new Error('No message thread selected.');
  }

  const classId = thread.classId;
  const studentId = thread.studentId || (identity.role === 'student' ? identity.id : null);
  const instructorId = thread.instructorId || (identity.role === 'instructor' ? identity.id : null);

  if (!classId || !studentId || !instructorId) {
    throw new Error('Incomplete thread details.');
  }

  return {
    classId,
    studentId,
    instructorId,
  };
}

async function withMessagingBackend(identity, worker) {
  const hasSupabaseMessaging = identity.mode === 'supabase' && (await detectSupabaseMessagingAvailability());
  if (hasSupabaseMessaging) {
    try {
      return await worker('supabase');
    } catch {
      return worker('local');
    }
  }

  return worker('local');
}

export async function fetchStudentMessageThreads() {
  const identity = await resolveIdentity('student');
  return withMessagingBackend(identity, async (backend) => {
    if (backend === 'supabase') {
      const rows = await fetchSupabaseThreads(identity, {});
      return {
        threads: rows,
        classFilterOptions: ['All Classes', ...Array.from(new Set(rows.map((row) => row.className).filter(Boolean)))],
      };
    }

    const store = ensureLocalStore();
    const rows = buildLocalStudentThreads(store, identity);
    return {
      threads: rows,
      classFilterOptions: ['All Classes', ...Array.from(new Set(rows.map((row) => row.className).filter(Boolean)))],
    };
  });
}

export async function fetchInstructorMessageThreads(filters = {}) {
  const identity = await resolveIdentity('instructor');
  const safeFilters = {
    classFilter: filters.classFilter || 'All Classes',
    topicFilter: filters.topicFilter || 'All Topics',
    statusFilter: filters.statusFilter || 'All',
    search: filters.search || '',
  };

  return withMessagingBackend(identity, async (backend) => {
    if (backend === 'supabase') {
      const rows = await fetchSupabaseThreads(identity, safeFilters);
      return {
        threads: rows,
        classFilterOptions: ['All Classes', ...Array.from(new Set(rows.map((row) => row.className).filter(Boolean)))],
        topicFilterOptions: buildInstructorTopicOptions(rows),
        statusFilterOptions: MESSAGE_STATUS_OPTIONS,
      };
    }

    const store = ensureLocalStore();
    const rows = buildLocalInstructorThreads(store, identity, safeFilters);
    return {
      threads: rows,
      classFilterOptions: buildLocalInstructorClassOptions(store, identity),
      topicFilterOptions: buildInstructorTopicOptions(rows),
      statusFilterOptions: MESSAGE_STATUS_OPTIONS,
    };
  });
}

export async function fetchConversationMessages(conversationId) {
  const identity = await resolveIdentity();
  return withMessagingBackend(identity, async (backend) => {
    if (backend === 'supabase') {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw new Error(error.message || 'Failed to load messages.');

      const senderIds = Array.from(new Set((data || []).map((entry) => entry.sender_id).filter(Boolean)));
      const profiles = await fetchSupabaseProfilesByIds(senderIds);

      return (data || []).map((entry) => ({
        id: entry.id,
        conversationId: entry.conversation_id,
        senderId: entry.sender_id,
        receiverId: entry.receiver_id,
        senderRole: entry.sender_role,
        receiverRole: entry.receiver_role,
        senderName: profiles.get(entry.sender_id)?.full_name || 'User',
        messageBody: entry.message_body,
        topicId: entry.topic_id,
        topicTitle: entry.topic_title || resolveTopicTitle(entry.topic_id),
        isRead: Boolean(entry.is_read),
        createdAt: entry.created_at,
        classId: entry.class_id,
      }));
    }

    const store = ensureLocalStore();
    return getConversationMessagesFromStore(store, conversationId, identity);
  });
}

export async function markConversationAsRead(conversationId) {
  const identity = await resolveIdentity();

  return withMessagingBackend(identity, async (backend) => {
    if (!conversationId) return;

    if (backend === 'supabase') {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', identity.id)
        .eq('is_read', false);
      if (error) {
        throw new Error(error.message || 'Failed to mark messages as read.');
      }
      return;
    }

    const store = ensureLocalStore();
    markConversationReadInStore(store, conversationId, identity);
  });
}

export async function sendMessageForThread({ conversationId, thread, body, topicId }) {
  const identity = await resolveIdentity();
  const normalized = normalizeThreadPayload(identity, thread);

  return withMessagingBackend(identity, async (backend) => {
    if (backend === 'supabase') {
      return sendSupabaseMessage(identity, {
        conversationId,
        classId: normalized.classId,
        studentId: normalized.studentId,
        instructorId: normalized.instructorId,
        body,
        topicId,
      });
    }

    const store = ensureLocalStore();
    return sendLocalMessage(store, identity, {
      conversationId,
      classId: normalized.classId,
      studentId: normalized.studentId,
      instructorId: normalized.instructorId,
      body,
      topicId,
      studentProgress: thread?.studentProgress || null,
    });
  });
}

export async function fetchUnreadMessageCountForCurrentUser(roleHint) {
  const identity = await resolveIdentity(roleHint);
  return withMessagingBackend(identity, async (backend) => {
    if (backend === 'supabase') {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', identity.id)
        .eq('is_read', false);

      if (error) {
        throw new Error(error.message || 'Failed to load unread count.');
      }

      return Number(count || 0);
    }

    const store = ensureLocalStore();
    const identityKeys = toIdentityKeys(identity);
    return (store.messages || []).filter((entry) => identityKeys.has(entry.receiver_id) && !entry.is_read).length;
  });
}

export function subscribeToMessages(callback) {
  if (!canUseStorage()) {
    return () => {};
  }

  const handleStorage = (event) => {
    if (!event?.key) {
      callback();
      return;
    }

    const watchedKeys = new Set([
      LOCAL_MESSAGES_STORAGE_KEY,
      LOCAL_INSTRUCTOR_CLASSES_KEY,
      LOCAL_CLASS_ENROLLMENTS_KEY,
    ]);

    if (watchedKeys.has(event.key)) {
      callback();
    }
  };

  const handleLocalUpdate = () => callback();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(LOCAL_MESSAGES_EVENT, handleLocalUpdate);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(LOCAL_MESSAGES_EVENT, handleLocalUpdate);
  };
}
