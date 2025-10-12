import { useEffect, useState } from 'react';
import { T } from '@/components/T';

interface StatsCounterProps {
  value: number;
  suffix?: string;
  translatedLabel: string;
}

export const StatsCounter = ({ value, suffix = '', translatedLabel }: StatsCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toFixed(1);
  };

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
        {formatNumber(count)}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">
        <T>{translatedLabel}</T>
      </div>
    </div>
  );
};
