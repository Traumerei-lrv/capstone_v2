import { supabase } from "../supabase";
import { getDemoAuthSession } from "../demoAuth";

const INSTRUCTOR_LOCAL_CLASSES_KEY = "balangkas_instructor_classes_v1";
const LOCAL_CLASS_ENROLLMENTS_KEY = "balangkas_student_class_enrollments_v1";

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message || "Failed to resolve current user.");
  }

  if (!user?.id) {
    throw new Error("No authenticated user found.");
  }

  return user.id;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function readLocalInstructorClasses() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(INSTRUCTOR_LOCAL_CLASSES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalInstructorClasses(classes) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(INSTRUCTOR_LOCAL_CLASSES_KEY, JSON.stringify(classes));
}

function readLocalClassEnrollments() {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_CLASS_ENROLLMENTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalClassEnrollments(enrollments) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(LOCAL_CLASS_ENROLLMENTS_KEY, JSON.stringify(enrollments));
}

async function resolveStudentIdentity() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user?.id) {
    return {
      mode: "supabase",
      userId: user.id,
      fullName: user.user_metadata?.full_name || "Student",
    };
  }

  const demoSession = getDemoAuthSession();
  const email = normalizeEmail(demoSession?.email);

  if (!email) {
    throw new Error("No authenticated student session found.");
  }

  return {
    mode: "local",
    userId: email,
    fullName: demoSession?.profile?.full_name || "Student",
  };
}

function latestByMission(attempts = []) {
  const missionMap = new Map();

  attempts.forEach((attempt) => {
    const current = missionMap.get(attempt.mission_id);
    const currentTime = current ? new Date(current.completed_at || current.started_at || 0).getTime() : 0;
    const nextTime = new Date(attempt.completed_at || attempt.started_at || 0).getTime();

    if (!current || nextTime >= currentTime) {
      missionMap.set(attempt.mission_id, attempt);
    }
  });

  return missionMap;
}

export async function fetchTopicsMissionData() {
  const userId = await getCurrentUserId();

  const [
    { data: topics, error: topicsError },
    { data: missions, error: missionsError },
    { data: progress, error: progressError },
    { data: missionAttempts, error: missionAttemptsError },
  ] = await Promise.all([
    supabase.from("topics").select("id, name, description").order("name", { ascending: true }),
    supabase.from("missions").select("id, topic_id, title, description, order_index").order("order_index", { ascending: true }),
    supabase.from("user_progress").select("id, mission_id, status, updated_at").eq("user_id", userId),
    supabase
      .from("mission_attempts")
      .select("id, mission_id, score, completed, started_at, completed_at")
      .eq("user_id", userId),
  ]);

  if (topicsError || missionsError || progressError || missionAttemptsError) {
    throw new Error(
      topicsError?.message ||
        missionsError?.message ||
        progressError?.message ||
        missionAttemptsError?.message ||
        "Failed to load topic progress.",
    );
  }

  const progressMap = new Map((progress || []).map((item) => [item.mission_id, item]));
  const latestAttemptMap = latestByMission(missionAttempts || []);

  const topicsWithMissions = (topics || []).map((topic) => {
    const topicMissions = (missions || [])
      .filter((mission) => mission.topic_id === topic.id)
      .map((mission) => {
        const progressRecord = progressMap.get(mission.id);
        const attempt = latestAttemptMap.get(mission.id);

        const status = progressRecord?.status || (attempt?.completed ? "completed" : "not_started");
        const score = typeof attempt?.score === "number" ? attempt.score : null;

        return {
          ...mission,
          status,
          score,
          completed: Boolean(attempt?.completed || status === "completed"),
        };
      });

    const completedCount = topicMissions.filter((mission) => mission.completed).length;
    const scoreValues = topicMissions.map((mission) => mission.score).filter((score) => typeof score === "number");
    const averageScore = scoreValues.length
      ? Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length)
      : 0;

    return {
      ...topic,
      missions: topicMissions,
      missionCount: topicMissions.length,
      completedCount,
      progressPercent: topicMissions.length ? Math.round((completedCount / topicMissions.length) * 100) : 0,
      averageScore,
    };
  });

  return {
    topics: topicsWithMissions,
    recentMissionAttempts: (missionAttempts || [])
      .slice()
      .sort((a, b) => new Date(b.completed_at || b.started_at || 0) - new Date(a.completed_at || a.started_at || 0))
      .slice(0, 6),
  };
}

export async function fetchChallengesData() {
  const userId = await getCurrentUserId();

  const [
    { data: challenges, error: challengesError },
    { data: attempts, error: attemptsError },
  ] = await Promise.all([
    supabase.from("challenges").select("id, topic_id, title, description, reward_points, created_at").order("created_at", { ascending: false }),
    supabase.from("challenge_attempts").select("id, challenge_id, completed, score, created_at").eq("user_id", userId),
  ]);

  if (challengesError || attemptsError) {
    throw new Error(challengesError?.message || attemptsError?.message || "Failed to load challenges.");
  }

  const attemptGroups = (attempts || []).reduce((acc, attempt) => {
    if (!acc[attempt.challenge_id]) {
      acc[attempt.challenge_id] = [];
    }
    acc[attempt.challenge_id].push(attempt);
    return acc;
  }, {});

  return (challenges || []).map((challenge) => {
    const challengeAttempts = attemptGroups[challenge.id] || [];
    const bestScore = challengeAttempts.length
      ? Math.max(...challengeAttempts.map((attempt) => attempt.score || 0))
      : 0;
    const completed = challengeAttempts.some((attempt) => attempt.completed);

    return {
      ...challenge,
      attempts: challengeAttempts.length,
      bestScore,
      completed,
      completionPercent: completed ? 100 : Math.min(bestScore, 95),
    };
  });
}

export async function fetchAssessmentsData() {
  const userId = await getCurrentUserId();

  const [
    { data: assessments, error: assessmentsError },
    { data: questions, error: questionsError },
    { data: choices, error: choicesError },
    { data: attempts, error: attemptsError },
  ] = await Promise.all([
    supabase.from("assessments").select("id, topic_id, mission_id, title, type, total_points, created_at").order("created_at", { ascending: false }),
    supabase.from("questions").select("id, assessment_id, prompt, difficulty, question_type").order("created_at", { ascending: true }),
    supabase.from("choices").select("id, question_id, label, is_correct"),
    supabase
      .from("assessment_attempts")
      .select("id, assessment_id, score, started_at, completed_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false }),
  ]);

  if (assessmentsError || questionsError || choicesError || attemptsError) {
    throw new Error(
      assessmentsError?.message ||
        questionsError?.message ||
        choicesError?.message ||
        attemptsError?.message ||
        "Failed to load assessments.",
    );
  }

  const choicesByQuestion = (choices || []).reduce((acc, choice) => {
    if (!acc[choice.question_id]) {
      acc[choice.question_id] = [];
    }
    acc[choice.question_id].push(choice);
    return acc;
  }, {});

  const questionsByAssessment = (questions || []).reduce((acc, question) => {
    if (!acc[question.assessment_id]) {
      acc[question.assessment_id] = [];
    }
    acc[question.assessment_id].push({
      ...question,
      choices: choicesByQuestion[question.id] || [],
    });
    return acc;
  }, {});

  const latestAttemptByAssessment = new Map();
  (attempts || []).forEach((attempt) => {
    if (!latestAttemptByAssessment.has(attempt.assessment_id)) {
      latestAttemptByAssessment.set(attempt.assessment_id, attempt);
    }
  });

  return (assessments || []).map((assessment) => {
    const normalizedType = String(assessment.type || "").toLowerCase();
    const latestAttempt = latestAttemptByAssessment.get(assessment.id);

    return {
      ...assessment,
      mode: normalizedType.includes("pre") ? "pre" : normalizedType.includes("post") ? "post" : "general",
      questions: questionsByAssessment[assessment.id] || [],
      latestAttempt,
    };
  });
}

export async function fetchMaterialsData() {
  const { data, error } = await supabase
    .from("materials")
    .select("id, topic_id, mission_id, title, type, url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load learning materials.");
  }

  return data || [];
}

export async function fetchGamificationData() {
  const userId = await getCurrentUserId();

  const [
    { data: points, error: pointsError },
    { data: userAchievements, error: userAchievementsError },
  ] = await Promise.all([
    supabase.from("user_points").select("user_id, total_points, updated_at").eq("user_id", userId).maybeSingle(),
    supabase
      .from("user_achievements")
      .select("id, created_at, achievements(id, title, description, points)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (pointsError || userAchievementsError) {
    throw new Error(pointsError?.message || userAchievementsError?.message || "Failed to load gamification.");
  }

  return {
    points: points?.total_points || 0,
    achievements: (userAchievements || []).map((entry) => ({
      id: entry.id,
      created_at: entry.created_at,
      ...(entry.achievements || {}),
    })),
  };
}

export async function fetchAnnouncementsData() {
  const { data, error } = await supabase
    .from("announcements")
    .select("id, scope, course_id, section_id, title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(error.message || "Failed to load announcements.");
  }

  return data || [];
}

export async function fetchStudentDashboardData() {
  const [topicPayload, challenges, assessments, materials, gamification, announcements] = await Promise.all([
    fetchTopicsMissionData(),
    fetchChallengesData(),
    fetchAssessmentsData(),
    fetchMaterialsData(),
    fetchGamificationData(),
    fetchAnnouncementsData(),
  ]);

  const missionScores = topicPayload.topics
    .flatMap((topic) => topic.missions)
    .map((mission) => mission.score)
    .filter((score) => typeof score === "number");
  const challengeScores = challenges.map((challenge) => challenge.bestScore).filter((score) => typeof score === "number");
  const assessmentScores = assessments
    .map((assessment) => assessment.latestAttempt?.score)
    .filter((score) => typeof score === "number");

  const avg = (values) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0);

  return {
    topics: topicPayload.topics,
    recentMissionAttempts: topicPayload.recentMissionAttempts,
    challenges,
    assessments,
    materials,
    gamification,
    announcements,
    performance: {
      missionAverage: avg(missionScores),
      challengeAverage: avg(challengeScores),
      assessmentAverage: avg(assessmentScores),
      consistency: Math.min(100, Math.round((topicPayload.recentMissionAttempts.length / 6) * 100)),
    },
  };
}

export async function recordMissionAttempt({ missionId, score, completed }) {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from("mission_attempts").insert({
    mission_id: missionId,
    user_id: userId,
    score,
    completed,
    completed_at: completed ? new Date().toISOString() : null,
  });

  if (error) {
    throw new Error(error.message || "Failed to save mission attempt.");
  }
}

export async function upsertMissionProgress({ missionId, status }) {
  const userId = await getCurrentUserId();

  const { data: existing, error: lookupError } = await supabase
    .from("user_progress")
    .select("id")
    .eq("user_id", userId)
    .eq("mission_id", missionId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message || "Failed to update mission progress.");
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("user_progress")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message || "Failed to update mission progress.");
    }

    return;
  }

  const { error } = await supabase.from("user_progress").insert({
    user_id: userId,
    mission_id: missionId,
    status,
  });

  if (error) {
    throw new Error(error.message || "Failed to create mission progress.");
  }
}

export async function recordChallengeAttempt({ challengeId, score, completed }) {
  const userId = await getCurrentUserId();

  const { error } = await supabase.from("challenge_attempts").insert({
    challenge_id: challengeId,
    user_id: userId,
    score,
    completed,
  });

  if (error) {
    throw new Error(error.message || "Failed to save challenge attempt.");
  }
}

export async function submitAssessmentAttempt({ assessmentId, score }) {
  const userId = await getCurrentUserId();
  const now = new Date().toISOString();

  const { error } = await supabase.from("assessment_attempts").insert({
    assessment_id: assessmentId,
    user_id: userId,
    score,
    started_at: now,
    completed_at: now,
  });

  if (error) {
    throw new Error(error.message || "Failed to submit assessment attempt.");
  }
}

export async function addUserPoints(deltaPoints) {
  const userId = await getCurrentUserId();

  const { data: existing, error: lookupError } = await supabase
    .from("user_points")
    .select("total_points")
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(lookupError.message || "Failed to update points.");
  }

  const nextTotal = Math.max(0, (existing?.total_points || 0) + deltaPoints);

  const { error } = await supabase.from("user_points").upsert({
    user_id: userId,
    total_points: nextTotal,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message || "Failed to update points.");
  }
}

export async function fetchEnrolledClasses() {
  const identity = await resolveStudentIdentity();

  if (identity.mode === "local") {
    const classes = readLocalInstructorClasses();
    const enrollments = readLocalClassEnrollments().filter((entry) => entry.student_id === identity.userId);

    return enrollments
      .map((entry) => {
        const classItem = classes.find((item) => item.id === entry.class_id);

        if (!classItem?.id) return null;

        return {
          enrollmentId: entry.id,
          enrolledAt: entry.created_at,
          roleInCourse: "student",
          courseId: classItem.id,
          code: classItem.code,
          title: classItem.name,
          description: `Section ${classItem.section}`,
          instructorId: classItem.instructor_id || "local-instructor",
          instructorName: classItem.instructor_name || "Instructor",
          createdAt: classItem.created_at || null,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.enrolledAt || 0) - new Date(a.enrolledAt || 0));
  }

  const userId = identity.userId;

  const { data, error } = await supabase
    .from("course_enrollments")
    .select(`
      id,
      created_at,
      role_in_course,
      course_id,
      courses (
        id,
        code,
        title,
        description,
        instructor_id,
        created_at,
        profiles!courses_instructor_id_fkey (
          full_name
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load enrolled classes.");
  }

  return (data || [])
    .map((entry) => {
      const course = entry.courses;
      if (!course?.id) return null;

      return {
        enrollmentId: entry.id,
        enrolledAt: entry.created_at,
        roleInCourse: entry.role_in_course,
        courseId: course.id,
        code: course.code,
        title: course.title,
        description: course.description,
        instructorId: course.instructor_id,
        instructorName: course.profiles?.full_name || "Instructor",
        createdAt: course.created_at,
      };
    })
    .filter(Boolean);
}

export async function joinClassByCode(codeInput) {
  const identity = await resolveStudentIdentity();
  const code = String(codeInput || "").trim().toUpperCase();

  if (!code) {
    throw new Error("Please enter a class code.");
  }

  if (identity.mode === "local") {
    const classes = readLocalInstructorClasses();
    const classItem = classes.find((entry) => String(entry.code || "").toUpperCase() === code);

    if (!classItem?.id) {
      throw new Error("Invalid class code. Please check and try again.");
    }

    const enrollments = readLocalClassEnrollments();
    const existing = enrollments.find((entry) => entry.student_id === identity.userId && entry.class_id === classItem.id);

    if (existing?.id) {
      return { joined: false, alreadyEnrolled: true, courseId: classItem.id };
    }

    const nowIso = new Date().toISOString();
    enrollments.push({
      id: `LENR-${Date.now()}`,
      student_id: identity.userId,
      class_id: classItem.id,
      role_in_course: "student",
      created_at: nowIso,
    });
    writeLocalClassEnrollments(enrollments);

    const nextClasses = classes.map((entry) => {
      if (entry.id !== classItem.id) return entry;

      const hasMember = (entry.members || []).some((member) => member.id === identity.userId);
      if (hasMember) return entry;

      return {
        ...entry,
        members: [
          ...(entry.members || []),
          {
            id: identity.userId,
            name: identity.fullName,
            status: "Joined",
          },
        ],
      };
    });

    writeLocalInstructorClasses(nextClasses);

    return { joined: true, alreadyEnrolled: false, courseId: classItem.id };
  }

  const userId = identity.userId;
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, code, title")
    .eq("code", code)
    .maybeSingle();

  if (courseError) {
    throw new Error(courseError.message || "Failed to validate class code.");
  }

  if (!course?.id) {
    throw new Error("Invalid class code. Please check and try again.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message || "Failed to check enrollment.");
  }

  if (existing?.id) {
    return { joined: false, alreadyEnrolled: true, courseId: course.id };
  }

  const { error: insertError } = await supabase.from("course_enrollments").insert({
    user_id: userId,
    course_id: course.id,
    role_in_course: "student",
  });

  if (insertError) {
    throw new Error(insertError.message || "Failed to join class.");
  }

  return { joined: true, alreadyEnrolled: false, courseId: course.id };
}

export async function fetchClassDetailForStudent(courseId) {
  const identity = await resolveStudentIdentity();

  if (identity.mode === "local") {
    const enrollments = readLocalClassEnrollments();
    const enrollment = enrollments.find((entry) => entry.student_id === identity.userId && entry.class_id === courseId);

    if (!enrollment?.id) {
      throw new Error("You are not enrolled in this class.");
    }

    const classes = readLocalInstructorClasses();
    const classItem = classes.find((entry) => entry.id === courseId);

    if (!classItem?.id) {
      throw new Error("Class not found.");
    }

    return {
      course: {
        id: classItem.id,
        code: classItem.code,
        title: classItem.name,
        description: `Section ${classItem.section}`,
        instructorId: classItem.instructor_id || "local-instructor",
        instructorName: classItem.instructor_name || "Instructor",
        createdAt: classItem.created_at || null,
        enrolledAt: enrollment.created_at,
        memberCount: (classItem.members || []).length,
      },
      materials: (classItem.materials || []).map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        url: item.url || "#",
        created_at: item.uploadedAt,
        source: "instructor_uploads",
      })),
      tasks: (classItem.activities || []).map((item) => ({
        id: `act-${item.id}`,
        title: item.title,
        type: item.type || "Activity",
        body: `Topic: ${item.topic || "General"}`,
        created_at: item.assignedAt,
      })),
    };
  }

  const userId = identity.userId;

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("course_enrollments")
    .select(`
      id,
      created_at,
      course_id,
      courses (
        id,
        code,
        title,
        description,
        instructor_id,
        created_at,
        profiles!courses_instructor_id_fkey (
          full_name
        )
      )
    `)
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (enrollmentError) {
    throw new Error(enrollmentError.message || "Failed to load class enrollment.");
  }

  if (!enrollment?.courses?.id) {
    throw new Error("You are not enrolled in this class.");
  }

  const instructorId = enrollment.courses.instructor_id;

  const [{ data: classmates }, { data: announcements }, { data: materials }, { data: tasks }] = await Promise.all([
    supabase.from("course_enrollments").select("id").eq("course_id", courseId),
    supabase
      .from("announcements")
      .select("id, title, body, created_at, scope")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("materials")
      .select("id, title, type, url, created_at, created_by")
      .eq("created_by", instructorId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("assessments")
      .select("id, title, type, total_points, created_at, created_by")
      .eq("created_by", instructorId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    course: {
      id: enrollment.courses.id,
      code: enrollment.courses.code,
      title: enrollment.courses.title,
      description: enrollment.courses.description,
      instructorId,
      instructorName: enrollment.courses.profiles?.full_name || "Instructor",
      createdAt: enrollment.courses.created_at,
      enrolledAt: enrollment.created_at,
      memberCount: (classmates || []).length,
    },
    materials: (materials || []).map((item) => ({
      ...item,
      source: "instructor_uploads",
    })),
    tasks: [
      ...(announcements || []).map((item) => ({
        id: `ann-${item.id}`,
        title: item.title,
        type: "Announcement",
        body: item.body,
        created_at: item.created_at,
      })),
      ...(tasks || []).map((item) => ({
        id: `assess-${item.id}`,
        title: item.title,
        type: String(item.type || "Assessment"),
        body: `Total points: ${item.total_points || 0}`,
        created_at: item.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)),
  };
}
