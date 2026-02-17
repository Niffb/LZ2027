import React, { useState } from 'react';
import { Activity, User } from '../types';
import { API_BASE } from '../lib/api';
import { ThumbsUp, ThumbsDown, Plus, CalendarPlus } from 'lucide-react';

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
    <div className="space-y-5">
      <div className="card p-5 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Suggestions</h2>
          <p className="text-xs text-slate-500 mt-0.5">Vote on activities or suggest new ones.</p>
        </div>
        {currentUser.isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-dark transition-colors">
            <Plus size={14}/> New idea
          </button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">New Suggestion</h3>
            <form onSubmit={submitNewPin} className="space-y-3">
              <input className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm bg-slate-50" placeholder="Title" value={newPinTitle} onChange={e => setNewPinTitle(e.target.value)} required />
              <textarea className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm bg-slate-50" placeholder="Description" value={newPinDesc} onChange={e => setNewPinDesc(e.target.value)} rows={2} />
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">€</span>
                <input type="number" className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm bg-slate-50" placeholder="Cost per person" value={newPinCost} onChange={e => setNewPinCost(Number(e.target.value))} />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-slate-500 text-xs hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg">Post</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pins.length === 0 && (
        <p className="text-slate-400 text-xs text-center py-8">No suggestions yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <button onClick={() => handleVote(pin, 'yes')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${myVote === 'yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-500 hover:bg-emerald-50'}`}>
                      <ThumbsUp size={12} /> {yesVotes}
                    </button>
                    <button onClick={() => handleVote(pin, 'no')} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${myVote === 'no' ? 'bg-red-100 text-red-700' : 'bg-slate-50 text-slate-500 hover:bg-red-50'}`}>
                      <ThumbsDown size={12} /> {noVotes}
                    </button>
                  </div>
                  {currentUser.isAdmin && (
                    <button onClick={() => onAddToItinerary(pin)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Add to itinerary">
                      <CalendarPlus size={12} /> Plan
                    </button>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5">
                  <div className="max-h-20 overflow-y-auto space-y-1.5 mb-2">
                    {pin.comments.map((c, idx) => (
                      <div key={idx} className="text-[11px]">
                        <span className="font-semibold text-slate-700">{c.user}: </span>
                        <span className="text-slate-500">{c.text}</span>
                      </div>
                    ))}
                    {pin.comments.length === 0 && <p className="text-[11px] text-slate-400 italic">No comments yet.</p>}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="w-full text-[11px] px-2 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-primary"
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
