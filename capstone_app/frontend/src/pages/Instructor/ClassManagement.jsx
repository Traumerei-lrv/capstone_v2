import { useMemo, useState } from 'react';
import { BarChart3, BookOpen, ClipboardList, FileText, FolderOpen, Plus, UserPlus, Users } from 'lucide-react';

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

const initialClasses = [
  {
    id: 'CLS-1',
    name: 'DSA Fundamentals',
    section: 'A-12',
    code: 'Q8M4TZ',
    members: [
      { id: 'STU-1', name: 'Maria Santos', status: 'Active' },
      { id: 'STU-2', name: 'Juan Dela Cruz', status: 'Active' },
      { id: 'STU-3', name: 'Alyssa Cruz', status: 'Review Needed' },
    ],
    materials: [
      { id: 'MAT-1', title: 'Recursion Starter Guide', type: 'PDF', topic: 'Recursion', updated: 'May 22, 2026' },
      { id: 'MAT-2', title: 'Iteration Practice Sheet', type: 'Document', topic: 'Iteration', updated: 'May 21, 2026' },
    ],
    activities: [
      { id: 'ACT-1', title: 'Recursion Depth Quiz', type: 'Quiz', topic: 'Recursion', assignedAt: 'May 22, 2026' },
      { id: 'ACT-2', title: 'Linked List Exit Ticket', type: 'Assessment', topic: 'Linked List', assignedAt: 'May 21, 2026' },
    ],
    performance: { avgScore: 84, completionRate: 79, participation: 88 },
    difficultyTopics: [
      { topic: 'Recursion', issue: 'Base case recognition', impact: '46% low scores' },
      { topic: 'Linked List', issue: 'Pointer updates', impact: '39% retry rate' },
    ],
  },
  {
    id: 'CLS-2',
    name: 'Algorithm Design',
    section: 'B-09',
    code: 'J7K2PY',
    members: [
      { id: 'STU-4', name: 'Kian Reyes', status: 'Active' },
      { id: 'STU-5', name: 'Jessa Lim', status: 'Active' },
    ],
    materials: [{ id: 'MAT-3', title: 'Tree Traversal Handout', type: 'PDF', topic: 'Trees', updated: 'May 20, 2026' }],
    activities: [{ id: 'ACT-3', title: 'Queue Sprint Activity', type: 'Coding Task', topic: 'Iteration', assignedAt: 'May 20, 2026' }],
    performance: { avgScore: 81, completionRate: 73, participation: 82 },
    difficultyTopics: [{ topic: 'Trees', issue: 'Traversal order', impact: '34% incomplete' }],
  },
];

export default function ClassManagement() {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [topic, setTopic] = useState('Recursion');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState('Quiz');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState('PDF');
  const [newMemberName, setNewMemberName] = useState('');

  const [classes, setClasses] = useState(initialClasses);
  const [selectedClassId, setSelectedClassId] = useState(initialClasses[0]?.id ?? null);

  const classCodeSet = useMemo(() => new Set(classes.map((item) => item.code)), [classes]);
  const selectedClass = useMemo(
    () => classes.find((item) => item.id === selectedClassId) ?? null,
    [classes, selectedClassId]
  );

  const createClass = () => {
    if (!className.trim() || !section.trim()) {
      return;
    }

    const code = generateClassCode(classCodeSet);
    const newClass = {
      id: `CLS-${classes.length + 1}`,
      name: className.trim(),
      section: section.trim(),
      code,
      members: [],
      materials: [],
      activities: [],
      performance: { avgScore: 0, completionRate: 0, participation: 0 },
      difficultyTopics: [],
    };

    setClasses((prev) => [newClass, ...prev]);
    setSelectedClassId(newClass.id);
    setClassName('');
    setSection('');
  };

  const addMember = () => {
    if (!selectedClass || !newMemberName.trim()) {
      return;
    }

    setClasses((prev) =>
      prev.map((item) => {
        if (item.id !== selectedClass.id) {
          return item;
        }

        return {
          ...item,
          members: [
            ...item.members,
            { id: `STU-${Date.now()}`, name: newMemberName.trim(), status: 'Active' },
          ],
        };
      })
    );
    setNewMemberName('');
  };

  const addMaterial = () => {
    if (!selectedClass || !materialTitle.trim()) {
      return;
    }

    setClasses((prev) =>
      prev.map((item) => {
        if (item.id !== selectedClass.id) {
          return item;
        }

        return {
          ...item,
          materials: [
            {
              id: `MAT-${Date.now()}`,
              title: materialTitle.trim(),
              type: materialType,
              topic,
              updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            },
            ...item.materials,
          ],
        };
      })
    );
    setMaterialTitle('');
  };

  const addActivity = () => {
    if (!selectedClass || !activityTitle.trim()) {
      return;
    }

    setClasses((prev) =>
      prev.map((item) => {
        if (item.id !== selectedClass.id) {
          return item;
        }

        return {
          ...item,
          activities: [
            {
              id: `ACT-${Date.now()}`,
              title: activityTitle.trim(),
              type: activityType,
              topic,
              assignedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            },
            ...item.activities,
          ],
        };
      })
    );
    setActivityTitle('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-blue-900 tracking-tight">Class Management</h1>
        <p className="mt-2 text-slate-500 font-medium">
          Create classes, open joined-member lists, upload learning materials, and assign activities to students in each class.
        </p>
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
            <button
              type="button"
              onClick={createClass}
              className="w-full rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest px-4 py-3"
            >
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
            {classes.map((item) => {
              const isSelected = item.id === selectedClassId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedClassId(item.id)}
                  className={`text-left rounded-xl border p-4 transition ${
                    isSelected ? 'border-blue-400 bg-blue-100/80 shadow-sm' : 'border-blue-100 bg-blue-50/50 hover:bg-blue-100/60'
                  }`}
                >
                  <p className="text-base font-black text-blue-900">{item.name}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Section {item.section}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600">Code: {item.code}</span>
                    <span className="text-xs font-bold text-slate-500">{item.members.length} joined</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {selectedClass ? (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-black text-blue-900">{selectedClass.name}</h2>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                  Section {selectedClass.section} • Join Code: {selectedClass.code}
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-blue-600">
                {selectedClass.members.length} Members Joined
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={newMemberName}
                onChange={(event) => setNewMemberName(event.target.value)}
                placeholder="Add joined member name"
                className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
              />
              <button
                type="button"
                onClick={addMember}
                className="rounded-xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest px-4 py-3 hover:bg-blue-800"
              >
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
                <input
                  value={materialTitle}
                  onChange={(event) => setMaterialTitle(event.target.value)}
                  placeholder="Material title"
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                />
                <select
                  value={materialType}
                  onChange={(event) => setMaterialType(event.target.value)}
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                >
                  <option>PDF</option>
                  <option>Document</option>
                  <option>Slide Deck</option>
                  <option>Worksheet</option>
                </select>
                <select
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                >
                  <option>Recursion</option>
                  <option>Iteration</option>
                  <option>Linked List</option>
                  <option>Trees</option>
                </select>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="rounded-xl bg-blue-700 text-white font-black text-xs uppercase tracking-widest px-4 py-3 hover:bg-blue-800"
                >
                  Upload
                </button>
              </div>
              <div className="space-y-2">
                {selectedClass.materials.map((item) => (
                  <div key={item.id} className="rounded-xl border border-blue-100 p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-blue-900">{item.title}</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{item.type} • {item.topic}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="text-xs font-bold rounded-full bg-slate-100 px-3 py-1.5 text-slate-600">Edit</button>
                      <button
                        type="button"
                        onClick={() =>
                          setClasses((prev) =>
                            prev.map((entry) =>
                              entry.id === selectedClass.id
                                ? { ...entry, materials: entry.materials.filter((material) => material.id !== item.id) }
                                : entry
                            )
                          )
                        }
                        className="text-xs font-bold rounded-full bg-rose-100 px-3 py-1.5 text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Assign Quiz / Activity</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <input
                  value={activityTitle}
                  onChange={(event) => setActivityTitle(event.target.value)}
                  placeholder="Activity title"
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                />
                <select
                  value={activityType}
                  onChange={(event) => setActivityType(event.target.value)}
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                >
                  <option>Quiz</option>
                  <option>Assessment</option>
                  <option>Coding Task</option>
                  <option>Reflection</option>
                </select>
                <select
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300"
                >
                  <option>Recursion</option>
                  <option>Iteration</option>
                  <option>Linked List</option>
                  <option>Trees</option>
                </select>
                <button
                  type="button"
                  onClick={addActivity}
                  className="rounded-xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest px-4 py-3 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 inline-block mr-1" />
                  Assign
                </button>
              </div>
              <div className="space-y-2">
                {selectedClass.activities.map((item) => (
                  <div key={item.id} className="rounded-xl border border-blue-100 p-3">
                    <p className="font-bold text-blue-900">{item.title}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {item.type} • {item.topic} • {item.assignedAt}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-black text-blue-900 uppercase tracking-tight">Student Performance Monitor</h2>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <p className="font-black text-blue-900">{selectedClass.name}</p>
                <div className="mt-2 grid grid-cols-3 gap-3 text-xs font-bold uppercase tracking-wide text-slate-600">
                  <span>Avg Score: {selectedClass.performance.avgScore}%</span>
                  <span>Completion: {selectedClass.performance.completionRate}%</span>
                  <span>Participation: {selectedClass.performance.participation}%</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-600" />
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
      ) : null}
    </div>
  );
}
