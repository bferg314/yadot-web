"use client";

import { useState, useEffect, useRef } from "react";

interface HamburgerMenuProps {
  onEditDob: () => void;
  onEditLifeExpectancy: () => void;
  onShowExplanation: () => void;
}

export default function HamburgerMenu({ onEditDob, onEditLifeExpectancy, onShowExplanation }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleEditDobClick = () => {
    setIsOpen(false);
    onEditDob();
  };

  const handleEditLifeExpectancyClick = () => {
    setIsOpen(false);
    onEditLifeExpectancy();
  };

  const handleShowExplanationClick = () => {
    setIsOpen(false);
    onShowExplanation();
  };

  return (
    <div ref={menuRef} className="fixed top-4 right-4 z-50">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-6 h-6 flex flex-col justify-center items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
        aria-label="Menu"
        aria-expanded={isOpen}
        type="button"
      >
        <span className="w-5 h-0.5 bg-current transition-all" />
        <span className="w-5 h-0.5 bg-current transition-all" />
        <span className="w-5 h-0.5 bg-current transition-all" />
      </button>

      {isOpen && (
        <div className="absolute top-8 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden animate-fade-in">
          <button
            type="button"
            onClick={handleEditDobClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
          >
            Edit Date of Birth
          </button>
          <button
            type="button"
            onClick={handleEditLifeExpectancyClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
          >
            Edit Life Expectancy
          </button>
          <button
            type="button"
            onClick={handleShowExplanationClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
          >
            What is this?
          </button>
        </div>
      )}
    </div>
  );
}
