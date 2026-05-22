import { useMemo } from 'react';
import MissionScaffold from '../shared/MissionScaffold';
import { getMissionScaffold } from '../shared/missionScaffoldData';
import useAuth from '../../../../hooks/useAuth';

export default function RecursionPage() {
  const { user } = useAuth();
  const devBypass = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dev') === 'true';

  const mission = useMemo(() => getMissionScaffold('recursion'), []);

  // allow viewing in development or when ?dev=true even if not signed in
  if (!user && !(process.env.NODE_ENV === 'development' || devBypass)) {
    // keep existing redirect behavior (the route guard outside will handle it)
    return <MissionScaffold mission={mission} />;
  }

  return <MissionScaffold mission={mission} />;
}