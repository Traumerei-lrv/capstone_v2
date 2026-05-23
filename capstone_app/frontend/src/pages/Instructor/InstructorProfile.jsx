import ProfileTab from '../StudentDashboard/components/ProfileTab';
import { clearDemoAuthSession } from '../../demoAuth';
import { useNavigate } from 'react-router-dom';

export default function InstructorProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearDemoAuthSession();
    navigate('/', { replace: true });
  };

  return <ProfileTab onLogout={handleLogout} />;
}
