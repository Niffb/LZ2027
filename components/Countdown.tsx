import React, { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="h-full card p-5 flex flex-col items-center justify-center">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Countdown</p>
      <div className="text-5xl font-extrabold text-slate-900 tracking-tight">
        {timeLeft.days}
      </div>
      <p className="text-sm text-slate-500 mt-1 mb-4">days to go</p>
      <div className="flex gap-3">
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-center">
          <span className="block text-lg font-bold text-slate-800">{timeLeft.hours}</span>
          <span className="text-[10px] text-slate-400 uppercase">hrs</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-center">
          <span className="block text-lg font-bold text-slate-800">{timeLeft.minutes}</span>
          <span className="text-[10px] text-slate-400 uppercase">min</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
