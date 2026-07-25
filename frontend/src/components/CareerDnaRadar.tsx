import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import type { CareerDNAScores } from '../types/digitalTwin';

interface Props {
  dna: CareerDNAScores;
}

export default function CareerDnaRadar({ dna }: Props) {
  const data = [
    { subject: 'Cybersecurity', value: dna.cybersecurity, fullMark: 100 },
    { subject: 'Programming', value: dna.programming, fullMark: 100 },
    { subject: 'Networking', value: dna.networking, fullMark: 100 },
    { subject: 'Cloud', value: dna.cloud, fullMark: 100 },
    { subject: 'DevOps', value: dna.devops, fullMark: 100 },
    { subject: 'Leadership', value: dna.leadership, fullMark: 100 },
    { subject: 'Communication', value: dna.communication, fullMark: 100 },
    { subject: 'Problem Solving', value: dna.problem_solving, fullMark: 100 },
    { subject: 'Threat Hunting', value: dna.threat_hunting, fullMark: 100 },
    { subject: 'Incident Response', value: dna.incident_response, fullMark: 100 },
  ];

  return (
    <div className="w-full h-80 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} />
          <Radar
            name="Career DNA"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
