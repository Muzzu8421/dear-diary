"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpenText, Home, Menu, X, Palette, Notebook } from "lucide-react";

export default function Navbar() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("diary-theme") || "navy";
    }
    return "navy";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("diary-theme", newTheme);
  };

  const navLinks = [
    { id: "home", label: "Home", icon: Home, url: "/" },
    { id: "diaries", label: "My Diaries", icon: Notebook, url: "/my-diaries" },
  ];

  const themes = [
    { id: "navy", label: "Deep Navy" },
    { id: "charcoal", label: "Charcoal" },
    { id: "earthy", label: "Earthy" },
  ];

  return (
    <>
      <style>{`
        body {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          transition: background-color 0.3s ease, color 0.3s ease;
        }
      `}</style>

      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          backgroundColor: "var(--glass-bg)",
          borderColor: "var(--border-medium)",
        }}
      >
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo / Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--accent-primary)" }}
              >
                <BookOpenText
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  style={{ color: "var(--text-inverse)" }}
                />
              </div>
              <h1
                className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Dear Diary
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeNav === link.id;
                return (
                  <Link key={link.id} href={link.url}>
                    <button
                      onClick={() => setActiveNav(link.id)}
                      className="px-4 cursor-pointer py-2 rounded-lg flex items-center space-x-2 transition-all duration-200"
                      style={{
                        backgroundColor: isActive
                          ? "var(--bg-elevated)"
                          : "transparent",
                        color: isActive
                          ? "var(--accent-primary)"
                          : "var(--text-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor =
                            "var(--bg-hover)";
                          e.currentTarget.style.color = "var(--text-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "var(--text-secondary)";
                        }
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </button>
                  </Link>
                );
              })}
            </div>

            {/* Theme Selector & Mobile Menu Button */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Selector - Desktop */}
              <div className="hidden sm:block relative">
                <div
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--border-medium)",
                  }}
                >
                  <Palette
                    className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                    style={{ color: "var(--accent-primary)" }}
                  />
                  <select
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer font-medium text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {themes.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        style={{
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theme Selector - Mobile (Icon Only) */}
              <div className="sm:hidden relative">
                <select
                  value={theme}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  className="appearance-none w-10 h-10 rounded-lg border cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--bg-elevated)",
                    borderColor: "var(--border-medium)",
                    color: "var(--accent-primary)",
                    backgroundImage: "none",
                    paddingLeft: "0.625rem",
                  }}
                >
                  {themes.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {t.id === "navy"
                        ? "🌊"
                        : t.id === "charcoal"
                          ? "🌙"
                          : "🌿"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                }}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div
              className="md:hidden pb-3 sm:pb-4 space-y-1 sm:space-y-2"
              style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "0.75rem",
              }}
            >
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeNav === link.id;
                return (
                  <Link key={link.id} href={link.url}>
                    <button
                      onClick={() => {
                        setActiveNav(link.id);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 text-left"
                      style={{
                        backgroundColor: isActive
                          ? "var(--bg-elevated)"
                          : "transparent",
                        color: isActive
                          ? "var(--accent-primary)"
                          : "var(--text-secondary)",
                      }}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="font-medium text-sm sm:text-base">
                        {link.label}
                      </span>
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
