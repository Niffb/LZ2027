import React from 'react';
import { ItineraryItem, Activity } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface BudgetProps {
  itinerary: ItineraryItem[];
  pins: Activity[];
  travelerCount: number;
  currentUserName: string;
  expanded?: boolean;
}

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#8b5cf6', '#7c3aed', '#a78bfa'];

const Budget: React.FC<BudgetProps> = ({ itinerary, pins, travelerCount, currentUserName, expanded = false }) => {
  const itineraryTotalEUR = itinerary.reduce((sum, item) => sum + item.costEUR, 0);
  const itineraryPerPersonEUR = travelerCount > 0 ? itineraryTotalEUR / travelerCount : itineraryTotalEUR;

  const myActivities = pins.filter(p => p.votes[currentUserName] === 'yes');
  const myActivitiesTotalEUR = myActivities.reduce((sum, item) => sum + item.costEUR, 0);

  const myTotalEUR = itineraryPerPersonEUR + myActivitiesTotalEUR;
  const myTotalGBP = myTotalEUR * 0.85;

  const allVoters = new Set<string>();
  pins.forEach(p => Object.keys(p.votes).forEach(name => allVoters.add(name)));

  const perUserBreakdown = [...allVoters].map(name => {
    const userActivities = pins.filter(p => p.votes[name] === 'yes');
    const activitiesCost = userActivities.reduce((sum, item) => sum + item.costEUR, 0);
    const total = itineraryPerPersonEUR + activitiesCost;
    return { name, activitiesCost, itineraryCost: itineraryPerPersonEUR, total };
  });

  const chartData = [
    { name: 'Itinerary (shared)', value: Math.round(itineraryPerPersonEUR) },
    ...myActivities.map(a => ({ name: a.title, value: a.costEUR }))
  ].filter(d => d.value > 0);

  return (
    <div className={`card ${expanded ? 'p-6' : 'p-5'}`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-slate-900">Cost Breakdown</h2>
        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">1 EUR ≈ 0.85 GBP</span>
      </div>

      <div className={`grid grid-cols-1 ${expanded ? 'lg:grid-cols-2' : ''} gap-6`}>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-3">Your estimated cost</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">EUR</p>
              <p className="text-2xl font-extrabold text-indigo-900">€{myTotalEUR.toFixed(0)}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">GBP</p>
              <p className="text-2xl font-extrabold text-slate-800">£{myTotalGBP.toFixed(0)}</p>
            </div>
          </div>

          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-md border border-slate-100">
              <span className="text-slate-500">Itinerary (shared ÷ {travelerCount})</span>
              <span className="font-semibold text-slate-800">€{itineraryPerPersonEUR.toFixed(0)}</span>
            </div>
            {myActivities.map(a => (
              <div key={a.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-md border border-slate-100">
                <span className="text-slate-500">{a.title}</span>
                <span className="font-semibold text-slate-800">€{a.costEUR}</span>
              </div>
            ))}
            {myActivities.length === 0 && (
              <p className="text-[11px] text-slate-400 italic">Vote "yes" on suggestions to see costs here.</p>
            )}
          </div>

          {expanded && perUserBreakdown.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">Everyone's costs</p>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-slate-500">Person</th>
                      <th className="text-right px-3 py-2 font-semibold text-slate-500">Itinerary</th>
                      <th className="text-right px-3 py-2 font-semibold text-slate-500">Activities</th>
                      <th className="text-right px-3 py-2 font-semibold text-slate-500">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perUserBreakdown.map(u => (
                      <tr key={u.name} className={`border-t border-slate-100 ${u.name === currentUserName ? 'bg-indigo-50/40' : ''}`}>
                        <td className="px-3 py-2 font-medium text-slate-800">{u.name}{u.name === currentUserName ? ' (you)' : ''}</td>
                        <td className="px-3 py-2 text-right text-slate-500">€{u.itineraryCost.toFixed(0)}</td>
                        <td className="px-3 py-2 text-right text-slate-500">€{u.activitiesCost.toFixed(0)}</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-800">€{u.total.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="h-56 flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`€${value}`, 'Cost']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-xs">Add activities to see breakdown</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;
