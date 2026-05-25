import { useEffect, useMemo, useState } from 'react';
import useAuth from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { recordMissionAttempt, upsertMissionProgress } from '../../../../api/studentDashboard';
import { Trophy, MessageCircleQuestion, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import RecursionHanoiVisualization from './RecursionHanoiVisualization';

const STAGES = [
  { key: 'pre-test', label: 'Pre-test' },
  { key: 'intro', label: 'Introduction' },
  { key: 'problem', label: 'Problem' },
  { key: 'post-test', label: 'Post-test' },
];
const NEXT_MISSION_PATHS = {
  introduction: '/playershipdashboard/recursion',
  recursion: '/playershipdashboard',
  iteration: '/playershipdashboard',
};

const STUDENT_SCOREBOARD_STORAGE_KEY = 'balangkas.student.scoreboard';
const INTRO_CONCEPT_ITEMS = [
  { id: 'ds-storage', text: 'A special format used to store and organize data.' },
  { id: 'adt-behavior', text: 'A logical description of how data is viewed and what operations are allowed.' },
  { id: 'adt-ops', text: 'Initializing, adding, accessing, and removing data.' },
  { id: 'algo-steps', text: 'A step-by-step set of instructions used to solve a problem.' },
];
const INTRO_CONCEPT_ZONES = [
  { key: 'data-structure', label: 'Data Structure' },
  { key: 'abstract-data-type', label: 'Abstract Data Type' },
  { key: 'adt-operation', label: 'ADT Operation' },
  { key: 'algorithm', label: 'Algorithm' },
];
const INTRO_CONCEPT_MATCHES = {
  'ds-storage': 'data-structure',
  'adt-behavior': 'abstract-data-type',
  'adt-ops': 'adt-operation',
  'algo-steps': 'algorithm',
};
const INTRO_CONCEPT_SUCCESS_FEEDBACK = 'Correct. You classified the basic DSA concepts properly.';
const INTRO_CONCEPT_REVIEW_FEEDBACK = 'Review the meaning of each concept. A data structure stores data, an ADT describes allowed operations, an operation performs an action, and an algorithm follows steps to solve a problem.';
const RECURSION_ORDER_ITEMS = [
  {
    id: 'check-base',
    text: 'Check if the base case has been reached.',
    icon: 'Base Case',
  },
  {
    id: 'stop-base',
    text: 'If the base case is reached, stop the recursion.',
    icon: 'Base Case',
  },
  {
    id: 'change-state',
    text: 'Change the state so the problem moves closer to the base case.',
    icon: 'State',
  },
  {
    id: 'recursive-call',
    text: 'Call the function again recursively.',
    icon: 'Call',
  },
];
const RECURSION_ORDER_CORRECT = ['check-base', 'stop-base', 'change-state', 'recursive-call'];
const RECURSION_ORDER_DEFAULT = ['change-state', 'recursive-call', 'check-base', 'stop-base'];
const RECURSION_ORDER_SUCCESS_FEEDBACK = 'Correct. A recursive algorithm needs a base case, a change of state, and a recursive call.';
const RECURSION_ORDER_WRONG_FEEDBACK = 'Not quite. Recursion must first check for a stopping condition before it continues calling itself.';

function getInitialIntroConceptPlacements() {
  return INTRO_CONCEPT_ITEMS.reduce((accumulator, item) => {
    accumulator[item.id] = null;
    return accumulator;
  }, {});
}

function getInitialRecursionOrder() {
  return [...RECURSION_ORDER_DEFAULT];
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

function RecursionVisualizationPanel() {
  return <RecursionHanoiVisualization />;
}

export default function MissionScaffold({ mission }) {
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);
  const [introSubtopicIndex, setIntroSubtopicIndex] = useState(0);
  const preQuestions = mission.preTest.questions || [
    {
      prompt: mission.preTest.prompt,
      choices: mission.preTest.choices,
      correctIndex: mission.preTest.correctIndex,
    },
  ];
  const [preAnswers, setPreAnswers] = useState(() => preQuestions.map(() => null));
  const [preQuestionIndex, setPreQuestionIndex] = useState(0);
  const postQuestions = mission.postTest.questions || [
    {
      prompt: mission.postTest.prompt,
      choices: mission.postTest.choices,
      correctIndex: mission.postTest.correctIndex,
    },
  ];
  const [postAnswers, setPostAnswers] = useState(() => postQuestions.map(() => null));
  const [postQuestionIndex, setPostQuestionIndex] = useState(0);
  const [postTestSubmitted, setPostTestSubmitted] = useState(false);
  const [postTestResult, setPostTestResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPreTestPrompt, setShowPreTestPrompt] = useState(true);
  const [preTestSubmitted, setPreTestSubmitted] = useState(false);
  const [preTestResult, setPreTestResult] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [detailedResults, setDetailedResults] = useState(null);
  const [problemSubmitted, setProblemSubmitted] = useState(false);
  const [problemResult, setProblemResult] = useState(null);
  const [showProblemSuccessModal, setShowProblemSuccessModal] = useState(false);
  const [selectedIntroTerm, setSelectedIntroTerm] = useState('');
  const [introConceptPlacements, setIntroConceptPlacements] = useState(() => getInitialIntroConceptPlacements());
  const [introConceptFeedback, setIntroConceptFeedback] = useState('');
  const [introConceptSolved, setIntroConceptSolved] = useState(false);
  const [recursionOrder, setRecursionOrder] = useState(() => getInitialRecursionOrder());
  const [recursionOrderFeedback, setRecursionOrderFeedback] = useState('');
  const [recursionOrderSolved, setRecursionOrderSolved] = useState(false);

  const progressPercent = useMemo(() => {
    if (STAGES.length <= 1) {
      return 0;
    }

    return Math.round((stageIndex / (STAGES.length - 1)) * 100);
  }, [stageIndex]);

  const currentStage = STAGES[stageIndex];
  const hasIntroSubtopics = Array.isArray(mission.introSubtopics) && mission.introSubtopics.length > 0;
  const currentIntroSubtopic = hasIntroSubtopics ? mission.introSubtopics[introSubtopicIndex] : null;
  const introTermDetails = currentIntroSubtopic && typeof currentIntroSubtopic.termDetails === 'object' ? currentIntroSubtopic.termDetails : null;
  const activeIntroTerm = selectedIntroTerm || currentIntroSubtopic?.terms?.[0] || '';
  const activeIntroDetail = introTermDetails && activeIntroTerm ? introTermDetails[activeIntroTerm] : '';
  const isRecursionMission = mission.key === 'recursion';
  const isIntroductionMission = mission.key === 'introduction';
  const allPreTestAnswered = preAnswers.every((answer) => answer !== null);
  const preCorrectCount = preQuestions.reduce((count, question, index) => count + (preAnswers[index] === question.correctIndex ? 1 : 0), 0);
  const preScore = preTestSubmitted ? Math.round((preCorrectCount / preQuestions.length) * 100) : 0;
  const problemScore = problemSubmitted ? problemResult?.score || 0 : 0;
  const postCorrectCount = postQuestions.reduce((count, question, index) => count + (postAnswers[index] === question.correctIndex ? 1 : 0), 0);
  const postScore = postTestSubmitted ? Math.round((postCorrectCount / postQuestions.length) * 100) : 0;
  const visualizationScore = 100;
  const introUnassignedItems = INTRO_CONCEPT_ITEMS.filter((item) => introConceptPlacements[item.id] === null);
  const introZoneAssignments = INTRO_CONCEPT_ZONES.reduce((accumulator, zone) => {
    const assignedItem = INTRO_CONCEPT_ITEMS.find((item) => introConceptPlacements[item.id] === zone.key) || null;
    accumulator[zone.key] = assignedItem;
    return accumulator;
  }, {});
  const recursionOrderCards = recursionOrder.map((id) => RECURSION_ORDER_ITEMS.find((item) => item.id === id)).filter(Boolean);

  function persistScoreboardUpdate(nextPartial) {
    try {
      const raw = window.localStorage.getItem(STUDENT_SCOREBOARD_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const missionEntry = parsed[mission.key] || {};
      const updated = {
        ...parsed,
        [mission.key]: {
          ...missionEntry,
          ...nextPartial,
          updatedAt: new Date().toISOString(),
        },
      };
      window.localStorage.setItem(STUDENT_SCOREBOARD_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('balangkas:scoreboard-updated', { detail: updated }));
    } catch (error) {
      // Keep mission flow resilient even if localStorage is unavailable.
    }
  }

  async function handleCompleteMission() {
    setSaving(true);
    setStatusMessage('Saving sample score to Supabase...');

    try {
      const score = Math.round((preScore + problemScore + postScore + visualizationScore) / 4);
      if (isUuid(mission.missionId)) {
        await recordMissionAttempt({ missionId: mission.missionId, score, completed: true });
        await upsertMissionProgress({ missionId: mission.missionId, status: 'completed' });
        setStatusMessage(`Saved sample score: ${score}%`);
      } else {
        setStatusMessage(`Lesson score: ${score}%. Add a real mission UUID in the DB before enabling saves.`);
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
    setShowProblemSuccessModal(false);
    setPostAnswers(postQuestions.map(() => null));
    setPostQuestionIndex(0);
    setPostTestSubmitted(false);
    setPostTestResult(null);
    setIntroConceptPlacements(getInitialIntroConceptPlacements());
    setIntroConceptFeedback('');
    setIntroConceptSolved(false);
    setRecursionOrder(getInitialRecursionOrder());
    setRecursionOrderFeedback('');
    setRecursionOrderSolved(false);
    setStatusMessage('');
  }

  async function handleCompleteMissionAndContinue() {
    await handleCompleteMission();
    const nextPath = NEXT_MISSION_PATHS[mission.key] || '/playershipdashboard';
    navigate(nextPath);
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
    persistScoreboardUpdate({ preTestScore: score });
  }

  function continueToIntroduction() {
    setShowScoreModal(false);
    setStageIndex(1);
    setStatusMessage('Introduction unlocked.');
  }

  function submitProblem() {
    if (problemSubmitted) {
      setShowProblemSuccessModal(true);
      return;
    }
    const score = 100;
    const solved = true;
    setProblemSubmitted(true);
    setProblemResult({ score, solved });
    setShowProblemSuccessModal(true);
    setStatusMessage('Great work. You can continue to the post-test.');
  }

  function resetIntroConceptActivity() {
    setIntroConceptPlacements(getInitialIntroConceptPlacements());
    setIntroConceptFeedback('');
    setIntroConceptSolved(false);
    setProblemSubmitted(false);
    setProblemResult(null);
    setShowProblemSuccessModal(false);
    setStatusMessage('');
  }

  function resetRecursionOrderActivity() {
    setRecursionOrder(getInitialRecursionOrder());
    setRecursionOrderFeedback('');
    setRecursionOrderSolved(false);
    setProblemSubmitted(false);
    setProblemResult(null);
    setShowProblemSuccessModal(false);
    setStatusMessage('');
  }

  function reorderRecursionSteps(draggedId, targetIndex) {
    if (!draggedId) {
      return;
    }

    setRecursionOrder((currentOrder) => {
      const fromIndex = currentOrder.indexOf(draggedId);
      if (fromIndex === -1 || fromIndex === targetIndex) {
        return currentOrder;
      }

      const nextOrder = [...currentOrder];
      nextOrder.splice(fromIndex, 1);
      nextOrder.splice(targetIndex, 0, draggedId);
      return nextOrder;
    });

    setRecursionOrderFeedback('');
    setRecursionOrderSolved(false);
    setProblemSubmitted(false);
    setProblemResult(null);
  }

  function checkRecursionOrderAnswers() {
    const isCorrect = RECURSION_ORDER_CORRECT.every((stepId, index) => recursionOrder[index] === stepId);
    if (isCorrect) {
      setRecursionOrderSolved(true);
      setRecursionOrderFeedback(RECURSION_ORDER_SUCCESS_FEEDBACK);
      submitProblem();
      return;
    }

    setRecursionOrderSolved(false);
    setRecursionOrderFeedback(RECURSION_ORDER_WRONG_FEEDBACK);
  }

  function moveIntroConceptItem(itemId, targetZoneKey) {
    setIntroConceptPlacements((currentPlacements) => {
      const sourceZoneKey = currentPlacements[itemId];
      if (sourceZoneKey === targetZoneKey) {
        return currentPlacements;
      }

      const nextPlacements = { ...currentPlacements, [itemId]: targetZoneKey };
      if (targetZoneKey !== null) {
        const occupyingItemId = Object.keys(currentPlacements).find(
          (candidateId) => candidateId !== itemId && currentPlacements[candidateId] === targetZoneKey
        );
        if (occupyingItemId) {
          nextPlacements[occupyingItemId] = sourceZoneKey ?? null;
        }
      }
      return nextPlacements;
    });

    setIntroConceptFeedback('');
    setIntroConceptSolved(false);
    setProblemSubmitted(false);
    setProblemResult(null);
  }

  function checkIntroConceptAnswers() {
    const allCorrect = INTRO_CONCEPT_ITEMS.every(
      (item) => introConceptPlacements[item.id] === INTRO_CONCEPT_MATCHES[item.id]
    );

    if (allCorrect) {
      setIntroConceptSolved(true);
      setIntroConceptFeedback('');
      submitProblem();
      return;
    }

    setIntroConceptSolved(false);
    setIntroConceptFeedback(INTRO_CONCEPT_REVIEW_FEEDBACK);
  }

  const currentPreQuestion = preQuestions[preQuestionIndex];
  const currentPostQuestion = postQuestions[postQuestionIndex];
  const isLastPreQuestion = preQuestionIndex === preQuestions.length - 1;
  const canGoNextPreQuestion = preAnswers[preQuestionIndex] !== null;
  const isLastPostQuestion = postQuestionIndex === postQuestions.length - 1;
  const canGoNextPostQuestion = postAnswers[postQuestionIndex] !== null;

  useEffect(() => {
    if (currentStage?.key !== 'intro') {
      setIntroSubtopicIndex(0);
    }
  }, [currentStage?.key]);

  useEffect(() => {
    if (currentStage?.key !== 'intro') {
      setSelectedIntroTerm('');
      return;
    }

    if (!hasIntroSubtopics) {
      setSelectedIntroTerm('');
      return;
    }

    const firstTerm = Array.isArray(currentIntroSubtopic?.terms) && currentIntroSubtopic.terms.length > 0 ? currentIntroSubtopic.terms[0] : '';
    setSelectedIntroTerm(firstTerm);
  }, [currentStage?.key, hasIntroSubtopics, introSubtopicIndex, currentIntroSubtopic]);

  function continueToProblem() {
    setStageIndex(2);
    setStatusMessage('Problem unlocked.');
  }

  function continueToPostTest() {
    setStageIndex(3);
    setStatusMessage('Post-test unlocked.');
  }

  useEffect(() => {
    if (currentStage?.key !== 'post-test' || !postTestSubmitted) {
      return;
    }

    persistScoreboardUpdate({ postTestScore: postScore });
  }, [currentStage?.key, postScore, postTestSubmitted]);

  function submitPostTest() {
    const correctCount = postQuestions.reduce((count, question, index) => count + (postAnswers[index] === question.correctIndex ? 1 : 0), 0);
    const total = postQuestions.length;
    const score = Math.round((correctCount / total) * 100);
    setPostTestSubmitted(true);
    setPostTestResult({ correctCount, total, score });
    setStatusMessage(`Post-test complete. You scored ${score}%.`);
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
      submitProblem();
      continueToPostTest();
      return;
    }

    // default: advance one stage if possible
    setStageIndex((s) => Math.min(STAGES.length - 1, s + 1));
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ff_0%,#e7f3fb_100%)] px-3 py-3 text-slate-800 sm:px-4 sm:py-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1400px] flex-col gap-3">
        {showProblemSuccessModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-8">
              <div className="flex items-center justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                  <CheckCircle className="h-10 w-10" />
                </div>
              </div>
              <div className="mt-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Success</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">Problem Solved</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Excellent work. You completed this checkpoint successfully.
                </p>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowProblemSuccessModal(false)}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Stay Here
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProblemSuccessModal(false);
                    continueToPostTest();
                  }}
                  className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                  style={{ backgroundColor: mission.accent }}
                >
                  Continue to Post-test
                </button>
              </div>
            </div>
          </div>
        ) : null}

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
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-400">Instructions</p>
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
            <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <MissionShellCard title="Introduction" accent={mission.accent} eyebrow="Theory">
                <>
                  <p className="text-base leading-7 text-slate-700">{mission.introBlurb}</p>
                  {hasIntroSubtopics ? (
                    <div className="mt-5 space-y-4">
                      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h4 className="text-base font-black text-slate-900">{currentIntroSubtopic.title}</h4>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                            {introSubtopicIndex + 1} / {mission.introSubtopics.length}
                          </span>
                        </div>

                        {Array.isArray(currentIntroSubtopic.terms) && currentIntroSubtopic.terms.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {currentIntroSubtopic.terms.map((term) => (
                              <button
                                key={`${currentIntroSubtopic.title}-${term}`}
                                type="button"
                                onClick={() => setSelectedIntroTerm(term)}
                                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                  activeIntroTerm === term ? 'border-blue-500 bg-blue-600 text-white' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {currentIntroSubtopic.explanation ? (
                          <p className="mt-3 text-sm leading-6 text-slate-700">{currentIntroSubtopic.explanation}</p>
                        ) : null}

                        {currentIntroSubtopic.simpleExplanation ? (
                          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Simple explanation</p>
                            <p className="mt-2 text-sm text-emerald-900">{currentIntroSubtopic.simpleExplanation}</p>
                          </div>
                        ) : null}

                        {activeIntroDetail ? (
                          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">{activeIntroTerm}</p>
                            <p className="mt-2 text-sm text-blue-900">{activeIntroDetail}</p>
                          </div>
                        ) : null}

                        {currentIntroSubtopic.guideText ? (
                          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Guide</p>
                            <p className="mt-2 text-sm text-blue-900">{currentIntroSubtopic.guideText}</p>
                          </div>
                        ) : null}
                      </section>

                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setIntroSubtopicIndex((value) => Math.max(0, value - 1))}
                          disabled={introSubtopicIndex === 0}
                          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (introSubtopicIndex === mission.introSubtopics.length - 1) {
                              continueToProblem();
                              return;
                            }
                            setIntroSubtopicIndex((value) => Math.min(mission.introSubtopics.length - 1, value + 1));
                          }}
                          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: mission.accent }}
                        >
                          {introSubtopicIndex === mission.introSubtopics.length - 1 ? 'Proceed to Activity' : 'Next'}
                        </button>
                      </div>
                    </div>
                  ) : null}
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
                </>
              </MissionShellCard>

              <div>
                <MissionShellCard title="Visualization" accent={mission.accent} eyebrow="How it works">
                  {isRecursionMission ? (
                    <RecursionVisualizationPanel />
                  ) : isIntroductionMission ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                      Introduction visualization placeholder.
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                      Topic visualization will appear here.
                    </div>
                  )}
                </MissionShellCard>
              </div>
              {!hasIntroSubtopics ? (
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
              ) : null}
            </div>
          ) : null}

          {currentStage?.key === 'problem' ? (
            isIntroductionMission ? (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <MissionShellCard title="Classify the Concept" accent={mission.accent} eyebrow="CONCEPT CHALLENGE">
                  <div className="space-y-4 text-sm leading-7 text-slate-700">
                    <p>
                      Different mission statements are shown on the screen. Each statement describes a basic DSA concept.
                    </p>
                    <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Your Task</p>
                      <p className="mt-1">Drag each statement to the correct concept category.</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Goal</p>
                      <p className="mt-1">Complete the activity by showing that you understand the basic concepts of Data Structures and Algorithms. No coding is required.</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Hint</p>
                      <p className="mt-1 text-blue-900">Look at whether the statement describes storage, allowed behavior, actions, or step-by-step logic.</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Understanding Checkpoint</p>
                      <p className="mt-1">Review your answers and confirm your understanding before moving to the post-test.</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Checkpoint Prompt</p>
                      <p className="mt-1">Classify each statement as a data structure, an abstract data type, an ADT operation, or an algorithm.</p>
                    </div>
                  </div>

                  {introConceptFeedback ? (
                    <div className="mt-4 rounded-[1.1rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                      {introConceptFeedback}
                    </div>
                  ) : null}
                </MissionShellCard>

                <MissionShellCard title="Drag-and-drop Activity" accent={mission.accent} eyebrow="Activity">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Activity Type</p>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-700">
                      Drag-and-drop
                    </span>
                  </div>

                  <div
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const itemId = event.dataTransfer.getData('text/plain');
                      if (itemId) {
                        moveIntroConceptItem(itemId, null);
                      }
                    }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mission Statements</p>
                    <div className="mt-3 grid gap-2">
                      {introUnassignedItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
                          className="cursor-grab rounded-xl border border-blue-200 bg-white p-3 text-sm font-medium text-slate-700 shadow-sm active:cursor-grabbing"
                        >
                          {item.text}
                        </div>
                      ))}
                      {introUnassignedItems.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">All statements are assigned to categories.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {INTRO_CONCEPT_ZONES.map((zone) => (
                      <div
                        key={zone.key}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const itemId = event.dataTransfer.getData('text/plain');
                          if (itemId) {
                            moveIntroConceptItem(itemId, zone.key);
                          }
                        }}
                        className="rounded-2xl border border-blue-100 bg-white p-3 shadow-sm"
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">{zone.label}</p>
                        <div className="mt-2 min-h-[86px]">
                          {introZoneAssignments[zone.key] ? (
                            <div
                              draggable
                              onDragStart={(event) => event.dataTransfer.setData('text/plain', introZoneAssignments[zone.key].id)}
                              className="cursor-grab rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-slate-700 active:cursor-grabbing"
                            >
                              {introZoneAssignments[zone.key].text}
                            </div>
                          ) : (
                            <div className="flex min-h-[86px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-500">
                              Drop statement here
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={checkIntroConceptAnswers}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                      style={{ backgroundColor: mission.accent }}
                    >
                      Check Answer
                    </button>
                    <button
                      type="button"
                      onClick={resetIntroConceptActivity}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Reset
                    </button>
                  </div>
                </MissionShellCard>
              </div>
            ) : isRecursionMission ? (
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <MissionShellCard title="Arrange the Recursive Process" accent={mission.accent} eyebrow="CONCEPT CHALLENGE">
                  <div className="space-y-4 text-sm leading-7 text-slate-700">
                    <p>
                      A rescue drone is solving a mission task by repeating the same process on a smaller problem. To avoid repeating forever, it must follow the correct recursion flow.
                    </p>
                    <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Your Task</p>
                      <p className="mt-1">Arrange the recursion steps in the correct order.</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Goal</p>
                      <p className="mt-1">Complete the activity by showing that you understand how recursion works. No coding is required.</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Hint</p>
                      <p className="mt-1 text-blue-900">A recursive process must check when to stop before it continues calling itself.</p>
                    </div>
                  </div>
                </MissionShellCard>

                <MissionShellCard title="Ordering Activity" accent={mission.accent} eyebrow="Checkpoint">
                  <div className="space-y-3">
                    <div className="space-y-2 rounded-[1.1rem] border border-slate-200 bg-slate-50 p-3">
                      {recursionOrderCards.map((item, index) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(event) => event.dataTransfer.setData('text/plain', item.id)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            const draggedId = event.dataTransfer.getData('text/plain');
                            reorderRecursionSteps(draggedId, index);
                          }}
                          className="cursor-grab rounded-xl border border-blue-200 bg-white p-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 active:cursor-grabbing"
                        >
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xs font-black text-blue-700">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p>{item.text}</p>
                              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.icon}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {recursionOrderFeedback ? (
                      <div className={`rounded-xl border p-3 text-sm ${recursionOrderSolved ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
                        {recursionOrderFeedback}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={checkRecursionOrderAnswers}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                        style={{ backgroundColor: mission.accent }}
                      >
                        Check Answer
                      </button>
                      <button
                        type="button"
                        onClick={resetRecursionOrderActivity}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Reset
                      </button>
                    </div>

                  </div>
                </MissionShellCard>
              </div>
            ) : (
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
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm text-slate-600">{problemSubmitted ? 'Checkpoint completed.' : 'Mark this checkpoint complete to continue.'}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={submitProblem}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                        style={{ backgroundColor: mission.accent }}
                      >
                        Mark as understood
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

                <MissionShellCard title="Visualization" accent={mission.accent} eyebrow="How it works">
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                    Topic visualization will appear here.
                  </div>
                </MissionShellCard>
              </div>
            )
          ) : null}

          {currentStage?.key === 'post-test' ? (
            <div className="space-y-3">
              <ChoiceList
                key={`${currentPostQuestion.prompt}-${postQuestionIndex}`}
                title={`Question ${postQuestionIndex + 1} of ${postQuestions.length}`}
                prompt={currentPostQuestion.prompt}
                choices={currentPostQuestion.choices}
                selectedIndex={postAnswers[postQuestionIndex]}
                onSelect={(choiceIndex) => {
                  const nextAnswers = [...postAnswers];
                  nextAnswers[postQuestionIndex] = choiceIndex;
                  setPostAnswers(nextAnswers);
                }}
                accent={mission.accent}
                disabled={postTestSubmitted}
              />
              <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                {!postTestSubmitted ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">Answer the current question, then move forward one step at a time.</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPostQuestionIndex((value) => Math.max(0, value - 1))} disabled={postQuestionIndex === 0} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">
                        Previous
                      </button>
                      {!isLastPostQuestion ? (
                        <button
                          type="button"
                          onClick={() => setPostQuestionIndex((value) => Math.min(postQuestions.length - 1, value + 1))}
                          disabled={!canGoNextPostQuestion}
                          className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: mission.accent }}
                        >
                          Next
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={submitPostTest}
                          disabled={!postAnswers.every((answer) => answer !== null)}
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
                      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Post-test result</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{postTestResult?.correctCount || 0}/{postTestResult?.total || postQuestions.length} correct</p>
                      <p className="text-sm text-slate-600">You scored {postTestResult?.score || 0}%.</p>
                    </div>
                    <button type="button" onClick={handleCompleteMissionAndContinue} disabled={saving} className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: mission.accent }}>
                      {saving ? 'Saving...' : 'Finish and Continue'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}


