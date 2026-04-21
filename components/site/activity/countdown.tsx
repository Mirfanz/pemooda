"use client";

import { cn } from "@/lib/utils";
import { intervalToDuration } from "date-fns";
import { useEffect, useRef, useState } from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  targetDate: Date | string;
  onEnded?: () => void;
};

const Countdown = ({ targetDate, onEnded, className, ...divProps }: Props) => {
  const [duration, setDuration] = useState(
    intervalToDuration({ start: new Date(), end: new Date(targetDate) }),
  );
  const hasCalledOnEnded = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const newDuration = intervalToDuration({ start: now, end: target });

      setDuration(newDuration);

      // Check if countdown reached 0
      const isPast = Object.values(newDuration).every(
        (val) => !val || val <= 0,
      );
      if (isPast && !hasCalledOnEnded.current) {
        hasCalledOnEnded.current = true;
        onEnded?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onEnded]);

  // Check if event has passed or too far in future
  const isPast = Object.values(duration).every((val) => !val || val <= 0);
  if (isPast || duration.years || duration.months) return null;

  const timeUnits = [
    { value: duration.days || 0, label: "Hari" },
    { value: duration.hours || 0, label: "Jam" },
    { value: duration.minutes || 0, label: "Menit" },
    { value: duration.seconds || 0, label: "Detik" },
  ];

  return (
    <div {...divProps} className={cn("grid grid-cols-4 gap-2", className)}>
      {timeUnits.map((unit, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center bg-white dark:bg-default-900/50 rounded-xl p-3 shadow-sm backdrop-blur-sm transition-all hover:scale-105"
        >
          <div className="text-2xl font-bold tabular-nums">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-xs text-default-600 font-medium mt-1">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
