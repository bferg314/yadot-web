"use client";

import { useEffect, useRef, memo } from "react";

type ChartType = "days" | "weeks" | "years";

interface DotChartProps {
  type: ChartType;
  filledDots: number;
  lifeExpectancy: number;
}

function DotChart({ type, filledDots, lifeExpectancy }: DotChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const chartSettings: Record<ChartType, { total: number; size: number; cols: number }> = {
    days: { total: lifeExpectancy * 365, size: 3, cols: 365 },
    weeks: { total: lifeExpectancy * 52, size: 4, cols: 52 },
    years: { total: lifeExpectancy, size: 20, cols: 10 },
  };

  const settings = chartSettings[type];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gap = 1;
    const { size, cols, total } = settings;
    const rows = Math.ceil(total / cols);

    canvas.width = cols * (size + gap);
    canvas.height = rows * (size + gap);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = col * (size + gap) + size / 2;
      const y = row * (size + gap) + size / 2;

      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = i < filledDots ? "#2563eb" : "#d1d5db";
      ctx.fill();
    }
  }, [filledDots, settings, lifeExpectancy]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Life expectancy chart showing ${filledDots} filled dots out of ${settings.total} total representing ${type}`}
    />
  );
}

export default memo(DotChart);
export type { ChartType };
