import { useState, useMemo } from 'react';
import './DateRangePicker.css';

type DateRangePickerProps = {
    onCancel?: () => void;
    onDone?: (startDate: Date | null, endDate: Date | null) => void;
    initialStartDate?: Date | null;
    initialEndDate?: Date | null;
};

type PredefinedPeriod = 'yesterday' | 'lastWeek' | 'lastMonth' | 'lastYear';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/**
 * Get days in a month
 */
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day of week for the first day of the month (0 = Monday, 6 = Sunday)
 */
function getFirstDayOfMonth(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay();
    // Convert from Sunday = 0 to Monday = 0
    return day === 0 ? 6 : day - 1;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * Check if a date is between two dates (inclusive)
 */
function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
    if (!start || !end) return false;
    const dateTime = date.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();
    return dateTime >= startTime && dateTime <= endTime;
}

/**
 * Calculate days between two dates
 */
function daysBetween(start: Date | null, end: Date | null): number {
    if (!start || !end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Date Range Picker Component
 * Two-month calendar view with predefined periods and date range selection
 */
export function DateRangePicker({
    onCancel,
    onDone,
    initialStartDate = null,
    initialEndDate = null,
}: DateRangePickerProps) {
    // State for selected dates
    const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
    const [endDate, setEndDate] = useState<Date | null>(initialEndDate);

    // State for currently displayed months (left calendar)
    const [currentYear, setCurrentYear] = useState(() => {
        const date = initialStartDate || new Date();
        return date.getFullYear();
    });
    const [currentMonth, setCurrentMonth] = useState(() => {
        const date = initialStartDate || new Date();
        return date.getMonth();
    });

    // Calculate right calendar month
    const rightMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const rightYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    // Navigate to previous month
    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    // Navigate to next month
    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Handle date click
    const handleDateClick = (year: number, month: number, day: number) => {
        const clickedDate = new Date(year, month, day);

        if (!startDate || (startDate && endDate)) {
            // Start new selection
            setStartDate(clickedDate);
            setEndDate(null);
        } else if (startDate && !endDate) {
            // Complete selection
            if (clickedDate.getTime() < startDate.getTime()) {
                // Clicked before start, swap
                setEndDate(startDate);
                setStartDate(clickedDate);
            } else {
                setEndDate(clickedDate);
            }
        }
    };

    // Handle predefined period selection
    const handlePredefinedPeriod = (period: PredefinedPeriod) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let start: Date;
        let end: Date;

        switch (period) {
            case 'yesterday':
                start = new Date(today);
                start.setDate(today.getDate() - 1);
                end = new Date(start);
                break;
            case 'lastWeek':
                end = new Date(today);
                end.setDate(today.getDate() - 1);
                start = new Date(end);
                start.setDate(end.getDate() - 6);
                break;
            case 'lastMonth':
                end = new Date(today);
                end.setDate(today.getDate() - 1);
                start = new Date(end);
                start.setMonth(end.getMonth() - 1);
                break;
            case 'lastYear':
                end = new Date(today);
                end.setDate(today.getDate() - 1);
                start = new Date(end);
                start.setFullYear(end.getFullYear() - 1);
                break;
        }

        setStartDate(start);
        setEndDate(end);

        // Navigate to show the selected range
        setCurrentYear(start.getFullYear());
        setCurrentMonth(start.getMonth());
    };

    // Handle Done button
    const handleDone = () => {
        onDone?.(startDate, endDate);
    };

    // Handle Cancel button
    const handleCancel = () => {
        onCancel?.();
    };

    // Calculate selected days count
    const selectedDaysCount = useMemo(() => {
        return daysBetween(startDate, endDate);
    }, [startDate, endDate]);

    // Render calendar grid for a month
    const renderCalendar = (year: number, month: number) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDayOfMonth = getFirstDayOfMonth(year, month);
        const days: (number | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day);
        }

        // Group into weeks
        const weeks: (number | null)[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return (
            <div className="date-range-picker__calendar">
                {/* Day headers */}
                <div className="date-range-picker__weekdays">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="date-range-picker__weekday">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Date grid */}
                <div className="date-range-picker__dates">
                    {weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="date-range-picker__week">
                            {week.map((day, dayIndex) => {
                                if (day === null) {
                                    return (
                                        <div
                                            key={`empty-${dayIndex}`}
                                            className="date-range-picker__date date-range-picker__date--empty"
                                        />
                                    );
                                }

                                const currentDate = new Date(year, month, day);
                                const isStart = isSameDay(currentDate, startDate);
                                const isEnd = isSameDay(currentDate, endDate);
                                const isInRange = isDateInRange(currentDate, startDate, endDate);
                                const isRangeStart = isStart && endDate !== null;
                                const isRangeEnd = isEnd && startDate !== null;

                                let className = 'date-range-picker__date';
                                if (isStart || isEnd) {
                                    className += ' date-range-picker__date--selected';
                                }
                                if (isInRange && !isStart && !isEnd) {
                                    className += ' date-range-picker__date--in-range';
                                }
                                if (isRangeStart) {
                                    className += ' date-range-picker__date--range-start';
                                }
                                if (isRangeEnd) {
                                    className += ' date-range-picker__date--range-end';
                                }

                                return (
                                    <button
                                        key={day}
                                        className={className}
                                        onClick={() => handleDateClick(year, month, day)}
                                        type="button"
                                    >
                                        <span className="date-range-picker__date-text">{day}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="date-range-picker__container">
            <div className="date-range-picker">
                {/* Main content area */}
                <div className="date-range-picker__content">
                    {/* Calendars section */}
                    <div className="date-range-picker__calendars">
                        {/* Left Calendar */}
                        <button
                            className="date-range-picker__nav date-range-picker__nav--prev"
                            onClick={goToPreviousMonth}
                            type="button"
                            aria-label="Previous month"
                        >
                            {/* TODO: Add chevron left SVG icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                        <div className="date-range-picker__month">
                            <h3 className="date-range-picker__month-title">
                                {MONTHS[currentMonth]} {currentYear}
                            </h3>
                            {renderCalendar(currentYear, currentMonth)}
                        </div>

                        {/* Right Calendar */}
                        <div className="date-range-picker__month">
                            <h3 className="date-range-picker__month-title">
                                {MONTHS[rightMonth]} {rightYear}
                            </h3>
                            {renderCalendar(rightYear, rightMonth)}
                        </div>
                        <button
                            className="date-range-picker__nav date-range-picker__nav--next"
                            onClick={goToNextMonth}
                            type="button"
                            aria-label="Next month"
                        >
                            {/* TODO: Add chevron right SVG icon */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    </div>

                    {/* Predefined periods section */}
                    <div className="date-range-picker__presets">
                        <h4 className="date-range-picker__presets-title">Predefined periods:</h4>
                        <button
                            className="date-range-picker__preset"
                            onClick={() => handlePredefinedPeriod('yesterday')}
                            type="button"
                        >
                            Yesterday
                        </button>
                        <button
                            className="date-range-picker__preset"
                            onClick={() => handlePredefinedPeriod('lastWeek')}
                            type="button"
                        >
                            Last week
                        </button>
                        <button
                            className="date-range-picker__preset"
                            onClick={() => handlePredefinedPeriod('lastMonth')}
                            type="button"
                        >
                            Last month
                        </button>
                        <button
                            className="date-range-picker__preset"
                            onClick={() => handlePredefinedPeriod('lastYear')}
                            type="button"
                        >
                            Last year
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="date-range-picker__footer">
                    <button
                        className="date-range-picker__button date-range-picker__button--cancel"
                        onClick={handleCancel}
                        type="button"
                    >
                        Cancel
                    </button>
                    <div className="date-range-picker__footer-right">
                        <span className="date-range-picker__selected-count">
                            Selected: {selectedDaysCount} day{selectedDaysCount !== 1 ? 's' : ''}
                        </span>
                        <button
                            className="date-range-picker__button date-range-picker__button--done"
                            onClick={handleDone}
                            type="button"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DateRangePicker;
