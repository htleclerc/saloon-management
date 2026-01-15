"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";

// Helper functions
const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => new Date().getMonth() + 1; // 1-12
const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const numDays = lastDay.getDate();
    return Math.ceil((numDays + firstDay.getDay()) / 7);
};

const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

export interface DateFilterValue {
    year: number;
    month: number | null; // null = all months
    week: number | null; // null = all weeks
}

interface DateRangeFilterProps {
    onChange: (value: DateFilterValue) => void;
    initialValue?: Partial<DateFilterValue>;
    showWeekFilter?: boolean;
    className?: string;
}

export default function DateRangeFilter({
    onChange,
    initialValue,
    showWeekFilter = true,
    className = "",
}: DateRangeFilterProps) {
    const [year, setYear] = useState(initialValue?.year ?? getCurrentYear());
    const [month, setMonth] = useState<number | null>(initialValue?.month ?? getCurrentMonth());
    const [week, setWeek] = useState<number | null>(initialValue?.week ?? null);

    // Store callback in ref to avoid stale closure
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Track if this is the first mount to skip initial onChange (prevents infinite loop)
    const isFirstMountRef = useRef(true);

    // Generate years (current year and 4 previous years)
    const years = Array.from({ length: 5 }, (_, i) => getCurrentYear() - i);

    // Generate weeks based on selected year and month
    const weeksCount = month ? getWeeksInMonth(year, month) : 52;
    const weeks = Array.from({ length: weeksCount }, (_, i) => i + 1);

    // Notify parent when filters change (skip first mount to prevent infinite loop)
    useEffect(() => {
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false;
            return;
        }
        onChangeRef.current({ year, month, week });
    }, [year, month, week]);

    // Reset week when month changes
    const handleMonthChange = (newMonth: number | null) => {
        setMonth(newMonth);
        setWeek(null); // Reset week when month changes
    };

    // Reset month and week when year changes
    const handleYearChange = (newYear: number) => {
        setYear(newYear);
        // Keep current month if it's valid for the new year
    };

    return (
        <div className={`flex flex-col gap-2 md:flex-row md:items-center md:gap-3 ${className}`}>
            {/* Quick filters + Dropdowns - grouped on desktop */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium hidden sm:inline">Filter:</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => {
                            setYear(getCurrentYear());
                            setMonth(getCurrentMonth());
                            setWeek(getCurrentWeek());
                        }}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                        Week
                    </button>
                    <button
                        onClick={() => {
                            setYear(getCurrentYear());
                            setMonth(getCurrentMonth());
                            setWeek(null);
                        }}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                    >
                        Month
                    </button>
                    <button
                        onClick={() => {
                            setYear(getCurrentYear());
                            setMonth(null);
                            setWeek(null);
                        }}
                        className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        Year
                    </button>
                </div>
            </div>

            {/* Dropdowns - separate row on mobile, same row on desktop */}
            <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-2">
                {/* Year */}
                <div className="relative">
                    <select
                        value={year}
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        className="w-full appearance-none px-2 py-1.5 pr-6 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>

                {/* Month */}
                <div className="relative">
                    <select
                        value={month ?? ""}
                        onChange={(e) => handleMonthChange(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full appearance-none px-2 py-1.5 pr-6 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
                    >
                        <option value="">All</option>
                        {months.map((m) => (
                            <option key={m.value} value={m.value}>{m.label.substring(0, 3)}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>

                {/* Week */}
                {showWeekFilter && (
                    <div className="relative">
                        <select
                            value={week ?? ""}
                            onChange={(e) => setWeek(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full appearance-none px-2 py-1.5 pr-6 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
                        >
                            <option value="">All Wk</option>
                            {weeks.map((w) => (
                                <option key={w} value={w}>W{w}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                )}
            </div>
        </div>
    );
}
