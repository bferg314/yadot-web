"use client";

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/en';  // Default locale (English)

type Config = {
  referenceDate?: string;  // Reference date from environment variable (optional)
};

// Access the environment variable (no fallback)
const config: Config = {
  referenceDate: process.env.NEXT_PUBLIC_REFERENCE_DATE,  // No default, so it may be undefined
};

type CurrentDate = {
  dayOfWeek: string;
  formattedDate: string;
};

export default function Home() {
  const [currentDate, setCurrentDate] = useState<CurrentDate>({ dayOfWeek: '', formattedDate: '' });
  const [daysFrom, setDaysFrom] = useState('');
  const [weeksFrom, setWeeksFrom] = useState('');
  const [yearsFrom, setYearsFrom] = useState('');
  const [error, setError] = useState<string | null>(null);  // Error handling state

  const referenceDateFormatted = config.referenceDate ? dayjs(config.referenceDate).format('MMMM DD, YYYY') : '';  // Formatted date of birth

  // Update the date and calculate the difference
  const updateDate = () => {
    const now = dayjs();

    // Format the current date
    const dayOfWeek = now.format('dddd');
    const formattedDate = now.format('MMMM DD, YYYY');
    setCurrentDate({ dayOfWeek, formattedDate });

    if (!config.referenceDate) {
      setError("Please provide a valid reference date in the environment variable.");
      return;
    }

    // Calculate days from the reference date
    const referenceDate = dayjs(config.referenceDate);
    const daysDiff = now.diff(referenceDate, 'day');
    
    // Calculate weeks and format the integer part with commas
    const weeks = Math.floor(daysDiff / 7);
    const remainingDaysInWeek = daysDiff % 7;
    const formattedWeeksFrom = `${weeks.toLocaleString()}.${remainingDaysInWeek}`;

    // Calculate years with leap year support
    const years = now.diff(referenceDate, 'year');
    const remainingDaysThisYear = now.diff(referenceDate.add(years, 'year'), 'day');
    const formattedYearsFrom = `${years}.${remainingDaysThisYear}`;

    setDaysFrom(daysDiff.toLocaleString());  // Add comma formatting to days
    setWeeksFrom(formattedWeeksFrom);       // Add comma formatting to weeks
    setYearsFrom(formattedYearsFrom);
  };

  useEffect(() => {
    // Initial update
    updateDate();

    // Set up an interval to check every 10 minutes (600000 milliseconds)
    const intervalId = setInterval(() => {
      updateDate();
    }, 600000);  // 10 minutes

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return <p>{error}</p>;  // Display error message if the reference date is missing
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6">
      <h2 className="text-2xl font-bold mb-4" aria-label="Today's date">Today is</h2>

      <div className="text-center text-lg mb-4">
        <p>{currentDate.dayOfWeek}</p>
        <p>{currentDate.formattedDate}</p>
      </div>

      {/* Only show the "You have been alive for" section if referenceDate exists */}
      {config.referenceDate && (
        <>
          <div className="text-center text-xl font-bold mt-6" aria-label="You have been alive for">
            <h3 title={`Date of Birth: ${referenceDateFormatted}`}>You have been alive for</h3>
          </div>

          <div className="text-center text-3xl font-bold mt-4" aria-label="Total days" title={`Date of Birth: ${referenceDateFormatted}`}>
            <p>{daysFrom}</p>
            <p className="text-lg">Days</p>
          </div>

          <div className="text-center text-3xl font-bold mt-4" aria-label="Total weeks" title={`Date of Birth: ${referenceDateFormatted}`}>
            <p>{weeksFrom}</p>
            <p className="text-lg">Weeks</p>
          </div>

          <div className="text-center text-3xl font-bold mt-4" aria-label="Total years" title={`Date of Birth: ${referenceDateFormatted}`}>
            <p>{yearsFrom}</p>
            <p className="text-lg">Years</p>
          </div>
        </>
      )}
    </div>
  );
}
