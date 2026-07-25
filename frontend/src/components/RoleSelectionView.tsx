import { useEffect, useState } from 'react';
import { Shield, BookOpen, Layers, Award, Loader2, ArrowRight } from 'lucide-react';
import type { CybersecurityRole } from '../types/role';
import { fetchRoles } from '../api/role';

interface RoleSelectionViewProps {
  onRoleSelected: (role: CybersecurityRole) => void;
}

function importanceBadgeColor(importance: string): string {
  switch (importance.toLowerCase()) {
    case 'high':
      return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    default:
      return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
  }
}

export default function RoleSelectionView({ onRoleSelected }: RoleSelectionViewProps) {
  const [roles, setRoles] = useState<CybersecurityRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<CybersecurityRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        setLoading(true);
        const data = await fetchRoles();
        setRoles(data);
        if (data.length > 0) {
          setSelectedRole(data[0]); // default to first role
        }
      } catch (err: any) {
        setError('Failed to load cybersecurity roles database.');
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 size={36} className="text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading role intelligence taxonomy...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-fadein">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Select Your Target Cyber Role</h2>
        <p className="text-sm text-slate-400 mt-1">
          Choose a target career role to guide your customized skill gap analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Role List */}
        <div className="md:col-span-5 flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-2">
          {roles.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`
                  w-full text-left p-4 rounded-xl border transition-all duration-300
                  ${isSelected
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-slate-400'}
                  `}>
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-200">{role.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{role.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Role Detail Panel */}
        <div className="md:col-span-7 flex flex-col">
          {selectedRole && (
            <div className="flex-1 flex flex-col rounded-2xl border border-white/8 bg-white/[0.02] p-6 animate-fadein">
              {/* Name & Desc */}
              <div className="border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Shield size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Role Profile</span>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedRole.name}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  {selectedRole.description}
                </p>
              </div>

              <div className="flex flex-col gap-5 flex-grow">
                {/* Expected Skills */}
                <div>
                  <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <Layers size={14} className="text-indigo-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Expected Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.required_skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.03] border border-white/10"
                      >
                        <span className="text-slate-200">{skill.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${importanceBadgeColor(skill.importance)}`}>
                          {skill.importance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Knowledge / Prerequisites */}
                <div>
                  <div className="flex items-center gap-2 text-slate-300 mb-2">
                    <BookOpen size={14} className="text-indigo-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Required Knowledge & Certs</span>
                  </div>
                  <ul className="flex flex-col gap-2">
                    {selectedRole.prerequisites.map((pre, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-slate-400">
                        <Award size={13} className="text-indigo-400 mt-0.5 shrink-0" />
                        <span>{pre}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Confirm Action Button */}
              <button
                onClick={() => onRoleSelected(selectedRole)}
                className="
                  mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                  bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                  text-white font-medium text-sm transition-all duration-300
                  shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20
                "
              >
                Proceed with {selectedRole.name} <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
