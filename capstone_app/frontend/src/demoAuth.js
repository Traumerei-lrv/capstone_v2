const DEMO_AUTH_KEY = 'balangkas.demo.auth';
const DEMO_AUTH_EVENT = 'balangkas:demo-auth-changed';
const LOCAL_USERS_KEY = 'balangkas.local.users';

export const DEMO_STUDENT_LOGIN = {
  email: 'student@balangkas.local',
  password: 'Student123!',
  profile: {
    full_name: 'Recruit Alpha',
    role: 'student',
  },
};

export const DEMO_INSTRUCTOR_LOGIN = {
  email: 'instructor@balangkas.local',
  password: 'Instructor123!',
  profile: {
    full_name: 'Ben Piñon',
    role: 'instructor',
  },
};

export const DEMO_ADMIN_LOGIN = {
  email: 'admin@balangkas.local',
  password: 'Admin123!',
  profile: {
    full_name: 'System Administrator',
    role: 'admin',
  },
};

const BUILTIN_USERS = [DEMO_STUDENT_LOGIN, DEMO_INSTRUCTOR_LOGIN, DEMO_ADMIN_LOGIN];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getDemoAuthSession() {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DEMO_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setDemoAuthSession(session) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(DEMO_AUTH_EVENT));
}

export function clearDemoAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(DEMO_AUTH_KEY);
  window.dispatchEvent(new Event(DEMO_AUTH_EVENT));
}

export function subscribeToDemoAuthChanges(callback) {
  if (!canUseStorage()) {
    return () => {};
  }

  const handleChange = () => callback(getDemoAuthSession());

  window.addEventListener(DEMO_AUTH_EVENT, handleChange);
  window.addEventListener('storage', handleChange);

  return () => {
    window.removeEventListener(DEMO_AUTH_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function readLocalUsers() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalUsers(users) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function getLocalUsers() {
  return readLocalUsers();
}

export function registerLocalUser({ firstName, lastName, email, password, role = 'student' }) {
  const cleanEmail = normalizeEmail(email);
  const users = readLocalUsers();
  const existsInLocal = users.some((entry) => normalizeEmail(entry.email) === cleanEmail);
  const existsInBuiltin = BUILTIN_USERS.some((entry) => normalizeEmail(entry.email) === cleanEmail);

  if (existsInLocal || existsInBuiltin) {
    throw new Error('An account with this email already exists.');
  }

  const fullName = `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim() || cleanEmail;
  const nowIso = new Date().toISOString();
  const newUser = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: cleanEmail,
    password,
    created_at: nowIso,
    updated_at: nowIso,
    profile: {
      full_name: fullName,
      role,
    },
  };

  users.push(newUser);

  writeLocalUsers(users);
  return {
    email: newUser.email,
    profile: newUser.profile,
  };
}

export function authenticateLocalUser(email, password) {
  const cleanEmail = normalizeEmail(email);
  const builtinMatch = BUILTIN_USERS.find(
    (entry) => normalizeEmail(entry.email) === cleanEmail && entry.password === password
  );

  if (builtinMatch) {
    return {
      email: builtinMatch.email,
      profile: builtinMatch.profile,
    };
  }

  const users = readLocalUsers();
  const localMatch = users.find(
    (entry) => normalizeEmail(entry.email) === cleanEmail && entry.password === password
  );

  if (!localMatch) {
    return null;
  }

  const nextUsers = users.map((entry) =>
    entry.id === localMatch.id
      ? {
          ...entry,
          updated_at: new Date().toISOString(),
        }
      : entry,
  );
  writeLocalUsers(nextUsers);

  return {
    email: localMatch.email,
    profile: localMatch.profile,
  };
}

export function matchesDemoInstructorLogin(email, password) {
  return normalizeEmail(email) === DEMO_INSTRUCTOR_LOGIN.email && password === DEMO_INSTRUCTOR_LOGIN.password;
}

export function matchesDemoAdminLogin(email, password) {
  return normalizeEmail(email) === DEMO_ADMIN_LOGIN.email && password === DEMO_ADMIN_LOGIN.password;
}
