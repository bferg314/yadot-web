"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import dayjs from "dayjs";

type Config = {
  referenceDate?: string;
};

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

  // Load the reference date from either NEXT_PUBLIC_REFERENCE_DATE or cookie
  useEffect(() => {
    const storedDob = Cookies.get(cookieKey);
    if (process.env.NEXT_PUBLIC_REFERENCE_DATE) {
      setUserDob(process.env.NEXT_PUBLIC_REFERENCE_DATE);
    } else if (storedDob) {
      setUserDob(storedDob);
    }
    setIsLoading(false);
  }, []);

  // Update date calculations when userDob is set
  useEffect(() => {
    if (!userDob) return;

    const now = dayjs();
    const referenceDate = dayjs(userDob);

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
  }, [userDob]);

  const handleDobSubmit = () => {
    if (inputDob) {
      Cookies.set(cookieKey, inputDob, { expires: 365 });
      setUserDob(inputDob);
    }
  };

  const handleShowChart = (type: "days" | "weeks" | "years") => {
    setChartType(type);
    setShowChart(true);
  };

  const handleCloseChart = () => {
    setShowChart(false);
    setChartType(null);
  };

  // Close the chart when clicking anywhere
  const handleChartClick = () => {
    setShowChart(false);
  };

  const renderDots = (type: "days" | "weeks" | "years") => {
    let totalDots, filledDots, gridClass, dotStyle;

    if (type === "days") {
      totalDots = 90 * 365; // Total days in 90 years
      filledDots = parseInt(daysFrom.replace(/,/g, ""), 10);
      gridClass = "grid-cols-365";
      dotStyle = { width: "3px", height: "3px" }; // 3px dots for days
    } else if (type === "weeks") {
      totalDots = 90 * 52; // Total weeks in 90 years
      filledDots = Math.floor(parseInt(weeksFrom.replace(/,/g, ""), 10));
      gridClass = "grid-cols-52";
      dotStyle = { width: "3px", height: "3px" }; // 4px dots for weeks
    } else {
      totalDots = 90; // Total years
      filledDots = Math.floor(parseInt(yearsFrom.replace(/,/g, ""), 10));
      gridClass = "grid-cols-10";
      dotStyle = { width: "20px", height: "20px" }; // 10px dots for years
    }

    return (
      <div className={`grid ${gridClass} gap-1`}>
        {Array.from({ length: totalDots }).map((_, i) => (
          <div
            key={i}
            className={`rounded-full ${
              i < filledDots ? "bg-blue-600" : "bg-gray-300"
            }`}
            style={dotStyle} // Custom dot size based on type
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div>Loading...</div>
      </div>
    );
  }

  if (!userDob) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h2 className="text-2xl font-bold mb-4">Enter Your Date of Birth</h2>
        <input
          type="date"
          value={inputDob}
          onChange={(e) => setInputDob(e.target.value)}
          className="border border-gray-300 p-2 mb-4 text-black"
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
      <h2 className="text-2xl font-bold mb-4">You have been alive for</h2>
      <div
        className="text-center text-3xl font-bold mt-4 cursor-pointer"
        onClick={() => handleShowChart("days")}
      >
        <p>{daysFrom}</p>
        <p className="text-lg">Days</p>
      </div>
      <div
        className="text-center text-3xl font-bold mt-4 cursor-pointer"
        onClick={() => handleShowChart("weeks")}
      >
        <p>{weeksFrom}</p>
        <p className="text-lg">Weeks</p>
      </div>
      <div
        className="text-center text-3xl font-bold mt-4 cursor-pointer"
        onClick={() => handleShowChart("years")}
      >
        <p>{yearsFrom}</p>
        <p className="text-lg">Years</p>
      </div>

      {showChart && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
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
