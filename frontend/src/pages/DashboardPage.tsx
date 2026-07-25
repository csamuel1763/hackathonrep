import MissionControlView from '../components/MissionControlView';
import { useResume } from '../context/ResumeContext';

export default function DashboardPage() {
  const { parsedData } = useResume();
  if (!parsedData) return null;

  return (
    <div className="flex flex-col gap-6 animate-fadein">
      <MissionControlView />
    </div>
  );
}
