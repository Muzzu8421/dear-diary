"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Calendar, Tag as TagIcon, ChevronDown, SortAsc, Edit3 } from "lucide-react";

export default function MyDiariesPage() {
  const router = useRouter();
  
  // Define groupEntriesByMonth BEFORE it's used
  const groupEntriesByMonth = (entriesArray, sortType) => {
    // Sort entries based on sortType
    let sortedEntries = [...entriesArray];
    
    if (sortType === 'favorite') {
      // Sort by favorite first, then by date
      sortedEntries.sort((a, b) => {
        if (a.favorite === b.favorite) {
          return new Date(b.date) - new Date(a.date);
        }
        return a.favorite ? -1 : 1;
      });
    } else {
      // Sort by date (newest first)
      sortedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Group by month
    const grouped = {};
    sortedEntries.forEach(entry => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = {
          label: monthLabel,
          entries: []
        };
      }
      grouped[monthKey].entries.push(entry);
    });

    return grouped;
  };
  
  // Initialize entries from localStorage using lazy initialization
  const [entries, setEntries] = useState(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('diary_entries');
      return data ? JSON.parse(data) : [];
    }
    return [];
  });
  
  const [sortBy, setSortBy] = useState('date');
  
  // Initialize expanded months using lazy initialization
  const [expandedMonths, setExpandedMonths] = useState(() => {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('diary_entries');
      const loadedEntries = data ? JSON.parse(data) : [];
      
      if (loadedEntries.length > 0) {
        const grouped = groupEntriesByMonth(loadedEntries, 'date');
        const allMonthsExpanded = {};
        Object.keys(grouped).forEach(key => {
          allMonthsExpanded[key] = true;
        });
        return allMonthsExpanded;
      }
    }
    return {};
  });

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  const handleEntryClick = (entryId) => {
    // Navigate to view/edit entry page
    router.push(`/entry/${entryId}`);
  };

  const getMoodEmoji = (mood) => {
    const moods = {
      happy: '😊',
      sad: '😢',
      neutral: '😐',
      excited: '🎉',
      thoughtful: '🤔',
      stressed: '😰',
      peaceful: '😌'
    };
    return moods[mood] || '📝';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Calculate grouped entries based on current entries and sortBy
  const groupedEntries = groupEntriesByMonth(entries, sortBy);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Header */}
      <div 
        className="sticky top-16 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--border-medium)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                My Diaries
              </h1>
              <p 
                className="text-sm sm:text-base"
                style={{ color: 'var(--text-secondary)' }}
              >
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
              </p>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <SortAsc 
                className="w-5 h-5" 
                style={{ color: 'var(--accent-primary)' }}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg font-medium text-sm outline-none cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <option value="date">Sort by Date</option>
                <option value="favorite">Favorites First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {entries.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--bg-elevated)' }}
            >
              <Calendar 
                className="w-12 h-12" 
                style={{ color: 'var(--accent-primary)' }}
              />
            </div>
            <h2 
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              No entries yet
            </h2>
            <p 
              className="text-center mb-6"
              style={{ color: 'var(--text-secondary)' }}
            >
              Start your journaling journey by creating your first entry
            </p>
            <button
              onClick={() => router.push('/new-entry')}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-inverse)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Create First Entry
            </button>
          </div>
        ) : (
          // Entries List
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([monthKey, monthData]) => (
              <div key={monthKey}>
                {/* Month Header */}
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full flex items-center justify-between mb-4 p-4 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar 
                      className="w-5 h-5" 
                      style={{ color: 'var(--accent-primary)' }}
                    />
                    <h2 
                      className="text-xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {monthData.label}
                    </h2>
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-inverse)',
                      }}
                    >
                      {monthData.entries.length}
                    </span>
                  </div>
                  <ChevronDown 
                    className="w-5 h-5 transition-transform duration-200"
                    style={{ 
                      color: 'var(--text-secondary)',
                      transform: expandedMonths[monthKey] ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>

                {/* Month Entries */}
                {expandedMonths[monthKey] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {monthData.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="relative p-5 rounded-xl transition-all duration-200 cursor-pointer group"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {/* Favorite Badge and Edit Button */}
                        <div className="absolute top-3 right-3 flex items-center space-x-2">
                          {entry.favorite && (
                            <div 
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              <Heart className="w-5 h-5" fill="currentColor" />
                            </div>
                          )}
                          
                          {/* Edit Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEntryClick(entry.id);
                            }}
                            className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                            style={{
                              backgroundColor: 'var(--bg-hover)',
                              color: 'var(--text-secondary)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                              e.currentTarget.style.color = 'var(--text-inverse)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                            title="Edit entry"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Entry Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 pr-8">
                            <h3 
                              className="text-lg font-bold mb-1 line-clamp-1"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {entry.title}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span 
                                className="text-sm font-medium"
                                style={{ color: 'var(--accent-primary)' }}
                              >
                                {formatDate(entry.date)}
                              </span>
                              {entry.mood && (
                                <span className="text-base">
                                  {getMoodEmoji(entry.mood)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Entry Content Preview */}
                        <p 
                          className="text-sm mb-3 line-clamp-3"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {truncateContent(entry.content)}
                        </p>

                        {/* Entry Footer - Tags */}
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {entry.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: 'var(--bg-hover)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <TagIcon className="w-3 h-3" />
                                <span>{tag}</span>
                              </span>
                            ))}
                            {entry.tags.length > 3 && (
                              <span
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                                style={{
                                  backgroundColor: 'var(--bg-hover)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                +{entry.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}