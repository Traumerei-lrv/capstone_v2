import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, KeyRound, Loader2, Users } from 'lucide-react';
import { fetchEnrolledClasses, joinClassByCode } from '../../../api/studentDashboard';

const Card = ({ children, className = '' }) => <section className={`rounded-2xl border-2 border-blue-100 bg-white p-6 ${className}`}>{children}</section>;

function toDateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MaterialsTab() {
  const navigate = useNavigate();
  const [classCode, setClassCode] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadClasses() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchEnrolledClasses();
      setClasses(data);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load joined classes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClasses();
  }, []);

  const classCodes = useMemo(() => new Set(classes.map((entry) => entry.code)), [classes]);

  async function handleJoin() {
    setError('');
    setSuccess('');
    const normalized = classCode.trim().toUpperCase();
    if (!normalized) {
      setError('Enter a class code first.');
      return;
    }

    if (classCodes.has(normalized)) {
      setError('You are already enrolled in this class.');
      return;
    }

    setJoining(true);
    try {
      const result = await joinClassByCode(normalized);
      if (result.alreadyEnrolled) {
        setError('You are already enrolled in this class.');
      } else {
        setSuccess('Class joined successfully.');
      }
      setClassCode('');
      await loadClasses();
    } catch (joinError) {
      setError(joinError.message || 'Unable to join class.');
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-blue-900">Class Registry</h1>
        <p className="mt-2 font-medium text-slate-500">Join a course with your instructor code, then open your class workspace.</p>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black uppercase tracking-tight text-blue-900">Join Via Class Code</h2>
        </div>
        <p className="mb-4 text-xs font-medium text-slate-500">Use your instructor-provided course code from the class invitation.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={classCode}
            onChange={(event) => setClassCode(event.target.value.toUpperCase())}
            placeholder="Q8M4TZ"
            className="flex-1 rounded-xl border-2 border-blue-100 bg-blue-50 px-4 py-3 text-center font-mono text-sm font-bold tracking-widest text-slate-700 outline-none focus:border-blue-300"
          />
          <button
            type="button"
            onClick={handleJoin}
            disabled={joining}
            className="rounded-xl bg-blue-700 px-6 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {joining ? 'Joining...' : 'Join Class'}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}
        {success ? <p className="mt-3 text-sm font-semibold text-emerald-600">{success}</p> : null}
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black uppercase tracking-tight text-blue-900">Joined Classes</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading classes...
          </div>
        ) : classes.length === 0 ? (
          <p className="text-sm text-slate-500">No joined classes yet. Enter a valid class code to enroll.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {classes.map((entry) => (
              <button
                key={entry.courseId}
                type="button"
                onClick={() => navigate(`/playershipdashboard/class/${entry.courseId}`)}
                className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-left transition hover:border-blue-300 hover:bg-blue-100/70"
              >
                <p className="text-lg font-black text-blue-900">{entry.title}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">Code: {entry.code}</p>
                <p className="mt-3 text-sm font-semibold text-slate-700">Instructor: {entry.instructorName}</p>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Enrolled
                  </span>
                  <span>Joined {toDateLabel(entry.enrolledAt)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="bg-blue-600 text-white border-blue-600">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h2 className="text-lg font-black uppercase tracking-tight">Class Tip</h2>
        </div>
        <p className="mt-3 text-sm text-blue-100">Open a joined class card to view instructor materials and assigned tasks in one place.</p>
      </Card>
    </div>
  );
}
