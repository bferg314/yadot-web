"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { FocusTrap } from "focus-trap-react";
import DotChart, { ChartType } from "@/components/DotChart";
import HamburgerMenu from "@/components/HamburgerMenu";

const cookieKey = "userDateOfBirth";
const lifeExpectancyCookieKey = "userLifeExpectancy";
const defaultLifeExpectancy = 80;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // Refresh every 10 minutes

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
  const [lifeExpectancy, setLifeExpectancy] = useState(defaultLifeExpectancy);
  const [inputLifeExpectancy, setInputLifeExpectancy] = useState("");
  const [isEditingLifeExpectancy, setIsEditingLifeExpectancy] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);

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
    let refreshInterval: NodeJS.Timeout | null = null;

    try {
      const storedDob =
        Cookies.get(cookieKey) || process.env.NEXT_PUBLIC_REFERENCE_DATE;
      const storedLifeExpectancy = Cookies.get(lifeExpectancyCookieKey);

      if (storedLifeExpectancy) {
        const parsed = parseInt(storedLifeExpectancy, 10);
        if (!isNaN(parsed) && parsed > 0) {
          setLifeExpectancy(parsed);
        }
      }

      if (storedDob && dayjs(storedDob).isValid()) {
        setUserDob(storedDob);
        calculateTimeFromDob(storedDob);

        refreshInterval = setInterval(() => {
          try {
            const latestDob =
              Cookies.get(cookieKey) || process.env.NEXT_PUBLIC_REFERENCE_DATE;
            if (latestDob && dayjs(latestDob).isValid()) {
              calculateTimeFromDob(latestDob);
            }
          } catch (error) {
            console.error("Error refreshing date from cookie:", error);
          }
        }, REFRESH_INTERVAL_MS);
      }
    } catch (error) {
      console.error("Error loading user data from cookies:", error);
    }

    setIsLoading(false);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [calculateTimeFromDob]);

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

  const handleEditLifeExpectancy = () => {
    setInputLifeExpectancy(lifeExpectancy.toString());
    setValidationError(null);
    setIsEditingLifeExpectancy(true);
  };

  const handleLifeExpectancySubmit = () => {
    setValidationError(null);

    if (!inputLifeExpectancy) {
      setValidationError("Please enter a life expectancy");
      return;
    }

    const value = parseInt(inputLifeExpectancy, 10);

    if (isNaN(value)) {
      setValidationError("Please enter a valid number");
      return;
    }

    if (value < 1 || value > 150) {
      setValidationError("Please enter a value between 1 and 150");
      return;
    }

    Cookies.set(lifeExpectancyCookieKey, value.toString(), {
      expires: 365,
      secure: true,
      sameSite: "strict",
    });
    setLifeExpectancy(value);
    setIsEditingLifeExpectancy(false);
  };

  const handleCancelLifeExpectancyEdit = () => {
    setInputLifeExpectancy("");
    setValidationError(null);
    setIsEditingLifeExpectancy(false);
  };

  const handleShowChart = (type: ChartType) => {
    setChartType(type);
    setShowChart(true);
  };

  const handleCloseChart = () => setShowChart(false);

  const handleShowExplanation = () => setShowExplanation(true);
  const handleCloseExplanation = () => setShowExplanation(false);

  useEffect(() => {
    if (showChart && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showChart]);

  useEffect(() => {
    if (showExplanation && explanationRef.current) {
      explanationRef.current.focus();
    }
  }, [showExplanation]);

  const handleKeyDown = (e: React.KeyboardEvent, type: ChartType) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleShowChart(type);
    }
  };

  const createModalKeyDownHandler = (closeHandler: () => void) => {
    return (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeHandler();
      }
    };
  };

  const handleModalKeyDown = createModalKeyDownHandler(handleCloseChart);
  const handleExplanationKeyDown = createModalKeyDownHandler(handleCloseExplanation);

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

  if (isEditingLifeExpectancy) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Life Expectancy</h2>
        <label htmlFor="life-expectancy-input" className="sr-only">
          Life Expectancy (years)
        </label>
        <input
          id="life-expectancy-input"
          type="number"
          min="1"
          max="150"
          value={inputLifeExpectancy}
          onChange={(e) => {
            setInputLifeExpectancy(e.target.value);
            setValidationError(null);
          }}
          className="border p-2 mb-2 text-black rounded w-24 text-center"
          aria-describedby={validationError ? "life-expectancy-error" : undefined}
          aria-invalid={validationError ? "true" : "false"}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">years</p>
        {validationError && (
          <p id="life-expectancy-error" className="text-red-500 text-sm mb-4" role="alert">
            {validationError}
          </p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleLifeExpectancySubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Save
          </button>
          <button
            onClick={handleCancelLifeExpectancyEdit}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <HamburgerMenu onEditDob={handleEditDob} onEditLifeExpectancy={handleEditLifeExpectancy} onShowExplanation={handleShowExplanation} />
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

        {showChart && chartType && (
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              escapeDeactivates: false,
              clickOutsideDeactivates: true,
            }}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={`${chartType} visualization`}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
              onClick={handleCloseChart}
              onKeyDown={handleModalKeyDown}
            >
              <div onClick={(e) => e.stopPropagation()} className="relative">
                <DotChart type={chartType} filledDots={getFilledDots(chartType)} lifeExpectancy={lifeExpectancy} />
                <button
                  onClick={handleCloseChart}
                  className="sr-only"
                  aria-label="Close chart"
                >
                  Close
                </button>
              </div>
            </div>
          </FocusTrap>
        )}

        {showExplanation && (
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              escapeDeactivates: false,
              clickOutsideDeactivates: true,
            }}
          >
            <div
              ref={explanationRef}
              role="dialog"
              aria-modal="true"
              aria-label="Explanation"
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-6"
              onClick={handleCloseExplanation}
              onKeyDown={handleExplanationKeyDown}
              tabIndex={-1}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md text-center shadow-lg"
              >
                <h2 className="text-2xl font-bold mb-6">What is this?</h2>
                <div className="text-left space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    This shows how long you&apos;ve been alive.
                  </p>
                  <p>
                    For weeks, the number after the decimal shows which day of the week (0-6). For years, it shows how many days into the current year (starting at 0).
                  </p>
                  <p>
                    Click any number to see a visualization: each dot represents one unit of time, filled dots show time lived, empty dots show time remaining.
                  </p>
                  <p>
                    The visualization uses your configurable life expectancy (default: 80 years) to calculate the total.
                  </p>
                </div>
                <button
                  onClick={handleCloseExplanation}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </FocusTrap>
        )}
      </div>
    </>
  );
}
