import ProfileTab from '../StudentDashboard/components/ProfileTab';
import { clearDemoAuthSession } from '../../demoAuth';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    clearDemoAuthSession();
    navigate('/', { replace: true });
  };

  return <ProfileTab onLogout={handleLogout} user={user} />;
}
