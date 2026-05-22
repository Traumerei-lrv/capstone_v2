const DEMO_AUTH_KEY = 'balangkas.demo.auth';
const DEMO_AUTH_EVENT = 'balangkas:demo-auth-changed';

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

export function matchesDemoInstructorLogin(email, password) {
  return email.trim().toLowerCase() === DEMO_INSTRUCTOR_LOGIN.email && password === DEMO_INSTRUCTOR_LOGIN.password;
}

export function matchesDemoAdminLogin(email, password) {
  return email.trim().toLowerCase() === DEMO_ADMIN_LOGIN.email && password === DEMO_ADMIN_LOGIN.password;
}
