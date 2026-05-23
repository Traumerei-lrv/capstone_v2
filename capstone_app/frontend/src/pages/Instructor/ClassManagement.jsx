import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, ClipboardList, FileText, FolderOpen, Plus, Upload, UserPlus, Users } from 'lucide-react';

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

const initialClasses = [
  {
    id: 'CLS-1',
    name: 'DSA Fundamentals',
    section: 'A-12',
    code: 'Q8M4TZ',
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

function ClassOverview({ classes, className, section, setClassName, setSection, onCreate, onOpenClass }) {
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
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenClass(item.id)}
                className="text-left rounded-xl border border-blue-100 bg-blue-50/50 p-4 transition hover:bg-blue-100/60"
              >
                <p className="text-base font-black text-blue-900">{item.name}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Section {item.section}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600">Code: {item.code}</span>
                  <span className="text-xs font-bold text-slate-500">{item.members.length} members</span>
                </div>
              </button>
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Performance Snapshot</h2>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="mt-2 grid grid-cols-3 gap-3 text-xs font-bold uppercase tracking-wide text-slate-600">
              <span>Avg Score: {selectedClass.performance.avgScore}%</span>
              <span>Completion: {selectedClass.performance.completionRate}%</span>
              <span>Participation: {selectedClass.performance.participation}%</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Common Difficulty Topics</h2>
          </div>
          <div className="space-y-3">
            {selectedClass.difficultyTopics.length === 0 ? (
              <p className="text-sm text-slate-500">No difficulty trends yet for this class.</p>
            ) : (
              selectedClass.difficultyTopics.map((entry) => (
                <div key={entry.topic} className="rounded-xl border border-orange-200 bg-orange-50/70 p-4">
                  <p className="font-black text-slate-900">{entry.topic}</p>
                  <p className="text-sm font-semibold text-orange-700">{entry.issue}</p>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-600">{entry.impact}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function ClassManagement() {
  const navigate = useNavigate();
  const { classId } = useParams();

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
      members: [],
      materials: [],
      activities: [],
      performance: { avgScore: 0, completionRate: 0, participation: 0 },
      difficultyTopics: [],
    };

    updateClasses((prev) => [newClass, ...prev]);
    setClassName('');
    setSection('');
  };

  const addMember = () => {
    if (!selectedClass || !newMemberName.trim()) return;
    updateClasses((prev) =>
      prev.map((item) => (item.id === selectedClass.id ? { ...item, members: [...item.members, { id: `STU-${Date.now()}`, name: newMemberName.trim(), status: 'Joined' }] } : item))
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
