import MissionScaffold from '../shared/MissionScaffold';
import { getMissionScaffold } from '../shared/missionScaffoldData';

export default function IterationPage() {
  return <MissionScaffold mission={getMissionScaffold('iteration')} />;
}