import React, { useState } from 'react';
import { Activity, User } from '../types';
import { API_BASE } from '../lib/api';
import { ThumbsUp, ThumbsDown, Plus, CalendarPlus, X } from 'lucide-react';

interface PinBoardProps {
  pins: Activity[];
  currentUser: User;
  onAddPin: (pin: Activity) => void;
  onUpdatePin: (pin: Activity) => void;
  onAddToItinerary: (pin: Activity) => void;
  tripLocation: string;
}

const PinBoard: React.FC<PinBoardProps> = ({ pins, currentUser, onAddPin, onUpdatePin, onAddToItinerary }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPinTitle, setNewPinTitle] = useState('');
  const [newPinDesc, setNewPinDesc] = useState('');
  const [newPinCost, setNewPinCost] = useState(0);

  const handleVote = async (pin: Activity, vote: 'yes' | 'no') => {
    try {
      await fetch(`${API_BASE}/api/activities/${pin.id}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ vote }) });
      const updatedVotes = { ...pin.votes, [currentUser.name]: vote };
      onUpdatePin({ ...pin, votes: updatedVotes });
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleComment = async (pin: Activity, text: string) => {
    try {
      await fetch(`${API_BASE}/api/activities/${pin.id}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ text }) });
      const updatedComments = [...pin.comments, { user: currentUser.name, text }];
      onUpdatePin({ ...pin, comments: updatedComments });
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  const submitNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPin({ id: Math.random().toString(36).substr(2, 9), title: newPinTitle, description: newPinDesc, costEUR: newPinCost, proposedBy: currentUser.name, votes: {[currentUser.name]: 'yes'}, comments: [] });
    setShowAddModal(false);
    setNewPinTitle('');
    setNewPinDesc('');
    setNewPinCost(0);
  };

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="card p-4 sm:p-5 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Suggestions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Vote on activities or suggest new ones.</p>
        </div>
        {currentUser.isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-dark active:scale-[0.98] transition-all min-h-[44px] shadow-sm shadow-indigo-200">
            <Plus size={14}/> New idea
          </button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-xl border border-slate-200 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-slate-900">New Suggestion</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitNewPin} className="space-y-3">
              <input className="w-full border border-slate-200 px-4 py-3 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Title" value={newPinTitle} onChange={e => setNewPinTitle(e.target.value)} required />
              <textarea className="w-full border border-slate-200 px-4 py-3 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="Description" value={newPinDesc} onChange={e => setNewPinDesc(e.target.value)} rows={3} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 pl-1">Cost pp</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">€</span>
                  <input type="number" className="w-full border border-slate-200 pl-7 pr-4 py-3 rounded-xl text-sm bg-slate-50" placeholder="0" value={newPinCost} onChange={e => setNewPinCost(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 text-slate-500 text-sm font-medium hover:bg-slate-50 rounded-xl min-h-[48px]">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white text-sm font-semibold rounded-xl min-h-[48px] shadow-sm shadow-indigo-200 active:scale-[0.98] transition-all">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pins.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-12">No suggestions yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {pins.map(pin => {
          const yesVotes = Object.values(pin.votes).filter(v => v === 'yes').length;
          const noVotes = Object.values(pin.votes).filter(v => v === 'no').length;
          const myVote = pin.votes[currentUser.name];

          return (
            <div key={pin.id} className="card p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">By {pin.proposedBy}</span>
                <span className="text-xs font-semibold text-slate-700">€{pin.costEUR}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">{pin.title}</h3>
              <p className="text-xs text-slate-500 mb-3 flex-grow leading-relaxed">{pin.description}</p>

              <div className="border-t border-slate-100 pt-3 mt-auto space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-1.5">
                    <button onClick={() => handleVote(pin, 'yes')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[40px] ${myVote === 'yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 active:bg-emerald-100'}`}>
                      <ThumbsUp size={14} /> {yesVotes}
                    </button>
                    <button onClick={() => handleVote(pin, 'no')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[40px] ${myVote === 'no' ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-500 hover:bg-red-50 active:bg-red-100'}`}>
                      <ThumbsDown size={14} /> {noVotes}
                    </button>
                  </div>
                  {currentUser.isAdmin && (
                    <button onClick={() => onAddToItinerary(pin)} className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 transition-all min-h-[40px]" title="Add to itinerary">
                      <CalendarPlus size={14} /> Plan
                    </button>
                  )}
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="max-h-24 overflow-y-auto space-y-2 mb-2">
                    {pin.comments.map((c, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-semibold text-slate-700">{c.user}: </span>
                        <span className="text-slate-500">{c.text}</span>
                      </div>
                    ))}
                    {pin.comments.length === 0 && <p className="text-xs text-slate-400 italic">No comments yet.</p>}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full text-xs px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[40px]"
                    onKeyDown={(e) => { if(e.key === 'Enter') { handleComment(pin, e.currentTarget.value); e.currentTarget.value = ''; } }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PinBoard;
