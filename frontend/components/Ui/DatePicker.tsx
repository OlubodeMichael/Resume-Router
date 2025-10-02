"use client";

import React, { useState, useRef, useEffect } from 'react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  minDate?: string;
  maxDate?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select month and year",
  required = false,
  className = "",
  label,
  minDate,
  maxDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    value ? parseInt(value.split('-')[1]) - 1 : null
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    value ? parseInt(value.split('-')[0]) : null
  );
  const [currentYear, setCurrentYear] = useState<number>(
    selectedYear || new Date().getFullYear()
  );
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowYearDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected values when value prop changes
  useEffect(() => {
    if (value) {
      const [year, month] = value.split('-');
      setSelectedYear(parseInt(year));
      setSelectedMonth(parseInt(month) - 1);
      setCurrentYear(parseInt(year));
    } else {
      setSelectedYear(null);
      setSelectedMonth(null);
    }
  }, [value]);

  const formatDisplayValue = () => {
    if (!selectedYear || selectedMonth === null) return '';
    const date = new Date(selectedYear, selectedMonth);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatInputValue = (year: number, month: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setSelectedYear(currentYear);
    onChange(formatInputValue(currentYear, month));
    setIsOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentYear(year);
    setShowYearDropdown(false);
    if (selectedMonth !== null) {
      onChange(formatInputValue(year, selectedMonth));
    }
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    setCurrentYear(prev => {
      const newYear = direction === 'prev' ? prev - 1 : prev + 1;
      setSelectedYear(newYear);
      return newYear;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYearDate = new Date();
  const currentYearNum = currentYearDate.getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYearNum - 10 + i);

  const isDateDisabled = (year: number, month: number) => {
    const dateStr = formatInputValue(year, month);
    return (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-900 bg-white ${
            isOpen ? 'border-blue-500' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={selectedYear && selectedMonth !== null ? 'text-gray-900' : 'text-gray-400'}>
              {selectedYear && selectedMonth !== null ? formatDisplayValue() : placeholder}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            {/* Year Navigation - Minimal Design */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button
                type="button"
                onClick={() => navigateYear('prev')}
                className="p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowYearDropdown(!showYearDropdown)}
                  className="px-3 py-1 text-lg font-semibold text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  {currentYear}
                </button>
                
                {showYearDropdown && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="max-h-40 overflow-y-auto p-2">
                      {years.map(year => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => handleYearSelect(year)}
                          className={`
                            w-full px-3 py-1 text-sm text-left rounded transition-colors
                            ${selectedYear === year 
                              ? 'bg-blue-100 text-blue-700 font-semibold' 
                              : 'text-gray-600 hover:bg-gray-50'
                            }
                          `}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => navigateYear('next')}
                className="p-2 hover:bg-gray-50 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Month Grid - Clean Design */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {monthNames.map((month, index) => {
                  const isSelected = selectedYear === currentYear && selectedMonth === index;
                  const isDisabled = isDateDisabled(currentYear, index);
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => !isDisabled && handleMonthSelect(index)}
                      disabled={!!isDisabled}
                      className={`
                        px-3 py-2 text-sm rounded-md transition-colors text-center font-medium
                        ${isSelected 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${isDisabled 
                          ? 'opacity-50 cursor-not-allowed text-gray-400' 
                          : 'cursor-pointer'
                        }
                      `}
                    >
                      {month}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions - Minimal */}
            <div className="border-t border-gray-100 p-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setSelectedYear(today.getFullYear());
                    setSelectedMonth(today.getMonth());
                    setCurrentYear(today.getFullYear());
                    onChange(formatInputValue(today.getFullYear(), today.getMonth()));
                    setIsOpen(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
                >
                  Current
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedYear(null);
                    setSelectedMonth(null);
                    onChange('');
                    setIsOpen(false);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
