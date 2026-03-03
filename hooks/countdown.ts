"use client";

import { intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

export function useCountdown(targetDate: Date | string) {
  const [duration, setDuration] = useState(
    intervalToDuration({ start: new Date(), end: new Date(targetDate) }),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(
        intervalToDuration({ start: new Date(), end: new Date(targetDate) }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return duration;
}
