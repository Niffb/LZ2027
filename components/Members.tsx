import React from 'react';
import { Users, Shield } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  isAdmin: boolean;
  joinedAt: string;
}

interface MembersProps {
  members: Member[];
}

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500'
];

const Members: React.FC<MembersProps> = ({ members }) => {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <Users size={16} className="text-primary" />
        Members
        <span className="ml-auto text-xs font-medium text-slate-400">{members.length}</span>
      </h2>
      <div className="space-y-2">
        {members.length === 0 && (
          <p className="text-xs text-slate-400">No one has joined yet.</p>
        )}
        {members.map((member, i) => (
          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-slate-800 truncate">{member.name}</p>
                {member.isAdmin && <Shield size={12} className="text-primary shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-400">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
