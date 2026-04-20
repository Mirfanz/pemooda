"use client";

import { useCountdown } from "@/hooks/countdown";
import { Card, CardBody } from "@heroui/react";
import { ClockCircle } from "@solar-icons/react";
import { useEffect, useRef } from "react";

type Props = {
  targetDate: Date | string;
  onEnded?: () => void;
};

const Countdown = (props: Props) => {
  const countdown = useCountdown(props.targetDate);
  const hasCalledOnEnded = useRef(false);

  // Check if event has passed
  const isPast = Object.values(countdown).every((val) => !val || val <= 0);

  // Call onEnded when countdown reaches 0
  useEffect(() => {
    if (isPast && !hasCalledOnEnded.current && props.onEnded) {
      hasCalledOnEnded.current = true;
      props.onEnded();
    }
  }, [isPast, props]);

  if (isPast || countdown.years || countdown.months) return;

  const timeUnits = [
    { value: countdown.days || 0, label: "Hari", show: true },
    { value: countdown.hours || 0, label: "Jam", show: true },
    { value: countdown.minutes || 0, label: "Menit", show: true },
    { value: countdown.seconds || 0, label: "Detik", show: true },
  ];

  return (
    <Card className="bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800 shadow-lg">
      <CardBody className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ClockCircle weight="Broken" className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-primary">
            Hitung Mundur Acara :
          </h3>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {timeUnits.map((unit, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center bg-white dark:bg-default-900/50 rounded-xl p-3 shadow-sm backdrop-blur-sm transition-all hover:scale-105"
            >
              <div className="text-2xl font-bold text-primary tabular-nums">
                {String(unit.value).padStart(2, "0")}
              </div>
              <div className="text-xs text-default-600 font-medium mt-1">
                {unit.label}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default Countdown;
