import MissionScaffold from '../shared/MissionScaffold';
import { getMissionScaffold } from '../shared/missionScaffoldData';

export default function IntroductionPage() {
  return <MissionScaffold mission={getMissionScaffold('introduction')} />;
}
