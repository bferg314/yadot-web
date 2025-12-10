"use client";

import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import DotChart, { ChartType } from "@/components/DotChart";

const cookieKey = "userDateOfBirth";

export default function Home() {
  const [currentDate, setCurrentDate] = useState({
    dayOfWeek: "",
    formattedDate: "",
  });
  const [daysFrom, setDaysFrom] = useState(0);
  const [weeksFrom, setWeeksFrom] = useState(0);
  const [yearsFrom, setYearsFrom] = useState(0);
  const [remainingDaysInWeek, setRemainingDaysInWeek] = useState(0);
  const [remainingDaysInYear, setRemainingDaysInYear] = useState(0);
  const [userDob, setUserDob] = useState<string | null>(null);
  const [inputDob, setInputDob] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState<ChartType | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const calculateTimeFromDob = useCallback((dob: string) => {
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
    const daysInWeek = daysDiff % 7;
    const years = now.diff(referenceDate, "year");
    const daysInYear = now.diff(referenceDate.add(years, "year"), "day");

    setDaysFrom(daysDiff);
    setWeeksFrom(weeks);
    setRemainingDaysInWeek(daysInWeek);
    setYearsFrom(years);
    setRemainingDaysInYear(daysInYear);
  }, []);

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
  }, [userDob, calculateTimeFromDob]);

  const handleDobSubmit = () => {
    setValidationError(null);

    if (!inputDob) {
      setValidationError("Please enter a date");
      return;
    }

    const dob = dayjs(inputDob);
    const now = dayjs();

    if (!dob.isValid()) {
      setValidationError("Please enter a valid date");
      return;
    }

    if (dob.isAfter(now)) {
      setValidationError("Date of birth cannot be in the future");
      return;
    }

    if (dob.year() < 1900) {
      setValidationError("Please enter a date after 1900");
      return;
    }

    Cookies.set(cookieKey, inputDob, {
      expires: 365,
      secure: true,
      sameSite: "strict",
    });
    setUserDob(inputDob);
    setIsEditing(false);
    calculateTimeFromDob(inputDob);
  };

  const handleEditDob = () => {
    setInputDob(userDob || "");
    setValidationError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setInputDob("");
    setValidationError(null);
    setIsEditing(false);
  };

  const handleShowChart = (type: ChartType) => {
    setChartType(type);
    setShowChart(true);
  };

  const handleCloseChart = () => setShowChart(false);

  const handleKeyDown = (e: React.KeyboardEvent, type: ChartType) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleShowChart(type);
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCloseChart();
    }
  };

  const getFilledDots = (type: ChartType): number => {
    switch (type) {
      case "days":
        return daysFrom;
      case "weeks":
        return weeksFrom;
      case "years":
        return yearsFrom;
    }
  };

  const formatValue = (type: ChartType): string => {
    switch (type) {
      case "days":
        return daysFrom.toLocaleString();
      case "weeks":
        return `${weeksFrom.toLocaleString()}.${remainingDaysInWeek}`;
      case "years":
        return `${yearsFrom}.${remainingDaysInYear}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!userDob || isEditing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h2 className="text-2xl font-bold mb-4">
          {isEditing ? "Edit Your Date of Birth" : "Enter Your Date of Birth"}
        </h2>
        <label htmlFor="dob-input" className="sr-only">
          Date of Birth
        </label>
        <input
          id="dob-input"
          type="date"
          value={inputDob}
          onChange={(e) => {
            setInputDob(e.target.value);
            setValidationError(null);
          }}
          className="border p-2 mb-2 text-black rounded"
          aria-describedby={validationError ? "dob-error" : undefined}
          aria-invalid={validationError ? "true" : "false"}
        />
        {validationError && (
          <p id="dob-error" className="text-red-500 text-sm mb-4" role="alert">
            {validationError}
          </p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleDobSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            {isEditing ? "Save" : "Submit"}
          </button>
          {isEditing && (
            <button
              onClick={handleCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
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
          role="button"
          tabIndex={0}
          className="text-center text-3xl font-bold mt-4 cursor-pointer hover:text-blue-500 focus:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-2 transition-colors"
          onClick={() => handleShowChart(type)}
          onKeyDown={(e) => handleKeyDown(e, type)}
          aria-label={`View ${type} chart. ${formatValue(type)} ${type}`}
        >
          <p>{formatValue(type)}</p>
          <p className="text-lg">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
        </div>
      ))}

      <button
        onClick={handleEditDob}
        className="mt-8 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline transition-colors"
      >
        Edit Date of Birth
      </button>

      {showChart && chartType && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${chartType} visualization`}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleCloseChart}
          onKeyDown={handleModalKeyDown}
          tabIndex={-1}
        >
          <div
            className="p-4 bg-black rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <DotChart type={chartType} filledDots={getFilledDots(chartType)} />
            <p className="text-center text-white text-sm mt-2">
              Click anywhere or press Escape to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
