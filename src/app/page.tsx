"use client";

import { useEffect, useState } from "react";
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
    const now = dayjs();
    const referenceDate = dayjs(dob);

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
    if (storedDob) {
      setUserDob(storedDob);
      calculateTimeFromDob(storedDob);
    }
    setIsLoading(false);

    const refreshInterval = setInterval(
      () => calculateTimeFromDob(storedDob || ""),
      10 * 60 * 1000
    );
    return () => clearInterval(refreshInterval);
  }, [userDob]);

  const handleDobSubmit = () => {
    if (inputDob) {
      Cookies.set(cookieKey, inputDob, { expires: 365 });
      setUserDob(inputDob);
      calculateTimeFromDob(inputDob);
    }
  };

  const handleShowChart = (type: "days" | "weeks" | "years") => {
    setChartType(type);
    setShowChart(true);
  };

  const handleChartClick = () => setShowChart(false);

  const renderDots = (type: "days" | "weeks" | "years") => {
    const settings = {
      days: {
        total: totalLifeExpectancy * 365,
        size: "3px",
        cols: "grid-cols-365",
      },
      weeks: {
        total: totalLifeExpectancy * 52,
        size: "4px",
        cols: "grid-cols-52",
      },
      years: { total: totalLifeExpectancy, size: "20px", cols: "grid-cols-10" },
    }[type];

    const filledDots = parseInt(
      { days: daysFrom, weeks: weeksFrom, years: yearsFrom }[type].replace(
        /,/g,
        ""
      ),
      10
    );

    return (
      <div className={`grid ${settings.cols} gap-1`}>
        {Array.from({ length: settings.total }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full ${
              i < filledDots ? "bg-blue-600" : "bg-gray-300"
            }`}
            style={{ width: settings.size, height: settings.size }}
          />
        ))}
      </div>
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
            {chartType && renderDots(chartType)}
          </div>
        </div>
      )}
    </div>
  );
}
