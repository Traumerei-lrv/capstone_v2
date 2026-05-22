import MissionScaffold from '../shared/MissionScaffold';
import { getMissionScaffold } from '../shared/missionScaffoldData';

export default function LinkedListPage() {
  return <MissionScaffold mission={getMissionScaffold('linked-list')} />;
}