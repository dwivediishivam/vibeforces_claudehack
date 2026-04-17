"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function AnimatedMetric({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;

    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min(1, (time - start) / duration);
      const next = value * progress;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span>
      {display.toFixed(value % 1 === 0 ? 0 : 1)}
      {suffix}
    </span>
  );
}

export function ScoreDisplay({
  accuracy,
  tokenScore,
  timeLabel,
  combinedScore,
  feedback,
}: {
  accuracy: number;
  tokenScore: number;
  timeLabel: string;
  combinedScore: number;
  feedback: string;
}) {
  const cards = [
    { label: "Accuracy", value: accuracy, suffix: "/10" },
    { label: "Token Eff.", value: tokenScore, suffix: "%" },
    { label: "Time", value: Number(timeLabel.replace(/[^\d.]/g, "")), suffix: "" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_1.2fr]">
        {cards.map((card) => (
          <div key={card.label} className="surface-card rounded-2xl p-5">
            <div className="text-xs uppercase tracking-[2px] text-[#64748b]">
              {card.label}
            </div>
            <div className="mt-3 text-3xl font-bold font-mono-ui text-[#f1f5f9]">
              <AnimatedMetric value={card.value} suffix={card.suffix} />
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-[#7c3aed]/30 bg-[#7c3aed]/10 p-5">
          <div className="text-xs uppercase tracking-[2px] text-[#c4b5fd]">
            Combined
          </div>
          <div className="mt-3 text-3xl font-bold font-mono-ui text-white">
            <AnimatedMetric value={combinedScore} suffix=" pts" />
          </div>
          <div className="mt-2 text-sm text-[#cbd5e1]">Leaderboard-ready score</div>
        </div>
      </div>
      <div className="surface-subtle rounded-2xl p-4 text-sm italic text-[#94a3b8]">
        {feedback}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" className="border border-[#1e293b]">
          Try Again
        </Button>
        <Button className="bg-[#7c3aed] hover:bg-[#6d28d9]">Next Challenge</Button>
      </div>
    </motion.div>
  );
}
