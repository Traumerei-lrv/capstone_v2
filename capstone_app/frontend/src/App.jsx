import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import LandingPage from './pages/LandingPage/LandingPage';
import Test from './pages/test';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import StudentClassPage from './pages/StudentDashboard/StudentClassPage';
import PlayerShipDashboard from './pages/PlayerShipDashboard';
import NodeMapOverlay from './pages/NodeMapOverlay';
import RecursionPage from './pages/StudentDashboard/missions/Recursion/RecursionPage';
import IterationPage from './pages/StudentDashboard/missions/Iteration/IterationPage';
import LinkedListPage from './pages/StudentDashboard/missions/LinkedList/LinkedListPage';
import LoadingScreen from './pages/LoadingScreen';
import InstructorLayout from './pages/Instructor/InstructorLayout';
import InstructorDashboard from './pages/Instructor/InstructorDashboard';
import ClassManagement from './pages/Instructor/ClassManagement';
import InstructorProfile from './pages/Instructor/InstructorProfile';
import AdminLayout from './pages/Admin/AdminLayout';
import UserManagement from './pages/Admin/UserManagement';
import CoursesSections from './pages/Admin/CoursesSections';
import Monitoring from './pages/Admin/Monitoring';
import ContentModeration from './pages/Admin/ContentModeration';
import BackupRecovery from './pages/Admin/BackupRecovery';
import Security from './pages/Admin/Security';
import useAppFonts from './fonts';
import { getDemoAuthSession, subscribeToDemoAuthChanges } from './demoAuth';

function getHomeRoute(role) {
  if (role === 'admin') {
    return '/admin';
  }

  return role === 'instructor' ? '/instructor' : '/studentdashboard';
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
    return <Navigate to="/login" replace />;
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
  const [demoAuth, setDemoAuth] = useState(() => getDemoAuthSession());

  useEffect(() => {
    return subscribeToDemoAuthChanges(setDemoAuth);
  }, []);

  useEffect(() => {
    if (demoAuth) {
      setCurrentUser({
        id: 'local-user',
        email: demoAuth.email,
        user_metadata: {
          full_name: demoAuth.profile?.full_name,
          role: demoAuth.profile?.role,
        },
      });
      setCurrentRole(demoAuth.profile?.role ?? 'student');
    } else {
      setCurrentUser(null);
      setCurrentRole(null);
    }

    setIsCheckingAuth(false);
  }, [demoAuth]);

  if (!loaded) {
    return <main style={{ padding: '2rem', textAlign: 'center' }}>Loading fonts…</main>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isCheckingAuth ? <LoadingScreen /> : currentUser ? <Navigate to={getHomeRoute(currentRole)} replace /> : <LandingPage />}
        />
        <Route
          path="/login"
          element={isCheckingAuth ? <LoadingScreen /> : <LoginPage />}
        />
        {/* Public mission previews: allow viewing pre-test and intro without signing in */}
        <Route path="/playershipdashboard/recursion" element={<RecursionPage />} />
        <Route path="/playershipdashboard/iteration" element={<IterationPage />} />
        <Route path="/playershipdashboard/linked-list" element={<LinkedListPage />} />

        <Route element={<ProtectedRoute currentUser={currentUser} currentRole={currentRole} isCheckingAuth={isCheckingAuth} allowedRoles={['student']} />}>
          <Route path="/playershipdashboard" element={<StudentDashboard />} />
          <Route path="/playershipdashboard/class/:courseId" element={<StudentClassPage />} />
          <Route path="/studentdashboard" element={<StudentDashboard />} />
          <Route path="/playership" element={<PlayerShipDashboard />} />
          <Route path="/nodemapoverlay" element={<NodeMapOverlay />} />
        </Route>
        <Route element={<ProtectedRoute currentUser={currentUser} currentRole={currentRole} isCheckingAuth={isCheckingAuth} allowedRoles={['instructor']} />}>
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<InstructorDashboard />} />
            <Route path="class-management" element={<ClassManagement />} />
            <Route path="class-management/:classId" element={<ClassManagement />} />
            <Route path="profile" element={<InstructorProfile />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute currentUser={currentUser} currentRole={currentRole} isCheckingAuth={isCheckingAuth} allowedRoles={['admin']} />}>
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


