import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import Test from './pages/test';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import PlayerShipDashboard from './pages/PlayerShipDashboard';
import NodeMapOverlay from './pages/NodeMapOverlay';
import RecursionPage from './pages/StudentDashboard/missions/Recursion/RecursionPage';
import IterationPage from './pages/StudentDashboard/missions/Iteration/IterationPage';
import LinkedListPage from './pages/StudentDashboard/missions/LinkedList/LinkedListPage';
import LoadingScreen from './pages/LoadingScreen';
import InstructorLayout from './pages/Instructor/InstructorLayout';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import LearningMaterials from './pages/Instructor/LearningMaterials';
import ActivityManagement from './pages/Instructor/ActivityManagement';
import AdminLayout from './pages/Admin/AdminLayout';
import UserManagement from './pages/Admin/UserManagement';
import CoursesSections from './pages/Admin/CoursesSections';
import Monitoring from './pages/Admin/Monitoring';
import ContentModeration from './pages/Admin/ContentModeration';
import BackupRecovery from './pages/Admin/BackupRecovery';
import Security from './pages/Admin/Security';
import { supabase } from './supabase';
import useAppFonts from './fonts';
import { fetchSessionProfile } from './api/auth';
import { getDemoAuthSession, subscribeToDemoAuthChanges } from './demoAuth';

function getHomeRoute(role) {
  if (role === 'admin') {
    return '/admin';
  }

  return role === 'instructor' ? '/instructor' : '/playershipdashboard';
}

function ProtectedRoute({ currentUser, currentRole, isCheckingAuth, allowedRoles }) {
  const location = useLocation();

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  // Allow unauthenticated access to mission preview routes (pre-test and intro views)
  const publicMissionPaths = ['/playershipdashboard/recursion', '/playershipdashboard/iteration', '/playershipdashboard/linked-list'];
  if (!currentUser && publicMissionPaths.includes(location.pathname)) {
    return <Outlet />;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles?.length && currentRole && !allowedRoles.includes(currentRole)) {
    return <Navigate to={getHomeRoute(currentRole)} replace />;
  }

  return <Outlet />;
}

export default function App() {
  const [loaded] = useAppFonts();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const [demoAuth, setDemoAuth] = useState(() => getDemoAuthSession());
  const demoAuthRef = useRef(demoAuth);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    return subscribeToDemoAuthChanges(setDemoAuth);
  }, []);

  useEffect(() => {
    demoAuthRef.current = demoAuth;
  }, [demoAuth]);

  const hydrateSession = async (session, { suppressLoading } = {}) => {
    const activeDemoAuth = demoAuthRef.current;

    if (activeDemoAuth) {
      setCurrentUser({
        id: 'demo-instructor',
        email: activeDemoAuth.email,
        user_metadata: {
          full_name: activeDemoAuth.profile?.full_name,
          role: activeDemoAuth.profile?.role,
        },
      });
      setCurrentRole(activeDemoAuth.profile?.role ?? 'instructor');
      if (!suppressLoading) setIsLoadingRole(false);
      if (!suppressLoading) setIsCheckingAuth(false);
      hasHydratedRef.current = true;
      return;
    }

    if (!session?.access_token) {
      setCurrentUser(null);
      setCurrentRole(null);
      if (!suppressLoading) setIsLoadingRole(false);
      if (!suppressLoading) setIsCheckingAuth(false);
      hasHydratedRef.current = true;
      return;
    }

    setCurrentUser(session.user ?? null);
    if (!suppressLoading) setIsLoadingRole(true);

    try {
      const { profile } = await fetchSessionProfile(session.access_token);
      setCurrentRole(profile?.role ?? session.user?.user_metadata?.role ?? 'student');
    } catch (error) {
      if (error?.status === 503) {
        console.warn('Role API is unavailable; falling back to auth metadata until backend env is configured.');
      } else {
        console.error('Failed to load role information:', error);
      }
      setCurrentRole(session.user?.user_metadata?.role ?? 'student');
    } finally {
      if (!suppressLoading) setIsLoadingRole(false);
      if (!suppressLoading) setIsCheckingAuth(false);
      hasHydratedRef.current = true;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const activeDemoAuth = demoAuthRef.current;

      if (activeDemoAuth) {
        setCurrentUser({
          id: 'demo-instructor',
          email: activeDemoAuth.email,
          user_metadata: {
            full_name: activeDemoAuth.profile?.full_name,
            role: activeDemoAuth.profile?.role,
          },
        });
        setCurrentRole(activeDemoAuth.profile?.role ?? 'instructor');
        setIsCheckingAuth(false);
        setIsLoadingRole(false);
        hasHydratedRef.current = true;
        return;
      }

      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to load Supabase session:', error);
      }

      if (data.session) {
        await hydrateSession(data.session);
        return;
      }
      await hydrateSession(null);
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      hydrateSession(session, { suppressLoading: hasHydratedRef.current });
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!loaded) {
    return <main style={{ padding: '2rem', textAlign: 'center' }}>Loading fonts…</main>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isCheckingAuth || isLoadingRole ? <LoadingScreen /> : currentUser ? <Navigate to={getHomeRoute(currentRole)} replace /> : <LoginPage />}
        />
        {/* Public mission previews: allow viewing pre-test and intro without signing in */}
        <Route path="/playershipdashboard/recursion" element={<RecursionPage />} />
        <Route path="/playershipdashboard/iteration" element={<IterationPage />} />
        <Route path="/playershipdashboard/linked-list" element={<LinkedListPage />} />

        <Route element={<ProtectedRoute currentUser={currentUser} currentRole={currentRole} isCheckingAuth={isCheckingAuth || isLoadingRole} allowedRoles={['student']} />}>
          <Route path="/playershipdashboard" element={<StudentDashboard />} />
          <Route path="/playership" element={<PlayerShipDashboard />} />
          <Route path="/nodemapoverlay" element={<NodeMapOverlay />} />
        </Route>
        <Route element={<ProtectedRoute currentUser={currentUser} currentRole={currentRole} isCheckingAuth={isCheckingAuth || isLoadingRole} allowedRoles={['instructor']} />}>
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<InstructorDashboard />} />
            <Route path="learning-materials" element={<LearningMaterials />} />
            <Route path="activity-management" element={<ActivityManagement />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute currentUser={currentUser} currentRole={currentRole} isCheckingAuth={isCheckingAuth || isLoadingRole} allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<UserManagement />} />
            <Route path="courses" element={<CoursesSections />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="content" element={<ContentModeration />} />
            <Route path="backup" element={<BackupRecovery />} />
            <Route path="security" element={<Security />} />
          </Route>
        </Route>
        <Route path="/test" element={<Test />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


