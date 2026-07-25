import { Network, Zap, Award, Briefcase, Cpu } from 'lucide-react';
import type { SkillGraphData } from '../types/digitalTwin';

interface Props {
  graph: SkillGraphData;
}

export default function SkillGraphVisualizer({ graph }: Props) {
  const nodeIcon = (type: string) => {
    switch (type) {
      case 'role':
        return <Briefcase size={14} className="text-indigo-400" />;
      case 'certification':
        return <Award size={14} className="text-amber-400" />;
      case 'project':
        return <Cpu size={14} className="text-sky-400" />;
      default:
        return <Zap size={14} className="text-emerald-400" />;
    }
  };

  const nodeColor = (type: string) => {
    switch (type) {
      case 'role':
        return 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300';
      case 'certification':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'project':
        return 'bg-sky-500/15 border-sky-500/30 text-sky-300';
      default:
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Network size={14} className="text-indigo-400" /> Internal Skill-Role Relationship Graph
        </span>
        <span>{graph.nodes.length} Nodes | {graph.edges.length} Connections</span>
      </div>

      <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-black/40 border border-white/5">
        {graph.nodes.map((node) => (
          <div
            key={node.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${nodeColor(node.type)} shadow-sm transition-all hover:scale-105`}
          >
            {nodeIcon(node.type)}
            <span>{node.name}</span>
            <span className="text-[10px] opacity-60 font-mono">w:{node.weight}</span>
          </div>
        ))}
      </div>

      {graph.edges.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
          {graph.edges.slice(0, 6).map((edge, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
              <span className="font-semibold text-slate-300">{edge.source}</span>
              <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {edge.relation}
              </span>
              <span className="font-semibold text-slate-300">{edge.target}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
