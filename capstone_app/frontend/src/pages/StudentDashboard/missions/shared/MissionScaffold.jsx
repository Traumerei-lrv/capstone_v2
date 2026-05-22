import { useEffect, useMemo, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { recordMissionAttempt, upsertMissionProgress } from '../../../../api/studentDashboard';
import { Trophy, MessageCircleQuestion, Sparkles, CheckCircle, XCircle } from 'lucide-react';

const STAGES = [
  { key: 'pre-test', label: 'Pre-test' },
  { key: 'intro', label: 'Introduction' },
  { key: 'problem', label: 'Problem' },
  { key: 'post-test', label: 'Post-test' },
];

const TOWER_LABELS = ['A', 'B', 'C'];

function getRecursionPhaseLabel(phase) {
  if (phase === 'return') return 'Return';
  if (phase === 'base') return 'Base Case';
  if (phase === 'move') return 'Move';
  return 'Call';
}

function ChoiceList({ prompt, choices, selectedIndex, onSelect, accent, title, disabled = false }) {
  return (
    <section className="rounded-[1.2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{title}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{prompt}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Multiple Choice</span>
      </div>
      <div className="grid gap-3">
        {choices.map((choice, index) => {
          const active = selectedIndex === index;
          return (
            <button
              key={choice}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(index)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${active ? 'bg-white shadow-sm' : 'bg-slate-50 hover:bg-white'} ${disabled ? 'cursor-default opacity-90' : ''}`}
              style={{ borderColor: active ? accent : 'rgba(148,163,184,0.2)' }}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold" style={{ borderColor: active ? accent : '#cbd5e1', color: active ? accent : '#64748b' }}>
                {String.fromCharCode(65 + index)}
              </span>
              {choice}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MissionShellCard({ title, accent, eyebrow, children }) {
  return (
    <section className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="bg-gradient-to-r px-5 py-5 text-white sm:px-6" style={{ backgroundImage: `linear-gradient(90deg, ${accent} 0%, ${accent}cc 100%)` }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{title}</h2>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function MissionScaffold({ mission }) {
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);
  const [recursionStepIndex, setRecursionStepIndex] = useState(0);
  const preQuestions = mission.preTest.questions || [
    {
      prompt: mission.preTest.prompt,
      choices: mission.preTest.choices,
      correctIndex: mission.preTest.correctIndex,
    },
  ];
  const [preAnswers, setPreAnswers] = useState(() => preQuestions.map(() => null));
  const [preQuestionIndex, setPreQuestionIndex] = useState(0);
  const [postAnswer, setPostAnswer] = useState(null);
  const [codeDraft, setCodeDraft] = useState(mission.codeStarter);
  const [problemDraft, setProblemDraft] = useState(mission.problem?.starter || '');
  const [statusMessage, setStatusMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreTestPrompt, setShowPreTestPrompt] = useState(true);
  const [preTestSubmitted, setPreTestSubmitted] = useState(false);
  const [preTestResult, setPreTestResult] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [detailedResults, setDetailedResults] = useState(null);
  const [problemSubmitted, setProblemSubmitted] = useState(false);
  const [problemResult, setProblemResult] = useState(null);

  const progressPercent = useMemo(() => {
    if (STAGES.length <= 1) {
      return 0;
    }

    return Math.round((stageIndex / (STAGES.length - 1)) * 100);
  }, [stageIndex]);

  const currentStage = STAGES[stageIndex];
  const isRecursionMission = mission.key === 'recursion';
  const recursionVisualization = mission.recursionVisualization;
  const recursionSteps = recursionVisualization?.steps || [];
  const recursionFrameDuration = recursionVisualization?.frameDurationMs || 1400;
  const allPreTestAnswered = preAnswers.every((answer) => answer !== null);
  const preCorrectCount = preQuestions.reduce((count, question, index) => count + (preAnswers[index] === question.correctIndex ? 1 : 0), 0);
  const preScore = preTestSubmitted ? Math.round((preCorrectCount / preQuestions.length) * 100) : 0;
  const problemScore = problemSubmitted ? problemResult?.score || 0 : 0;
  const postScore = postAnswer === mission.postTest.correctIndex ? 100 : postAnswer === null ? 0 : 50;
  const codeScore = codeDraft.trim().length > 12 ? 100 : 40;

  async function handleCompleteMission() {
    setSaving(true);
    setStatusMessage('Saving sample score to Supabase...');

    try {
      const score = Math.round((preScore + problemScore + postScore + codeScore) / 4);
      if (isUuid(mission.missionId)) {
        await recordMissionAttempt({ missionId: mission.missionId, score, completed: true });
        await upsertMissionProgress({ missionId: mission.missionId, status: 'completed' });
        setStatusMessage(`Saved sample score: ${score}%`);
      } else {
        setStatusMessage(`Scaffold score: ${score}%. Add a real mission UUID in the DB before enabling saves.`);
      }
    } catch (error) {
      setStatusMessage(error.message || 'Failed to save sample mission result.');
    } finally {
      setSaving(false);
    }
  }

  function openPreTest() {
    setStageIndex(0);
    setShowPreTestPrompt(false);
    setPreAnswers(preQuestions.map(() => null));
    setPreQuestionIndex(0);
    setPreTestSubmitted(false);
    setPreTestResult(null);
    setShowScoreModal(false);
    setProblemSubmitted(false);
    setProblemResult(null);
    setStatusMessage('');
  }

  function submitPreTest() {
    const correctCount = preQuestions.reduce((count, question, index) => count + (preAnswers[index] === question.correctIndex ? 1 : 0), 0);
    const total = preQuestions.length;
    const score = Math.round((correctCount / total) * 100);

    setPreTestSubmitted(true);
    setPreTestResult({ correctCount, total, score });
    setStatusMessage(`Pre-test complete. You scored ${score}%.`);
    // build per-question detailed results for review
    const results = preQuestions.map((question, index) => ({
      prompt: question.prompt,
      choices: question.choices,
      correctIndex: question.correctIndex,
      userIndex: preAnswers[index],
      isCorrect: preAnswers[index] === question.correctIndex,
      explanation: question.explanation || '',
    }));
    setDetailedResults(results);
    setShowScoreModal(true);
  }

  function continueToIntroduction() {
    setShowScoreModal(false);
    setStageIndex(1);
    setStatusMessage('Introduction unlocked.');
  }

  function submitProblem() {
    const requiredFragments = mission.problem?.requiredFragments || [];
    const normalizedDraft = problemDraft.toLowerCase();
    const matches = requiredFragments.filter((fragment) => normalizedDraft.includes(fragment.toLowerCase())).length;
    const score = requiredFragments.length ? Math.round((matches / requiredFragments.length) * 100) : 100;
    const solved = score >= 70;

    setProblemSubmitted(true);
    setProblemResult({ score, solved });
    setStatusMessage(solved ? 'Problem solved. You can continue to the post-test.' : 'Problem submitted. Try improving your solution before moving on.');
  }

  const currentPreQuestion = preQuestions[preQuestionIndex];
  const isLastPreQuestion = preQuestionIndex === preQuestions.length - 1;
  const canGoNextPreQuestion = preAnswers[preQuestionIndex] !== null;

  useEffect(() => {
    const supportsRecursionPlayback = currentStage?.key === 'intro' || currentStage?.key === 'problem';
    if (!supportsRecursionPlayback || !isRecursionMission || recursionSteps.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setRecursionStepIndex((current) => (current + 1) % recursionSteps.length);
    }, recursionFrameDuration);

    return () => window.clearInterval(intervalId);
  }, [currentStage?.key, isRecursionMission, recursionFrameDuration, recursionSteps.length]);

  useEffect(() => {
    if (currentStage?.key !== 'intro' && currentStage?.key !== 'problem') {
      setRecursionStepIndex(0);
    }
  }, [currentStage?.key]);

  function continueToProblem() {
    setStageIndex(2);
    setStatusMessage('Problem unlocked.');
  }

  function continueToPostTest() {
    setStageIndex(3);
    setStatusMessage('Post-test unlocked.');
  }

  function handleFooterBack() {
    if (stageIndex > 0) {
      setStageIndex((s) => Math.max(0, s - 1));
    } else {
      navigate('/playershipdashboard');
    }
  }

  function handleFooterNext() {
    if (currentStage?.key === 'intro') {
      continueToProblem();
      return;
    }

    if (currentStage?.key === 'problem') {
      // evaluate the problem the same way submitProblem does, and proceed if solved
      const requiredFragments = mission.problem?.requiredFragments || [];
      const normalizedDraft = problemDraft.toLowerCase();
      const matches = requiredFragments.filter((fragment) => normalizedDraft.includes(fragment.toLowerCase())).length;
      const score = requiredFragments.length ? Math.round((matches / requiredFragments.length) * 100) : 100;
      const solved = score >= 70;

      setProblemSubmitted(true);
      setProblemResult({ score, solved });
      setStatusMessage(solved ? 'Problem solved. You can continue to the post-test.' : 'Problem submitted. Try improving your solution before moving on.');

      if (solved) {
        continueToPostTest();
      }
      return;
    }

    // default: advance one stage if possible
    setStageIndex((s) => Math.min(STAGES.length - 1, s + 1));
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ff_0%,#e7f3fb_100%)] px-3 py-3 text-slate-800 sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1400px] flex-col gap-3">
        {showPreTestPrompt ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-8">
              <div className="flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                  <Trophy className="h-10 w-10" />
                </div>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  <MessageCircleQuestion className="h-7 w-7" />
                </div>
                <div className="relative flex-1 rounded-[1.6rem] rounded-tl-md border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-400">Mission Guide</p>
                  <p className="mt-2 text-base leading-7 text-slate-700">
                    Before we begin with this topic, answer this pre-test so we can assess your prior knowledge.
                  </p>
                  <div className="absolute -left-2 top-5 h-0 w-0 border-y-[10px] border-y-transparent border-r-[12px] border-r-slate-200" />
                </div>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pre-test</p>
                    <p className="text-sm text-slate-600">A short quiz will appear before the lesson starts.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => navigate('/playershipdashboard')} className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={openPreTest} className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                  Take quiz
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {showScoreModal && preTestResult ? (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-8">
              <div className="flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                  <Trophy className="h-10 w-10" />
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Quiz Result</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">You scored {preTestResult.score}%</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {preTestResult.correctCount}/{preTestResult.total} questions were answered correctly.
                </p>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">Continue to Introduction</p>
                    <p className="text-sm text-slate-600">Proceed to the lesson after reviewing your pre-test score.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={continueToIntroduction}
                  className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Continue to Introduction
                </button>
              </div>
              {detailedResults ? (
                <div className="mt-6 max-h-[40vh] overflow-auto">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">Review Your Answers</h3>
                  <div className="space-y-3">
                    {detailedResults.map((res, idx) => (
                      <div key={idx} className="rounded-[1rem] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {res.isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-emerald-500" />
                            ) : (
                              <XCircle className="h-6 w-6 text-rose-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{idx + 1}. {res.prompt}</p>
                            <div className="mt-3 space-y-2">
                              {res.choices.map((choice, cIdx) => {
                                const isUser = res.userIndex === cIdx;
                                const isCorrect = res.correctIndex === cIdx;
                                return (
                                  <div key={cIdx} className={`rounded-md border px-3 py-2 text-sm ${isCorrect ? 'bg-emerald-50 border-emerald-200' : isUser ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
                                    <div className="flex items-center gap-3">
                                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-slate-600">{String.fromCharCode(65 + cIdx)}</span>
                                      <span className="flex-1 text-sm text-slate-700">{choice}</span>
                                      {isUser && !isCorrect ? <span className="ml-3 rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-600">Your answer</span> : null}
                                      {isCorrect ? <span className="ml-3 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Correct</span> : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {res.explanation ? <p className="mt-3 text-sm text-slate-600">Explanation: {res.explanation}</p> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <header className="rounded-[1.35rem] border border-white/70 bg-white/85 px-4 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1 min-w-[260px]">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">{mission.stageLabel}</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900 sm:text-4xl">{mission.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{mission.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button type="button" onClick={() => navigate('/playershipdashboard')} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-700">
                Back to Missions
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-full bg-slate-200/80 p-1">
            <div className="h-2 rounded-full bg-gradient-to-r" style={{ width: `${progressPercent}%`, backgroundImage: `linear-gradient(90deg, ${mission.accent} 0%, ${mission.accent}dd 100%)` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Your Progress</span>
            <span>{progressPercent}%</span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {currentStage?.key === 'pre-test' ? (
            <div className="space-y-3">
              <MissionShellCard title="Pre-test" accent={mission.accent} eyebrow="Knowledge Check">
                <p className="text-sm leading-6 text-slate-600">Answer all five questions before you move into the lesson introduction.</p>
                <div className="mt-5 space-y-4">
                  <ChoiceList
                    key={`${currentPreQuestion.prompt}-${preQuestionIndex}`}
                    title={`Question ${preQuestionIndex + 1} of ${preQuestions.length}`}
                    prompt={currentPreQuestion.prompt}
                    choices={currentPreQuestion.choices}
                    selectedIndex={preAnswers[preQuestionIndex]}
                    onSelect={(choiceIndex) => {
                      const nextAnswers = [...preAnswers];
                      nextAnswers[preQuestionIndex] = choiceIndex;
                      setPreAnswers(nextAnswers);
                    }}
                    accent={mission.accent}
                    disabled={preTestSubmitted}
                  />
                </div>
              </MissionShellCard>

              <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                {!preTestSubmitted ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">Answer the current question, then move forward one step at a time.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPreQuestionIndex((value) => Math.max(0, value - 1))} disabled={preQuestionIndex === 0} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Previous
                      </button>
                      {!isLastPreQuestion ? (
                        <button
                          type="button"
                          onClick={() => setPreQuestionIndex((value) => Math.min(preQuestions.length - 1, value + 1))}
                          disabled={!canGoNextPreQuestion}
                          className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: mission.accent }}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={submitPreTest}
                          disabled={!allPreTestAnswered}
                          className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: mission.accent }}
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Pre-test result</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{preTestResult?.correctCount || 0}/{preTestResult?.total || preQuestions.length} correct</p>
                      <p className="text-sm text-slate-600">You scored {preTestResult?.score || 0}%.</p>
                    </div>
                    <button type="button" onClick={continueToIntroduction} className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105" style={{ backgroundColor: mission.accent }}>
                      Continue to Introduction
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {currentStage?.key === 'intro' ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <MissionShellCard title="Introduction" accent={mission.accent} eyebrow="Theory">
                <p className="text-base leading-7 text-slate-700">{mission.introBlurb}</p>
                {Array.isArray(mission.introMockData) && mission.introMockData.length > 0 ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {mission.introMockData.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5 grid gap-3 rounded-[1.1rem] bg-slate-50 p-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {mission.introPoints.map((point) => (
                    <div key={point} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">{point}</div>
                  ))}
                </div>
                {isRecursionMission && recursionSteps.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Introduction Steps</p>
                    <div className="mt-3 grid gap-3">
                      {recursionSteps.map((step, index) => {
                        const isActive = index === recursionStepIndex;
                        const isPast = index < recursionStepIndex;
                        const borderColor = isActive ? mission.accent : isPast ? `${mission.accent}88` : 'rgba(148,163,184,0.2)';
                        const phaseStyle = getRecursionPhaseLabel(step.phase);
                        return (
                          <div
                            key={`${step.label}-${index}`}
                            className="rounded-2xl border bg-white px-4 py-3 shadow-sm transition-all duration-500"
                            style={{
                              borderColor,
                              transform: isActive ? 'translateX(2px)' : 'translateX(0)',
                              boxShadow: isActive ? `0 10px 24px ${mission.accent}22` : undefined,
                            }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: mission.accent }}>
                                  {index + 1}
                                </div>
                                <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                              </div>
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{phaseStyle}</span>
                            </div>
                            <p className="mt-2 text-xs leading-6 text-slate-600">{step.caption}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </MissionShellCard>

              <div className="flex flex-col gap-3">
                <MissionShellCard title="Visualization" accent={mission.accent} eyebrow="How it works">
                  <p className="text-sm leading-6 text-slate-600">See the topic behavior before you start editing code.</p>
                  <div className="mt-5 rounded-[1.25rem] border border-dashed p-5" style={{ borderColor: `${mission.accent}66`, backgroundColor: `${mission.accent}10` }}>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      <span>Visualization Area</span>
                      <span>{isRecursionMission ? 'Auto-play Flow' : 'Topic Flow'}</span>
                    </div>
                    {isRecursionMission && recursionSteps.length > 0 ? (
                      <div className="mt-5 space-y-4">
                        <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Sample Function</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {recursionVisualization?.functionLabel || 'factorial(n)'} with n = {recursionVisualization?.inputValue ?? 4}
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            Step {recursionStepIndex + 1} of {recursionSteps.length}: {recursionSteps[recursionStepIndex]?.caption}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Tower Of Hanoi State</p>
                          <p className="mt-2 text-xs leading-5 text-slate-600">Current recursion frame visualized as tower positions.</p>
                          {recursionSteps[recursionStepIndex]?.pegs ? (
                            <div className="mt-4 grid grid-cols-3 gap-3">
                              {TOWER_LABELS.map((tower) => {
                                const disks = recursionSteps[recursionStepIndex]?.pegs?.[tower] || [];
                                return (
                                  <div key={tower} className="rounded-xl border border-slate-200 bg-slate-50 px-3 pb-3 pt-2">
                                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tower {tower}</p>
                                    <div className="mt-2 flex h-28 flex-col-reverse items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-white p-2">
                                      <div className="h-[3px] w-12 rounded-full bg-slate-400" />
                                      {disks.map((disk) => (
                                        <div
                                          key={`${tower}-disk-${disk}`}
                                          className="h-3 rounded-full"
                                          style={{
                                            width: `${18 + disk * 12}px`,
                                            backgroundColor: disk === 3 ? '#1d4ed8' : disk === 2 ? '#60a5fa' : '#93c5fd',
                                          }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>

                        <div className="h-2 rounded-full bg-white/80 p-[2px]">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round(((recursionStepIndex + 1) / recursionSteps.length) * 100)}%`,
                              backgroundColor: mission.accent,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {mission.visualNodes.map((node, index) => (
                          <div key={node} className="rounded-2xl border bg-white p-4 text-center shadow-sm" style={{ borderColor: index === 0 ? mission.accent : 'rgba(148,163,184,0.18)' }}>
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: mission.accent }}>
                              {index + 1}
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-800">{node}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </MissionShellCard>

                <MissionShellCard title="Editable Code" accent={mission.accent} eyebrow="Practice">
                  <p className="text-sm leading-6 text-slate-600">{mission.codeHint}</p>
                  <textarea value={codeDraft} onChange={(event) => setCodeDraft(event.target.value)} className="mt-5 min-h-[240px] w-full rounded-[1rem] border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-sm text-slate-100 outline-none transition focus:border-slate-400" spellCheck="false" />
                </MissionShellCard>
              </div>
              <div className="lg:col-span-2 mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={continueToProblem}
                  className="rounded-full px-6 py-3 text-sm font-semibold text-slate-900"
                  style={{ backgroundImage: 'linear-gradient(90deg,#fbbf24,#f97316)' }}
                >
                  Done — Go to Problem
                </button>
              </div>
            </div>
          ) : null}

          {currentStage?.key === 'problem' ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <MissionShellCard title={mission.problem?.title || 'Problem'} accent={mission.accent} eyebrow="Challenge">
                <p className="text-base leading-7 text-slate-700">{mission.problem?.prompt}</p>
                <div className="mt-5 rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Hint</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{mission.problem?.hint}</p>
                </div>
                <div className="mt-4 grid gap-3 rounded-[1.1rem] bg-slate-50 p-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                    Input: small topic-specific example will be provided by the instructor.
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                    Goal: finish the starter code so it solves the challenge.
                  </div>
                </div>
                {problemSubmitted ? (
                  <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Problem result</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{problemResult?.score || 0}%</p>
                    <p className="text-sm text-slate-600">{problemResult?.solved ? 'Correct enough to continue.' : mission.problem?.solutionNote}</p>
                  </div>
                ) : null}
              </MissionShellCard>

              <div className="flex flex-col gap-3">
                <MissionShellCard title="Visualization" accent={mission.accent} eyebrow="How it works">
                  <p className="text-sm leading-6 text-slate-600">Keep tracing recursion while solving the problem.</p>
                  {isRecursionMission && recursionSteps.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Tower Of Hanoi State</p>
                        <p className="mt-1 text-xs text-slate-600">
                          Step {recursionStepIndex + 1} of {recursionSteps.length}: {recursionSteps[recursionStepIndex]?.caption}
                        </p>
                        {recursionSteps[recursionStepIndex]?.pegs ? (
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            {TOWER_LABELS.map((tower) => {
                              const disks = recursionSteps[recursionStepIndex]?.pegs?.[tower] || [];
                              return (
                                <div key={tower} className="rounded-xl border border-slate-200 bg-slate-50 px-3 pb-3 pt-2">
                                  <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tower {tower}</p>
                                  <div className="mt-2 flex h-28 flex-col-reverse items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-white p-2">
                                    <div className="h-[3px] w-12 rounded-full bg-slate-400" />
                                    {disks.map((disk) => (
                                      <div
                                        key={`${tower}-disk-${disk}`}
                                        className="h-3 rounded-full"
                                        style={{
                                          width: `${18 + disk * 12}px`,
                                          backgroundColor: disk === 3 ? '#1d4ed8' : disk === 2 ? '#60a5fa' : '#93c5fd',
                                        }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                      Topic visualization will appear here.
                    </div>
                  )}
                </MissionShellCard>

                <MissionShellCard title="Solve It" accent={mission.accent} eyebrow="Your Answer">
                  <p className="text-sm leading-6 text-slate-600">Edit the starter code below and submit your answer.</p>
                  <textarea
                    value={problemDraft}
                    onChange={(event) => setProblemDraft(event.target.value)}
                    className="mt-5 min-h-[280px] w-full rounded-[1rem] border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-sm text-slate-100 outline-none transition focus:border-slate-400"
                    spellCheck="false"
                  />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm text-slate-600">{problemSubmitted ? 'Submission received.' : 'Complete the problem before continuing.'}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={submitProblem}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                        style={{ backgroundColor: mission.accent }}
                      >
                        Check solution
                      </button>
                      <button
                        type="button"
                        onClick={continueToPostTest}
                        disabled={!problemSubmitted || !problemResult?.solved}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Continue to Post-test
                      </button>
                    </div>
                  </div>
                </MissionShellCard>
              </div>
            </div>
          ) : null}

          {currentStage?.key === 'post-test' ? (
            <div className="space-y-3">
              <ChoiceList title={mission.postTest.title} prompt={mission.postTest.prompt} choices={mission.postTest.choices} selectedIndex={postAnswer} onSelect={setPostAnswer} accent={mission.accent} />
              <MissionShellCard title="Review Scaffold" accent={mission.accent} eyebrow="Summary">
                <p className="text-sm leading-7 text-slate-700">{mission.reviewBlurb}</p>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Intro review placeholder</div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Visualization review placeholder</div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Code review placeholder</div>
                </div>
              </MissionShellCard>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}


