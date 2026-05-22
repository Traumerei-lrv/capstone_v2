import ProfileTab from '../StudentDashboard/components/ProfileTab';
import { clearDemoAuthSession } from '../../demoAuth';

export default function InstructorProfile() {
  const handleLogout = () => {
    clearDemoAuthSession();
    window.location.assign('/');
  };

  return <ProfileTab onLogout={handleLogout} />;
}
