import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CalendarDays, ClipboardList, FileText, Loader2, Users } from 'lucide-react';
import { fetchClassDetailForStudent } from '../../api/studentDashboard';

const Card = ({ children, className = '' }) => <section className={`rounded-2xl border-2 border-blue-100 bg-white p-6 ${className}`}>{children}</section>;

function toDateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function StudentClassPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError('');
      try {
        const payload = await fetchClassDetailForStudent(courseId);
        if (active) setDetail(payload);
      } catch (loadError) {
        if (active) setError(loadError.message || 'Failed to load class page.');
      } finally {
        if (active) setLoading(false);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] px-6 py-8 text-slate-900">
        <main className="mx-auto max-w-7xl">
          <Card>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading class details...
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !detail?.course) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] px-6 py-8 text-slate-900">
        <main className="mx-auto max-w-7xl space-y-4">
          <Card>
            <p className="text-lg font-black text-blue-900">{error || 'Class not found.'}</p>
            <button type="button" onClick={() => navigate('/playershipdashboard')} className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
              Back To Dashboard
            </button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] px-6 py-8 text-slate-900">
      <main className="mx-auto max-w-7xl space-y-6">
        <button type="button" onClick={() => navigate('/playershipdashboard')} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-blue-700 hover:bg-blue-50">
          <ArrowLeft className="h-4 w-4" />
          Back To Dashboard
        </button>

        <Card>
          <h1 className="text-3xl font-black text-blue-900">{detail.course.title}</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Code: {detail.course.code}</p>
          <p className="mt-3 max-w-3xl text-sm text-slate-600">{detail.course.description || 'No class description provided yet.'}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Instructor</p>
              <p className="mt-1 text-base font-black text-blue-900">{detail.course.instructorName}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Members</p>
              <p className="mt-1 text-base font-black text-blue-900">{detail.course.memberCount}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled</p>
              <p className="mt-1 text-base font-black text-blue-900">{toDateLabel(detail.course.enrolledAt)}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-black uppercase tracking-tight text-blue-900">Instructor Materials</h2>
            </div>
            <p className="mb-4 text-xs font-medium text-slate-500">Current schema does not yet link materials directly to course_id, so this list shows recent instructor uploads.</p>
            <div className="space-y-3">
              {detail.materials.length === 0 ? (
                <p className="text-sm text-slate-500">No materials available yet.</p>
              ) : (
                detail.materials.map((material) => (
                  <a key={material.id} href={material.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-blue-100 p-3 hover:bg-blue-50/50">
                    <p className="font-bold text-blue-900">{material.title}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{material.type} • {toDateLabel(material.created_at)}</p>
                  </a>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-black uppercase tracking-tight text-blue-900">Assigned Tasks</h2>
            </div>
            <div className="space-y-3">
              {detail.tasks.length === 0 ? (
                <p className="text-sm text-slate-500">No assigned tasks yet.</p>
              ) : (
                detail.tasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-blue-100 p-3">
                    <p className="font-bold text-blue-900">{task.title}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">{task.type} • {toDateLabel(task.created_at)}</p>
                    <p className="mt-2 text-sm text-slate-600">{task.body}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card className="border-blue-600 bg-blue-600 text-white">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Study Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Activity Timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-widest">Class Context</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
