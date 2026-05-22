import { supabase } from "../supabase";

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

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function latestAttempt(attempts = [], key = "assessment_id") {
  const map = new Map();

  attempts.forEach((attempt) => {
    const attemptKey = attempt[key];
    const current = map.get(attemptKey);
    const currentTime = current ? new Date(current.completed_at || current.started_at || current.created_at || 0).getTime() : 0;
    const nextTime = new Date(attempt.completed_at || attempt.started_at || attempt.created_at || 0).getTime();

    if (!current || nextTime >= currentTime) {
      map.set(attemptKey, attempt);
    }
  });

  return map;
}

export async function fetchAdminOverview() {
  const [usersResult, coursesResult, sectionsResult, materialsResult, activityResult, missionAttemptsResult, challengeAttemptsResult, assessmentAttemptsResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, code, title, description, instructor_id, created_at").order("created_at", { ascending: false }),
    supabase.from("sections").select("id, course_id, name, instructor_id, created_at").order("created_at", { ascending: false }),
    supabase.from("materials").select("id, topic_id, mission_id, title, type, url, created_by, created_at").order("created_at", { ascending: false }),
    supabase.from("activity_logs").select("id, user_id, action, metadata, created_at").order("created_at", { ascending: false }).limit(40),
    supabase.from("mission_attempts").select("id, mission_id, user_id, score, completed, started_at, completed_at").order("started_at", { ascending: false }).limit(200),
    supabase.from("challenge_attempts").select("id, challenge_id, user_id, completed, score, created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("assessment_attempts").select("id, assessment_id, user_id, score, started_at, completed_at").order("started_at", { ascending: false }).limit(200),
  ]);

  const error =
    usersResult.error ||
    coursesResult.error ||
    sectionsResult.error ||
    materialsResult.error ||
    activityResult.error ||
    missionAttemptsResult.error ||
    challengeAttemptsResult.error ||
    assessmentAttemptsResult.error;

  if (error) {
    throw new Error(error.message || "Failed to load admin overview.");
  }

  const users = usersResult.data || [];
  const courses = coursesResult.data || [];
  const sections = sectionsResult.data || [];
  const materials = materialsResult.data || [];
  const activityLogs = activityResult.data || [];
  const missionAttempts = missionAttemptsResult.data || [];
  const challengeAttempts = challengeAttemptsResult.data || [];
  const assessmentAttempts = assessmentAttemptsResult.data || [];

  const missionScores = missionAttempts.map((attempt) => attempt.score || 0);
  const challengeScores = challengeAttempts.map((attempt) => attempt.score || 0);
  const assessmentScores = assessmentAttempts.map((attempt) => attempt.score || 0);

  const average = (values) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0);

  const recentActivity = activityLogs.slice(0, 12);
  const roleCounts = users.reduce(
    (acc, user) => {
      const role = normalizeText(user.role) || "student";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    { student: 0, instructor: 0, admin: 0 },
  );

  const materialsByType = materials.reduce((acc, material) => {
    const type = normalizeText(material.type) || "unknown";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      totalUsers: users.length,
      totalCourses: courses.length,
      totalSections: sections.length,
      totalMaterials: materials.length,
      activeUsers: Math.max(users.length - Math.floor(users.length * 0.08), 0),
    },
    roleCounts,
    materialsByType,
    usage: {
      missions: average(missionScores),
      challenges: average(challengeScores),
      assessments: average(assessmentScores),
    },
    recentActivity,
    recentUsers: users.slice(0, 12),
    courses,
    sections,
    materials,
    attempts: {
      missionAttempts: missionAttempts.slice(0, 20),
      challengeAttempts: challengeAttempts.slice(0, 20),
      assessmentAttempts: assessmentAttempts.slice(0, 20),
      latestAssessmentAttemptByAssessment: latestAttempt(assessmentAttempts),
    },
  };
}

export async function fetchAdminUsers() {
  const [usersResult, courseEnrollmentsResult, sectionEnrollmentsResult, coursesResult, sectionsResult] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }),
    supabase.from("course_enrollments").select("id, user_id, course_id, role_in_course, created_at").order("created_at", { ascending: false }),
    supabase.from("section_enrollments").select("id, user_id, section_id, role_in_section, created_at").order("created_at", { ascending: false }),
    supabase.from("courses").select("id, code, title, instructor_id").order("title", { ascending: true }),
    supabase.from("sections").select("id, course_id, name, instructor_id").order("name", { ascending: true }),
  ]);

  const error = usersResult.error || courseEnrollmentsResult.error || sectionEnrollmentsResult.error || coursesResult.error || sectionsResult.error;

  if (error) {
    throw new Error(error.message || "Failed to load users.");
  }

  return {
    users: usersResult.data || [],
    courseEnrollments: courseEnrollmentsResult.data || [],
    sectionEnrollments: sectionEnrollmentsResult.data || [],
    courses: coursesResult.data || [],
    sections: sectionsResult.data || [],
  };
}

export async function updateUserRole(userId, role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) {
    throw new Error(error.message || "Failed to update user role.");
  }
}

export async function upsertCourse(course) {
  const payload = {
    code: course.code,
    title: course.title,
    description: course.description || null,
    instructor_id: course.instructor_id || null,
  };

  const query = course.id ? supabase.from("courses").update(payload).eq("id", course.id) : supabase.from("courses").insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to save course.");
  }
}

export async function upsertSection(section) {
  const payload = {
    course_id: section.course_id,
    name: section.name,
    instructor_id: section.instructor_id || null,
  };

  const query = section.id ? supabase.from("sections").update(payload).eq("id", section.id) : supabase.from("sections").insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to save section.");
  }
}

export async function upsertCourseEnrollment(enrollment) {
  const payload = {
    user_id: enrollment.user_id,
    course_id: enrollment.course_id,
    role_in_course: enrollment.role_in_course || "student",
  };

  const query = enrollment.id ? supabase.from("course_enrollments").update(payload).eq("id", enrollment.id) : supabase.from("course_enrollments").insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to save course enrollment.");
  }
}

export async function upsertSectionEnrollment(enrollment) {
  const payload = {
    user_id: enrollment.user_id,
    section_id: enrollment.section_id,
    role_in_section: enrollment.role_in_section || "student",
  };

  const query = enrollment.id ? supabase.from("section_enrollments").update(payload).eq("id", enrollment.id) : supabase.from("section_enrollments").insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(error.message || "Failed to save section enrollment.");
  }
}

export async function removeMaterial(materialId) {
  const { error } = await supabase.from("materials").delete().eq("id", materialId);

  if (error) {
    throw new Error(error.message || "Failed to remove material.");
  }
}

export async function fetchAdminActivity() {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id, user_id, action, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message || "Failed to load activity feed.");
  }

  return data || [];
}

export async function fetchAdminMaterials() {
  const { data, error } = await supabase
    .from("materials")
    .select("id, topic_id, mission_id, title, type, url, created_by, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Failed to load materials.");
  }

  return data || [];
}

export async function fetchAdminSecuritySnapshot() {
  const userId = await getCurrentUserId();
  return {
    adminId: userId,
    backupStatus: "manual",
    mfaCoverage: 0,
    recentAlerts: [],
  };
}
