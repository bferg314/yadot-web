"use client";

import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import dayjs from "dayjs";

const cookieKey = "userDateOfBirth";
const totalLifeExpectancy = 90;

export default function Home() {
  const [currentDate, setCurrentDate] = useState({
    dayOfWeek: "",
    formattedDate: "",
  });
  const [daysFrom, setDaysFrom] = useState("");
  const [weeksFrom, setWeeksFrom] = useState("");
  const [yearsFrom, setYearsFrom] = useState("");
  const [userDob, setUserDob] = useState<string | null>(null);
  const [inputDob, setInputDob] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<"days" | "weeks" | "years" | null>(
    null
  );

  const calculateTimeFromDob = (dob: string) => {
    const referenceDate = dayjs(dob);
    if (!referenceDate.isValid()) {
      return;
    }

    const now = dayjs();
    const dayOfWeek = now.format("dddd");
    const formattedDate = now.format("MMMM DD, YYYY");
    setCurrentDate({ dayOfWeek, formattedDate });

    const daysDiff = now.diff(referenceDate, "day");
    const weeks = Math.floor(daysDiff / 7);
    const remainingDaysInWeek = daysDiff % 7;
    const formattedWeeksFrom = `${weeks.toLocaleString()}.${remainingDaysInWeek}`;
    const years = now.diff(referenceDate, "year");
    const remainingDaysThisYear = now.diff(
      referenceDate.add(years, "year"),
      "day"
    );
    const formattedYearsFrom = `${years}.${remainingDaysThisYear}`;

    setDaysFrom(daysDiff.toLocaleString());
    setWeeksFrom(formattedWeeksFrom);
    setYearsFrom(formattedYearsFrom);
  };

  useEffect(() => {
    const storedDob =
      Cookies.get(cookieKey) || process.env.NEXT_PUBLIC_REFERENCE_DATE;
    let refreshInterval: NodeJS.Timeout | null = null;

    if (storedDob && dayjs(storedDob).isValid()) {
      setUserDob(storedDob);
      calculateTimeFromDob(storedDob);

      refreshInterval = setInterval(() => {
        const latestDob =
          Cookies.get(cookieKey) || process.env.NEXT_PUBLIC_REFERENCE_DATE;
        if (latestDob && dayjs(latestDob).isValid()) {
          calculateTimeFromDob(latestDob);
        }
      }, 10 * 60 * 1000);
    }

    setIsLoading(false);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [userDob]);

  const handleDobSubmit = () => {
    if (inputDob) {
      const dob = dayjs(inputDob);
      const now = dayjs();

      // Validate: date must be valid, in the past, and reasonable (after 1900)
      if (!dob.isValid()) {
        alert("Please enter a valid date");
        return;
      }

      if (dob.isAfter(now)) {
        alert("Date of birth cannot be in the future");
        return;
      }

      if (dob.year() < 1900) {
        alert("Please enter a date after 1900");
        return;
      }

      // Set cookie with security flags
      Cookies.set(cookieKey, inputDob, {
        expires: 365,
        secure: true,      // Only transmit over HTTPS
        sameSite: 'strict' // Prevent CSRF attacks
        // Note: HttpOnly cannot be set via js-cookie (client-side)
        // For HttpOnly, consider moving to server-side cookies
      });
      setUserDob(inputDob);
      calculateTimeFromDob(inputDob);
    }
  };

  const handleShowChart = (type: "days" | "weeks" | "years") => {
    setChartType(type);
    setShowChart(true);
  };

  const handleChartClick = () => setShowChart(false);

  const DotChart = ({ type }: { type: "days" | "weeks" | "years" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const settings = {
      days: { total: totalLifeExpectancy * 365, size: 3, cols: 365 },
      weeks: { total: totalLifeExpectancy * 52, size: 4, cols: 52 },
      years: { total: totalLifeExpectancy, size: 20, cols: 10 },
    }[type];

    const filledDots = parseInt(
      { days: daysFrom, weeks: weeksFrom, years: yearsFrom }[type].replace(
        /,/g,
        ""
      ),
      10
    );

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
    }, [filledDots, settings]);

    return (
      <canvas
        ref={canvasRef}
        aria-label={`Life expectancy chart showing ${filledDots} filled dots out of ${settings.total} total representing ${type}`}
      />
    );
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  if (!userDob) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Enter Your Date of Birth</h2>
        <input
          type="date"
          value={inputDob}
          onChange={(e) => setInputDob(e.target.value)}
          className="border p-2 mb-4 text-black"
        />
        <button
          onClick={handleDobSubmit}
          className="bg-blue-500 text-white px-4 py-2"
        >
          Submit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">Today is</h2>
      <div className="text-center text-lg mb-4">
        <p>{currentDate.dayOfWeek}</p>
        <p>{currentDate.formattedDate}</p>
      </div>
      <h2 className="text-2xl font-bold mb-2 mt-4">You have been alive for</h2>
      {(["days", "weeks", "years"] as const).map((type) => (
        <div
          key={type}
          className="text-center text-3xl font-bold mt-4 cursor-pointer"
          onClick={() => handleShowChart(type)}
        >
          <p>
            {type === "days"
              ? daysFrom
              : type === "weeks"
              ? weeksFrom
              : yearsFrom}
          </p>
          <p className="text-lg">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </p>
        </div>
      ))}

      {showChart && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleChartClick}
        >
          <div className="p-4 bg-black rounded-lg">
            {chartType && <DotChart type={chartType} />}
          </div>
        </div>
      )}
    </div>
  );
}
