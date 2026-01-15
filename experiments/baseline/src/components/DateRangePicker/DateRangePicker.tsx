import { useState } from 'react';
import './DateRangePicker.css';

type DateRange = {
    start: Date | null;
    end: Date | null;
};

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

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
}

function isSameDay(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
    if (!start || !end) return false;
    return date >= start && date <= end;
}

export function DateRangePicker() {
    const [currentMonth, setCurrentMonth] = useState(4); // May (0-indexed)
    const [currentYear, setCurrentYear] = useState(2019);
    const [dateRange, setDateRange] = useState<DateRange>({
        start: new Date(2019, 4, 21),
        end: new Date(2019, 5, 10),
    });

    const handleDateClick = (date: Date) => {
        if (!dateRange.start || (dateRange.start && dateRange.end)) {
            setDateRange({ start: date, end: null });
        } else {
            if (date < dateRange.start) {
                setDateRange({ start: date, end: dateRange.start });
            } else {
                setDateRange({ ...dateRange, end: date });
            }
        }
    };

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handlePredefinedPeriod = (period: string) => {
        const today = new Date(2019, 5, 10); // June 10, 2019 as "today"
        let start: Date;
        let end: Date = today;

        switch (period) {
            case 'Yesterday':
                start = new Date(today);
                start.setDate(today.getDate() - 1);
                end = start;
                break;
            case 'Last week':
                start = new Date(today);
                start.setDate(today.getDate() - 7);
                break;
            case 'Last month':
                start = new Date(today);
                start.setMonth(today.getMonth() - 1);
                break;
            case 'Last year':
                start = new Date(today);
                start.setFullYear(today.getFullYear() - 1);
                break;
            default:
                return;
        }

        setDateRange({ start, end });
    };

    const getDaysBetween = (): number => {
        if (!dateRange.start || !dateRange.end) return 0;
        const diff = dateRange.end.getTime() - dateRange.start.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    };

    const renderMonth = (monthOffset: number) => {
        const month = (currentMonth + monthOffset) % 12;
        const year = currentYear + Math.floor((currentMonth + monthOffset) / 12);
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return (
            <div className="calendar-month">
                <h3 className="month-title">
                    {MONTHS[month]} {year}
                </h3>
                <div className="calendar-grid">
                    {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="day-name">
                            {day}
                        </div>
                    ))}
                    {days.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="calendar-day empty" />;
                        }

                        const date = new Date(year, month, day);
                        const isStart = isSameDay(date, dateRange.start);
                        const isEnd = isSameDay(date, dateRange.end);
                        const inRange = isInRange(date, dateRange.start, dateRange.end);

                        return (
                            <button
                                key={day}
                                className={`calendar-day ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''} ${
                                    inRange ? 'in-range' : ''
                                }`}
                                onClick={() => handleDateClick(date)}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="date-range-picker">
            <div className="picker-container">
                <div className="picker-header">
                    <button className="nav-button" onClick={handlePrevMonth}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button className="nav-button" onClick={handleNextMonth}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>

                <div className="calendars-wrapper">
                    <div className="calendars-container">
                        {renderMonth(0)}
                        {renderMonth(1)}
                    </div>

                    <div className="predefined-periods">
                        <h4 className="periods-title">Predefined periods:</h4>
                        <button className="period-button" onClick={() => handlePredefinedPeriod('Yesterday')}>
                            Yesterday
                        </button>
                        <button className="period-button" onClick={() => handlePredefinedPeriod('Last week')}>
                            Last week
                        </button>
                        <button className="period-button" onClick={() => handlePredefinedPeriod('Last month')}>
                            Last month
                        </button>
                        <button className="period-button" onClick={() => handlePredefinedPeriod('Last year')}>
                            Last year
                        </button>
                    </div>
                </div>

                <div className="picker-footer">
                    <button className="cancel-button">Cancel</button>
                    <div className="footer-right">
                        <span className="selected-days">Selected: {getDaysBetween()} days</span>
                        <button className="done-button">Done</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
