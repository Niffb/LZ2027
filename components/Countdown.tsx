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
    <div className="card p-5 flex flex-row lg:flex-col items-center justify-center gap-4 lg:gap-0">
      <div className="text-center">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 lg:mb-3">Countdown</p>
        <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          {timeLeft.days}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 lg:mt-1">days to go</p>
      </div>
      <div className="flex gap-2 lg:mt-4">
        <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-center min-w-[52px]">
          <span className="block text-lg font-bold text-slate-800">{timeLeft.hours}</span>
          <span className="text-[10px] text-slate-400 uppercase">hrs</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-center min-w-[52px]">
          <span className="block text-lg font-bold text-slate-800">{timeLeft.minutes}</span>
          <span className="text-[10px] text-slate-400 uppercase">min</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
