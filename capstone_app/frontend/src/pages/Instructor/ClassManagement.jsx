import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ClipboardList, FileText, FolderOpen, Plus, Upload, UserPlus, Users, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const STORAGE_KEY = 'balangkas_instructor_classes_v1';

const Card = ({ children, className = '' }) => (
  <section className={`bg-white rounded-2xl border-2 border-blue-100 p-6 ${className}`}>
    {children}
  </section>
);

function generateClassCode(existingCodes) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  do {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (existingCodes.has(code));

  return code;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const TRACKING_TOPICS = ['Recursion', 'Iteration', 'Linked List', 'Trees', 'Queues', 'Stacks', 'Graphs'];
const STATUS_FILTER_OPTIONS = ['All', 'Completed', 'In Progress', 'Needs Support'];
const SORT_OPTIONS = ['Lowest Score', 'Highest Progress', 'Last Active'];

function toPercentage(score, total) {
  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.round((score / total) * 100);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getLowestScore(progress) {
  const scores = [
    toPercentage(progress.preTest.score, progress.preTest.total),
    toPercentage(progress.postTest.score, progress.postTest.total),
    toPercentage(progress.quiz.score, progress.quiz.total),
    toPercentage(progress.activity.score, progress.activity.total),
    toPercentage(progress.miniGame.score, progress.miniGame.total),
  ];

  return scores.reduce((lowest, current) => (current < lowest ? current : lowest), 100);
}

function resolveStudentStatus(progress) {
  const prePct = toPercentage(progress.preTest.score, progress.preTest.total);
  const postPct = toPercentage(progress.postTest.score, progress.postTest.total);
  const quizPct = toPercentage(progress.quiz.score, progress.quiz.total);
  const activityPct = toPercentage(progress.activity.score, progress.activity.total);
  const miniGamePct = toPercentage(progress.miniGame.score, progress.miniGame.total);

  const lowScores = [prePct, postPct, quizPct, activityPct, miniGamePct].some((score) => score < 60);
  const failedSignals = (progress.activity.failedAttempts || 0) >= 2 || (progress.miniGame.wrongActions || 0) >= 5;
  const incompleteWork = progress.lessonsCompleted < progress.totalLessons || progress.activity.completedProblems < progress.activity.totalProblems;

  if (lowScores || failedSignals || (incompleteWork && postPct < 70)) {
    return 'Needs Support';
  }

  const completed = progress.lessonsCompleted >= progress.totalLessons && progress.activity.completedProblems >= progress.activity.totalProblems && postPct >= 70;
  if (completed) {
    return 'Completed';
  }

  return 'In Progress';
}

function createDefaultStudentProgress(member, index = 0) {
  const topic = TRACKING_TOPICS[index % TRACKING_TOPICS.length];
  const totalLessons = 6;
  const lessonsCompleted = Math.min(totalLessons - 1, (index % totalLessons) + 1);
  const preScore = 8 + (index % 8);
  const postScore = Math.min(20, preScore + 3);
  const quizScore = 9 + (index % 10);
  const activityScore = 10 + (index % 9);
  const miniGameScore = 22 + (index % 20);

  return {
    memberId: member.id,
    currentTopic: topic,
    lessonsCompleted,
    totalLessons,
    preTest: { score: preScore, total: 20, attempts: 1 + (index % 2) },
    quiz: { score: quizScore, total: 20, attempts: 1 + (index % 2) },
    activity: {
      score: activityScore,
      total: 20,
      completedProblems: 4 + (index % 6),
      totalProblems: 10,
      failedAttempts: index % 3,
    },
    miniGame: {
      score: miniGameScore,
      total: 40,
      attempts: 1 + (index % 3),
      correctActions: 14 + (index % 10),
      wrongActions: 1 + (index % 4),
      failedStep: index % 2 === 0 ? 'Pointer reassignment step' : 'Base case timing',
    },
    postTest: { score: postScore, total: 20, attempts: 1 + (index % 2) },
    overallProgress: Math.min(95, 30 + index * 11),
    lastActive: new Date(Date.now() - (index + 1) * 36 * 60 * 60 * 1000).toISOString(),
    difficultyBreakdown: {
      weakestTopic: TRACKING_TOPICS[(index + 2) % TRACKING_TOPICS.length],
      lowestScoreActivity: `${topic} drill (${Math.min(preScore, quizScore) * 5}%)`,
      commonMistake: index % 2 === 0 ? 'Missed edge-case validation' : 'Skipped dry-run planning',
      recommendedAction: index % 3 === 0 ? 'Needs instructor support' : index % 2 === 0 ? 'Review lesson' : 'Retry activity',
    },
  };
}

const initialClasses = [
  {
    id: 'CLS-1',
    name: 'DSA Fundamentals',
    section: 'A-12',
    code: 'Q8M4TZ',
    instructor_id: 'instructor@balangkas.local',
    instructor_name: 'Ben Piñon',
    members: [
      { id: 'STU-1', name: 'Maria Santos', status: 'Joined' },
      { id: 'STU-2', name: 'Juan Dela Cruz', status: 'Joined' },
      { id: 'STU-3', name: 'Alyssa Cruz', status: 'Review Needed' },
    ],
    materials: [
      {
        id: 'MAT-1',
        title: 'Recursion Starter Guide',
        type: 'PDF',
        topic: 'Recursion',
        uploadedAt: 'May 22, 2026',
        fileName: 'recursion-starter-guide.pdf',
        fileSize: '1.10 MB',
      },
    ],
    activities: [{ id: 'ACT-1', title: 'Recursion Depth Quiz', type: 'Quiz', topic: 'Recursion', assignedAt: 'May 22, 2026' }],
    performance: { avgScore: 84, completionRate: 79, participation: 88 },
    studentProgress: [
      {
        memberId: 'STU-1',
        currentTopic: 'Recursion',
        lessonsCompleted: 6,
        totalLessons: 6,
        preTest: { score: 15, total: 20, attempts: 1 },
        quiz: { score: 17, total: 20, attempts: 1 },
        activity: { score: 18, total: 20, completedProblems: 10, totalProblems: 10, failedAttempts: 0 },
        miniGame: { score: 37, total: 40, attempts: 2, correctActions: 19, wrongActions: 2, failedStep: 'None' },
        postTest: { score: 19, total: 20, attempts: 1 },
        overallProgress: 100,
        lastActive: '2026-05-24T13:35:00Z',
        difficultyBreakdown: {
          weakestTopic: 'Graphs',
          lowestScoreActivity: 'Graph Racer mini-game (74%)',
          commonMistake: 'Delayed node-visit marking',
          recommendedAction: 'Review lesson',
        },
      },
      {
        memberId: 'STU-2',
        currentTopic: 'Iteration',
        lessonsCompleted: 4,
        totalLessons: 6,
        preTest: { score: 13, total: 20, attempts: 2 },
        quiz: { score: 14, total: 20, attempts: 2 },
        activity: { score: 15, total: 20, completedProblems: 7, totalProblems: 10, failedAttempts: 1 },
        miniGame: { score: 29, total: 40, attempts: 3, correctActions: 15, wrongActions: 4, failedStep: 'Loop exit condition' },
        postTest: { score: 15, total: 20, attempts: 1 },
        overallProgress: 73,
        lastActive: '2026-05-23T08:12:00Z',
        difficultyBreakdown: {
          weakestTopic: 'Trees',
          lowestScoreActivity: 'Tree Builder activity (68%)',
          commonMistake: 'Missed child-node order',
          recommendedAction: 'Retry activity',
        },
      },
      {
        memberId: 'STU-3',
        currentTopic: 'Linked List',
        lessonsCompleted: 2,
        totalLessons: 6,
        preTest: { score: 9, total: 20, attempts: 2 },
        quiz: { score: 8, total: 20, attempts: 3 },
        activity: { score: 10, total: 20, completedProblems: 4, totalProblems: 10, failedAttempts: 3 },
        miniGame: { score: 18, total: 40, attempts: 4, correctActions: 9, wrongActions: 8, failedStep: 'Node insert pointer update' },
        postTest: { score: 10, total: 20, attempts: 1 },
        overallProgress: 41,
        lastActive: '2026-05-21T15:27:00Z',
        difficultyBreakdown: {
          weakestTopic: 'Linked List',
          lowestScoreActivity: 'Pointer shift activity (50%)',
          commonMistake: 'Pointer reset after insertion',
          recommendedAction: 'Needs instructor support',
        },
      },
    ],
    difficultyTopics: [{ topic: 'Recursion', issue: 'Base case recognition', impact: '46% low scores' }],
  },
];

function loadClasses() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialClasses;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : initialClasses;
  } catch {
    return initialClasses;
  }
}

function saveClasses(classes) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

function ClassOverview({
  classes,
  className,
  section,
  setClassName,
  setSection,
  onCreate,
  onOpenClass,
  onEditClass,
  onDeleteClass,
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-blue-900 tracking-tight">Class Management</h1>
        <p className="mt-2 text-slate-500 font-medium">Create a class, generate a class code, and open each class workspace.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Create Class</h2>
          </div>
          <div className="space-y-3">
            <input
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              placeholder="Class name"
              className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
            />
            <input
              value={section}
              onChange={(event) => setSection(event.target.value)}
              placeholder="Section"
              className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
            />
            <button type="button" onClick={onCreate} className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest px-4 py-3">
              Generate Unique Code
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Created Classes</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {classes.map((item) => (
              <article key={item.id} className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <button
                  type="button"
                  onClick={() => onOpenClass(item.id)}
                  className="w-full text-left transition hover:opacity-90"
                >
                  <p className="text-base font-black text-blue-900">{item.name}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Section {item.section}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600">Code: {item.code}</span>
                    <span className="text-xs font-bold text-slate-500">{item.members.length} members</span>
                  </div>
                </button>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditClass(item.id)}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-blue-700 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteClass(item.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-rose-700 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClassDetail({
  selectedClass,
  topic,
  setTopic,
  activityTitle,
  setActivityTitle,
  activityType,
  setActivityType,
  materialTitle,
  setMaterialTitle,
  materialType,
  setMaterialType,
  newMemberName,
  setNewMemberName,
  onBack,
  onAddMember,
  onAddMaterial,
  onAddActivity,
}) {
  const [topicFilter, setTopicFilter] = useState('All Topics');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Last Active');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  const studentRows = useMemo(() => {
    const progressRows = Array.isArray(selectedClass.studentProgress) ? selectedClass.studentProgress : [];

    return selectedClass.members.map((member, index) => {
      const progress = progressRows.find((entry) => entry.memberId === member.id) || createDefaultStudentProgress(member, index);
      const preTestPct = toPercentage(progress.preTest.score, progress.preTest.total);
      const postTestPct = toPercentage(progress.postTest.score, progress.postTest.total);
      const quizPct = toPercentage(progress.quiz.score, progress.quiz.total);
      const activityPct = toPercentage(progress.activity.score, progress.activity.total);
      const miniGamePct = toPercentage(progress.miniGame.score, progress.miniGame.total);
      const status = resolveStudentStatus(progress);
      const lessonProgress = `${progress.lessonsCompleted}/${progress.totalLessons}`;
      const lowestScore = getLowestScore(progress);

      return {
        id: member.id,
        name: member.name,
        status,
        currentTopic: progress.currentTopic,
        lessonProgress,
        preTestPct,
        postTestPct,
        quizPct,
        activityPct,
        miniGamePct,
        overallProgress: progress.overallProgress,
        lastActive: progress.lastActive,
        lowestScore,
        progress,
      };
    });
  }, [selectedClass]);

  const availableTopics = useMemo(() => {
    const fromRows = studentRows.map((row) => row.currentTopic);
    return ['All Topics', ...Array.from(new Set(fromRows))];
  }, [studentRows]);

  const filteredRows = useMemo(() => {
    let rows = [...studentRows];

    if (topicFilter !== 'All Topics') {
      rows = rows.filter((row) => row.currentTopic === topicFilter);
    }

    if (statusFilter !== 'All') {
      rows = rows.filter((row) => row.status === statusFilter);
    }

    if (sortBy === 'Lowest Score') {
      rows.sort((a, b) => a.lowestScore - b.lowestScore);
    } else if (sortBy === 'Highest Progress') {
      rows.sort((a, b) => b.overallProgress - a.overallProgress);
    } else {
      rows.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
    }

    return rows;
  }, [studentRows, topicFilter, statusFilter, sortBy]);

  const statusClasses = (status) => {
    if (status === 'Completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'Needs Support') return 'border-rose-200 bg-rose-50 text-rose-700';
    return 'border-amber-200 bg-amber-50 text-amber-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700 hover:bg-blue-50">
          <ArrowLeft className="h-4 w-4" />
          Back To Classes
        </button>
        <div className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-700">Join Code: {selectedClass.code}</div>
      </div>

      <Card>
        <h1 className="text-3xl font-black text-blue-900">{selectedClass.name}</h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Section {selectedClass.section}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Members</p>
            <p className="mt-1 text-2xl font-black text-blue-900">{selectedClass.members.length}</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Materials</p>
            <p className="mt-1 text-2xl font-black text-blue-900">{selectedClass.materials.length}</p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Activities</p>
            <p className="mt-1 text-2xl font-black text-blue-900">{selectedClass.activities.length}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Members</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input value={newMemberName} onChange={(event) => setNewMemberName(event.target.value)} placeholder="Add member name" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300" />
          <button type="button" onClick={onAddMember} className="rounded-xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest px-4 py-3 hover:bg-blue-800">
            <UserPlus className="w-4 h-4 inline-block mr-1" />
            Add Member
          </button>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {selectedClass.members.length === 0 ? (
            <p className="text-sm text-slate-500">No students joined yet. Share the class code to students.</p>
          ) : (
            selectedClass.members.map((member) => (
              <div key={member.id} className="rounded-xl border border-blue-100 p-3 flex items-center justify-between">
                <p className="font-bold text-blue-900">{member.name}</p>
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">{member.status}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Upload Learning Materials</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <input value={materialTitle} onChange={(event) => setMaterialTitle(event.target.value)} placeholder="Material title" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300" />
            <select value={materialType} onChange={(event) => setMaterialType(event.target.value)} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300">
              <option>PDF</option>
              <option>Document</option>
              <option>Slide Deck</option>
              <option>Worksheet</option>
              <option>Video</option>
            </select>
            <select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300">
              <option>Recursion</option>
              <option>Iteration</option>
              <option>Linked List</option>
              <option>Trees</option>
            </select>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-100">
              <Upload className="h-4 w-4" />
              Select File
              <input type="file" className="hidden" onChange={onAddMaterial} />
            </label>
          </div>
          <div className="space-y-2">
            {selectedClass.materials.map((item) => (
              <div key={item.id} className="rounded-xl border border-blue-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-blue-900">{item.title}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.type} • {item.topic}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">{item.uploadedAt}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{item.fileName} • {item.fileSize}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Assignments & Activities</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <input value={activityTitle} onChange={(event) => setActivityTitle(event.target.value)} placeholder="Activity title" className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300" />
            <select value={activityType} onChange={(event) => setActivityType(event.target.value)} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300">
              <option>Quiz</option>
              <option>Assessment</option>
              <option>Coding Task</option>
              <option>Reflection</option>
            </select>
            <select value={topic} onChange={(event) => setTopic(event.target.value)} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300">
              <option>Recursion</option>
              <option>Iteration</option>
              <option>Linked List</option>
              <option>Trees</option>
            </select>
            <button type="button" onClick={onAddActivity} className="rounded-xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest px-4 py-3 hover:bg-orange-600">
              <Plus className="w-4 h-4 inline-block mr-1" />
              Assign
            </button>
          </div>
          <div className="space-y-2">
            {selectedClass.activities.map((item) => (
              <div key={item.id} className="rounded-xl border border-blue-100 p-3">
                <p className="font-bold text-blue-900">{item.title}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.type} • {item.topic} • {item.assignedAt}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Student Progress Tracking</h2>
            <p className="text-sm font-medium text-slate-500">Per-student topic progress, scores, completion state, and support signals.</p>
          </div>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300">
            {availableTopics.map((entry) => (
              <option key={entry} value={entry}>
                {entry === 'All Topics' ? 'Select Topic: All Topics' : entry}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300">
            {STATUS_FILTER_OPTIONS.map((entry) => (
              <option key={entry} value={entry}>
                {entry === 'All' ? 'Select Status: All' : entry}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300">
            {SORT_OPTIONS.map((entry) => (
              <option key={entry} value={entry}>
                Sort by {entry}
              </option>
            ))}
          </select>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">
            Showing {filteredRows.length} of {studentRows.length} student(s)
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-blue-100">
          <table className="min-w-[1180px] w-full text-left">
            <thead className="bg-blue-50">
              <tr className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Current Topic</th>
                <th className="px-4 py-3">Lesson Progress</th>
                <th className="px-4 py-3">Pre-Test Score</th>
                <th className="px-4 py-3">Post-Test Score</th>
                <th className="px-4 py-3">Quiz Score</th>
                <th className="px-4 py-3">Activity/Problem Score</th>
                <th className="px-4 py-3">Mini-Game Score</th>
                <th className="px-4 py-3">Overall Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 bg-white">
              {filteredRows.map((row) => (
                <tr key={row.id} className="text-sm font-semibold text-slate-700">
                  <td className="px-4 py-3 font-bold text-blue-900">{row.name}</td>
                  <td className="px-4 py-3">{row.currentTopic}</td>
                  <td className="px-4 py-3">{row.lessonProgress}</td>
                  <td className="px-4 py-3">{row.preTestPct}%</td>
                  <td className="px-4 py-3">{row.postTestPct}%</td>
                  <td className="px-4 py-3">{row.quizPct}%</td>
                  <td className="px-4 py-3">{row.activityPct}%</td>
                  <td className="px-4 py-3">{row.miniGamePct}%</td>
                  <td className="px-4 py-3">
                    <div className="min-w-[120px]">
                      <div className="mb-1 h-2 overflow-hidden rounded-full bg-blue-100">
                        <div className="h-full rounded-full bg-blue-700" style={{ width: `${row.overallProgress}%` }} />
                      </div>
                      <span className="text-xs font-black text-blue-700">{row.overallProgress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black uppercase tracking-wide ${statusClasses(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentDetail(row)}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedStudentDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border-2 border-blue-100 bg-white p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black text-blue-900">{selectedStudentDetail.name}</h3>
                <p className="text-sm font-medium text-slate-500">
                  Class/Section: {selectedClass.name} / {selectedClass.section}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Current Topic: {selectedStudentDetail.currentTopic}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Overall Progress: {selectedStudentDetail.overallProgress}% • Last Active: {formatDateTime(selectedStudentDetail.lastActive)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudentDetail(null)}
                className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                aria-label="Close student details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Pre-Test Result</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Score: {selectedStudentDetail.progress.preTest.score}/{selectedStudentDetail.progress.preTest.total} ({selectedStudentDetail.preTestPct}%)
                </p>
                <p className="text-sm font-semibold text-slate-700">Attempt Count: {selectedStudentDetail.progress.preTest.attempts}</p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Lesson Progress</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Completed Lessons: {selectedStudentDetail.progress.lessonsCompleted}/{selectedStudentDetail.progress.totalLessons}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Quiz Result</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Score: {selectedStudentDetail.progress.quiz.score}/{selectedStudentDetail.progress.quiz.total} ({selectedStudentDetail.quizPct}%)
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Activity/Problem Result</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Score: {selectedStudentDetail.progress.activity.score}/{selectedStudentDetail.progress.activity.total} ({selectedStudentDetail.activityPct}%)
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Completed Problems: {selectedStudentDetail.progress.activity.completedProblems}/{selectedStudentDetail.progress.activity.totalProblems}
                </p>
                <p className="text-sm font-semibold text-slate-700">Failed Attempts: {selectedStudentDetail.progress.activity.failedAttempts}</p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Mini-Game Performance</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Score: {selectedStudentDetail.progress.miniGame.score}/{selectedStudentDetail.progress.miniGame.total} ({selectedStudentDetail.miniGamePct}%)
                </p>
                <p className="text-sm font-semibold text-slate-700">Attempts: {selectedStudentDetail.progress.miniGame.attempts}</p>
                <p className="text-sm font-semibold text-slate-700">Correct Actions: {selectedStudentDetail.progress.miniGame.correctActions}</p>
                <p className="text-sm font-semibold text-slate-700">Wrong Actions: {selectedStudentDetail.progress.miniGame.wrongActions}</p>
                <p className="text-sm font-semibold text-slate-700">Failed Step: {selectedStudentDetail.progress.miniGame.failedStep || 'None'}</p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Post-Test Result</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  Score: {selectedStudentDetail.progress.postTest.score}/{selectedStudentDetail.progress.postTest.total} ({selectedStudentDetail.postTestPct}%)
                </p>
                <p className="text-sm font-semibold text-slate-700">Attempt Count: {selectedStudentDetail.progress.postTest.attempts}</p>
                <p className="text-sm font-semibold text-slate-700">
                  Improvement from Pre-Test: {selectedStudentDetail.postTestPct - selectedStudentDetail.preTestPct}%
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50/70 p-4">
              <p className="text-xs font-black uppercase tracking-widest text-orange-600">Difficulty Breakdown</p>
              <div className="mt-2 grid gap-2 text-sm font-semibold text-orange-800 md:grid-cols-2">
                <p>Weakest Topic: {selectedStudentDetail.progress.difficultyBreakdown.weakestTopic}</p>
                <p>Lowest Score Activity: {selectedStudentDetail.progress.difficultyBreakdown.lowestScoreActivity}</p>
                <p>Failed Step or Common Mistake: {selectedStudentDetail.progress.difficultyBreakdown.commonMistake}</p>
                <p>Recommended Action: {selectedStudentDetail.progress.difficultyBreakdown.recommendedAction}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ClassManagement() {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { user } = useAuth();

  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [topic, setTopic] = useState('Recursion');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState('Quiz');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState('PDF');
  const [newMemberName, setNewMemberName] = useState('');
  const [classes, setClasses] = useState(loadClasses);

  const classCodeSet = useMemo(() => new Set(classes.map((item) => item.code)), [classes]);
  const selectedClass = useMemo(() => classes.find((item) => item.id === classId) ?? null, [classes, classId]);
  const isDetailRoute = Boolean(classId);

  const updateClasses = (updater) => {
    setClasses((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveClasses(next);
      return next;
    });
  };

  const createClass = () => {
    if (!className.trim() || !section.trim()) return;
    const code = generateClassCode(classCodeSet);
    const newClass = {
      id: `CLS-${Date.now()}`,
      name: className.trim(),
      section: section.trim(),
      code,
      instructor_id: user?.email || 'instructor@balangkas.local',
      instructor_name: user?.profile?.full_name || 'Instructor',
      members: [],
      materials: [],
      activities: [],
      performance: { avgScore: 0, completionRate: 0, participation: 0 },
      studentProgress: [],
      difficultyTopics: [],
    };

    updateClasses((prev) => [newClass, ...prev]);
    setClassName('');
    setSection('');
  };

  const addMember = () => {
    if (!selectedClass || !newMemberName.trim()) return;
    const nextMember = { id: `STU-${Date.now()}`, name: newMemberName.trim(), status: 'Joined' };
    updateClasses((prev) =>
      prev.map((item) => {
        if (item.id !== selectedClass.id) return item;

        const existingProgress = Array.isArray(item.studentProgress) ? item.studentProgress : [];
        const generatedProgress = createDefaultStudentProgress(nextMember, item.members.length);

        return {
          ...item,
          members: [...item.members, nextMember],
          studentProgress: [...existingProgress, generatedProgress],
        };
      })
    );
    setNewMemberName('');
  };

  const addMaterial = (event) => {
    const file = event.target.files?.[0];
    if (!selectedClass || !file) return;
    const title = materialTitle.trim() || file.name.replace(/\.[^/.]+$/, '');

    updateClasses((prev) =>
      prev.map((item) =>
        item.id === selectedClass.id
          ? {
              ...item,
              materials: [
                {
                  id: `MAT-${Date.now()}`,
                  title,
                  type: materialType,
                  topic,
                  uploadedAt: todayLabel(),
                  fileName: file.name,
                  fileSize: formatFileSize(file.size),
                  mimeType: file.type || 'unknown',
                  lastModified: file.lastModified,
                },
                ...item.materials,
              ],
            }
          : item
      )
    );
    setMaterialTitle('');
    event.target.value = '';
  };

  const addActivity = () => {
    if (!selectedClass || !activityTitle.trim()) return;
    updateClasses((prev) =>
      prev.map((item) =>
        item.id === selectedClass.id
          ? { ...item, activities: [{ id: `ACT-${Date.now()}`, title: activityTitle.trim(), type: activityType, topic, assignedAt: todayLabel() }, ...item.activities] }
          : item
      )
    );
    setActivityTitle('');
  };

  const editClass = (targetId) => {
    const current = classes.find((item) => item.id === targetId);
    if (!current) return;

    const nextName = window.prompt('Edit class name:', current.name);
    if (nextName === null) return;

    const cleanedName = nextName.trim();
    if (!cleanedName) return;

    const nextSection = window.prompt('Edit section:', current.section);
    if (nextSection === null) return;

    const cleanedSection = nextSection.trim();
    if (!cleanedSection) return;

    updateClasses((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? {
              ...item,
              name: cleanedName,
              section: cleanedSection,
            }
          : item
      )
    );
  };

  const deleteClass = (targetId) => {
    const current = classes.find((item) => item.id === targetId);
    if (!current) return;

    const confirmed = window.confirm(`Delete class "${current.name}" (${current.section})? This cannot be undone.`);
    if (!confirmed) return;

    updateClasses((prev) => prev.filter((item) => item.id !== targetId));
  };

  if (isDetailRoute && !selectedClass) {
    return (
      <Card>
        <p className="text-lg font-black text-blue-900">Class not found.</p>
        <button type="button" onClick={() => navigate('/instructor/class-management')} className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
          Back To Classes
        </button>
      </Card>
    );
  }

  if (!isDetailRoute) {
    return (
      <ClassOverview
        classes={classes}
        className={className}
        section={section}
        setClassName={setClassName}
        setSection={setSection}
        onCreate={createClass}
        onOpenClass={(id) => navigate(`/instructor/class-management/${id}`)}
        onEditClass={editClass}
        onDeleteClass={deleteClass}
      />
    );
  }

  return (
    <ClassDetail
      selectedClass={selectedClass}
      topic={topic}
      setTopic={setTopic}
      activityTitle={activityTitle}
      setActivityTitle={setActivityTitle}
      activityType={activityType}
      setActivityType={setActivityType}
      materialTitle={materialTitle}
      setMaterialTitle={setMaterialTitle}
      materialType={materialType}
      setMaterialType={setMaterialType}
      newMemberName={newMemberName}
      setNewMemberName={setNewMemberName}
      onBack={() => navigate('/instructor/class-management')}
      onAddMember={addMember}
      onAddMaterial={addMaterial}
      onAddActivity={addActivity}
    />
  );
}
