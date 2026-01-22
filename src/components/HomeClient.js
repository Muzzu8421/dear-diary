// components/HomeClient.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * HomeClient — client-only calendar/dashboard
 * - Reads localStorage in lazy initializers (no setState in useEffect)
 * - Uses composite keys for calendar cells to avoid duplicate keys
 */

export default function HomeClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // === Lazy initializer for stats (runs once, client-side)
  const [stats] = useState(() => {
    try {
      if (typeof window === "undefined") return { totalEntries: 0, entriesThisMonth: 0, currentStreak: 0 };

      const raw = localStorage.getItem("diary_stats");
      if (!raw) return { totalEntries: 0, entriesThisMonth: 0, currentStreak: 0 };

      const parsed = JSON.parse(raw);
      return {
        totalEntries: parsed.totalEntries ?? 0,
        entriesThisMonth: parsed.entriesThisMonth ?? 0,
        currentStreak: parsed.currentStreak ?? 0,
      };
    } catch (err) {
      console.error("Failed to read diary_stats:", err);
      return { totalEntries: 0, entriesThisMonth: 0, currentStreak: 0 };
    }
  });

  // === Lazy initializer for entryDates (Set of YYYY-M-D strings)
  const [entryDates] = useState(() => {
    try {
      if (typeof window === "undefined") return new Set();

      const raw = localStorage.getItem("diary_entries");
      if (!raw) return new Set();

      const entries = JSON.parse(raw);
      const arr = Array.isArray(entries) ? entries : [entries];
      const s = new Set();

      arr.forEach(entry => {
        if (!entry?.date) return;
        const d = new Date(entry.date);
        s.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
      });
      return s;
    } catch (err) {
      console.error("Failed to read diary_entries:", err);
      return new Set();
    }
  });

  // ---------- calendar helpers ----------
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const hasEntry = (day) => entryDates.has(`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // build calendar days with null placeholders for leading days
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center pt-12">
          <h2 className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>Your Personal Space</h2>
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>Capture your thoughts, memories, and moments.</p>

          <Link href="/new-entry">
            <button
              className="mt-6 inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold shadow-lg"
              style={{ backgroundColor: "var(--accent-primary)", color: "var(--text-inverse)" }}
            >
              <Plus className="w-6 h-6" /> New Entry
            </button>
          </Link>
        </div>

        {/* Calendar */}
        <div className="rounded-3xl p-8 shadow-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <div className="flex justify-between mb-8">
            <button onClick={previousMonth} aria-label="Previous month" className="p-2">
              <ChevronLeft />
            </button>

            <h3 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>

            <button onClick={nextMonth} aria-label="Next month" className="p-2">
              <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-3 mb-4">
            {dayNames.map(d => (
              <div key={d} className="text-center text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-3">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              // composite key guarantees uniqueness within this render
              const cellKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}-${index}`;
              const selected = day === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth() &&
                currentDate.getFullYear() === selectedDate.getFullYear();
              const today = (()=>{
                const t = new Date();
                return day === t.getDate() && t.getMonth() === currentDate.getMonth() && t.getFullYear() === currentDate.getFullYear();
              })();

              const has = hasEntry(day);

              return (
                <button
                  key={cellKey}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className="aspect-square rounded-xl flex items-center justify-center font-medium transition-all"
                  style={{
                    backgroundColor: selected ? "var(--accent-primary)" : has ? "var(--color-success)" : today ? "var(--bg-elevated)" : "transparent",
                    color: selected || has ? "var(--text-inverse)" : today ? "var(--accent-primary)" : "var(--text-primary)",
                    border: today && !selected && !has ? "2px solid var(--accent-primary)" : "2px solid transparent"
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Total Entries" value={stats.totalEntries} />
          <Stat label="This Month" value={stats.entriesThisMonth} />
          <Stat label="Current Streak" value={`${stats.currentStreak} ${stats.currentStreak === 1 ? "day" : "days"}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
      <p className="text-3xl font-bold" style={{ color: "var(--accent-primary)" }}>{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </div>
  );
}
