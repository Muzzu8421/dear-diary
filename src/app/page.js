"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Lazy initialization - reads from localStorage only once on mount
  const [stats] = useState(() => {
    const savedStats = localStorage.getItem('diary_stats');
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      return {
        totalEntries: parsedStats.totalEntries || 0,
        entriesThisMonth: parsedStats.entriesThisMonth || 0,
        currentStreak: parsedStats.currentStreak || 0,
      };
    }
    return {
      totalEntries: 0,
      entriesThisMonth: 0,
      currentStreak: 0,
    };
  });

  // Lazy initialization for entry dates
  const [entryDates] = useState(() => {
    const savedEntries = localStorage.getItem('diary_entries');
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      const dates = new Set();
      
      // Handle both single entry object and array of entries
      const entriesArray = Array.isArray(entries) ? entries : [entries];
      
      entriesArray.forEach(entry => {
        if (entry.date) {
          const entryDate = new Date(entry.date);
          // Store date as YYYY-MM-DD for easy comparison
          const dateKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}-${entryDate.getDate()}`;
          dates.add(dateKey);
        }
      });
      
      return dates;
    }
    return new Set();
  });

  // Calendar logic
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const hasEntry = (day) => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return entryDates.has(dateKey);
  };

  const handleDateClick = (day) => {
    setSelectedDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate calendar days array
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 sm:space-y-6 pt-8 sm:pt-12">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Your Personal Space
          </h2>
          <p
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Capture your thoughts, memories, and moments. One day at a time.
          </p>

          {/* New Entry Button */}
          <Link href="/new-entry">
          <button
            className="group cursor-pointer inline-flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl mt-6"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "var(--text-inverse)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--accent-primary-hover)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-primary)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>New Entry</span>
          </button>
          </Link>
        </div>

        {/* Calendar Section */}
        <div
          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl"
          style={{
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border-medium)",
          }}
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <button
              onClick={previousMonth}
              className="p-2 sm:p-2.5 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <h3
              className="text-xl sm:text-2xl md:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>

            <button
              onClick={nextMonth}
              className="p-2 sm:p-2.5 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs sm:text-sm font-semibold py-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const today = isToday(day);
              const selected = isSelected(day);
              const hasEntryOnDate = hasEntry(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className="aspect-square rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-base font-medium transition-all duration-200 relative"
                  style={{
                    backgroundColor: selected
                      ? "var(--accent-primary)"
                      : hasEntryOnDate
                        ? "var(--color-success)"
                        : today
                          ? "var(--bg-elevated)"
                          : "transparent",
                    color: selected || hasEntryOnDate
                      ? "var(--text-inverse)"
                      : today
                        ? "var(--accent-primary)"
                        : "var(--text-primary)",
                    border: today && !selected && !hasEntryOnDate 
                      ? "2px solid var(--accent-primary)" 
                      : "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected && !hasEntryOnDate) {
                      e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected && !hasEntryOnDate) {
                      e.currentTarget.style.backgroundColor = today
                        ? "var(--bg-elevated)"
                        : "transparent";
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Selected Date Display */}
          <div
            className="mt-6 sm:mt-8 pt-6 sm:pt-8 text-center"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Selected Date
            </p>
            <p
              className="text-lg sm:text-xl font-semibold"
              style={{ color: "var(--accent-primary)" }}
            >
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Total Entries", value: stats.totalEntries },
            { label: "This Month", value: stats.entriesThisMonth },
            { label: "Current Streak", value: `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}` },
          ].map((stat, index) => (
            <div
              key={index}
              className="rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
              style={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <p
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-1"
                style={{ color: "var(--accent-primary)" }}
              >
                {stat.value}
              </p>
              <p
                className="text-xs sm:text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}