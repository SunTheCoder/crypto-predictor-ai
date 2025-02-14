'use client';

import { useState, useEffect } from 'react';

export default function TimeDisplay() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="stat-value">{time || '...'}</div>;
} 