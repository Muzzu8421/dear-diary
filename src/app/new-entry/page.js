"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Save, ArrowLeft, Smile, Tag, X, Check, Heart, ImagePlus, Trash2 } from "lucide-react";

export default function NewEntryPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [entryId] = useState(() => `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const fileInputRef = useRef(null);

  // ============ IMAGE FUNCTIONS ============

  const resizeImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = document.createElement('img');
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        
        img.onerror = reject;
        img.src = e.target.result;
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadError('');
    
    // Limit to 5 images per entry
    if (images.length + files.length > 5) {
      setUploadError('Maximum 5 images allowed per entry');
      return;
    }
    
    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please upload only image files');
        continue;
      }
      
      // Check file size (limit 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image too large. Please upload images under 5MB');
        continue;
      }
      
      try {
        // Resize and compress image
        const compressedBase64 = await resizeImage(file);
        
        // Check if compressed image is still too large (> 500KB in base64)
        if (compressedBase64.length > 500000) {
          setUploadError('Image still too large after compression. Try a smaller image.');
          continue;
        }
        
        const imageObj = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          data: compressedBase64,
          timestamp: Date.now(),
        };
        
        setImages(prev => [...prev, imageObj]);
      } catch (error) {
        console.error('Error processing image:', error);
        setUploadError('Error processing image. Please try again.');
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  // ============ LOCALSTORAGE FUNCTIONS ============

  const getEntries = () => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem('diary_entries');
    return data ? JSON.parse(data) : [];
  };

  const calculateStreak = (entries) => {
    if (entries.length === 0) return 0;
    
    const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mostRecentEntry = new Date(sortedEntries[0].date);
    mostRecentEntry.setHours(0, 0, 0, 0);
    
    const daysSinceLastEntry = Math.floor((today - mostRecentEntry) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastEntry > 1) return 0;
    
    let streak = 1;
    let currentDate = new Date(mostRecentEntry);
    
    for (let i = 1; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = new Date(entryDate);
      } else if (diffDays === 0) {
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const updateStats = useCallback((entries) => {
    const getStats = () => {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem('diary_stats');
      return data ? JSON.parse(data) : { longestStreak: 0 };
    };

    const currentStreak = calculateStreak(entries);
    const existingStats = getStats();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const entriesThisMonth = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    }).length;
    
    const stats = {
      totalEntries: entries.length,
      lastEntryDate: entries.length > 0 ? entries[0].date : null,
      currentStreak: currentStreak,
      longestStreak: Math.max(existingStats?.longestStreak || 0, currentStreak),
      entriesThisMonth: entriesThisMonth
    };
    
    localStorage.setItem('diary_stats', JSON.stringify(stats));
  }, []);

  // ============ SAVE HANDLERS ============

  const saveEntryToStorage = (entry) => {
    const entries = getEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);
    
    if (existingIndex !== -1) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    try {
      localStorage.setItem('diary_entries', JSON.stringify(entries));
      updateStats(entries);
      return entry;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        alert('Storage quota exceeded! Try removing some images or older entries.');
        return null;
      }
      throw e;
    }
  };

  const handleSave = () => {
    const entry = {
      id: entryId,
      date: new Date().toISOString(),
      title: title || 'Untitled Entry',
      content,
      mood,
      tags,
      images,
      favorite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const saved = saveEntryToStorage(entry);
    if (saved) {
      setSaved(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // ============ TAG HANDLERS ============

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // ============ DATA ============

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'excited', emoji: '🎉', label: 'Excited' },
    { value: 'thoughtful', emoji: '🤔', label: 'Thoughtful' },
    { value: 'stressed', emoji: '😰', label: 'Stressed' },
    { value: 'peaceful', emoji: '😌', label: 'Peaceful' },
  ];

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        .title-input {
          font-family: 'Crimson Pro', 'Georgia', serif;
          font-size: 2.5rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .content-textarea {
          font-family: 'Lora', 'Georgia', serif;
          font-size: 1.125rem;
          line-height: 1.8;
          letter-spacing: 0.01em;
        }

        .content-textarea::placeholder {
          font-style: italic;
          opacity: 0.5;
        }

        textarea {
          resize: none;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-in { animation: fadeIn 0.6s ease-out; }
        .fade-in-delay-1 { animation: fadeIn 0.6s ease-out 0.1s both; }
        .fade-in-delay-2 { animation: fadeIn 0.6s ease-out 0.2s both; }
        .fade-in-delay-3 { animation: fadeIn 0.6s ease-out 0.3s both; }

        .image-preview {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          aspect-ratio: 1;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-preview .delete-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .image-preview:hover .delete-overlay {
          opacity: 1;
        }
      `}</style>

      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
        {/* Header */}
        <header 
          className="sticky top-0 z-50 border-b backdrop-blur-md"
          style={{
            backgroundColor: 'var(--glass-bg)',
            borderColor: 'var(--border-medium)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="p-2 cursor-pointer rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setFavorite(!favorite)}
                className="p-2 cursor-pointer rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: favorite ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: favorite ? 'red' : 'var(--text-secondary)',
                }}
                title={favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className="w-5 h-5" 
                  fill={favorite ? "currentColor" : "none"}
                />
              </button>

              {saved && (
                <span 
                  className="flex items-center space-x-2 text-sm font-medium fade-in"
                  style={{ color: 'var(--color-success)' }}
                >
                  <Check className="w-4 h-4" />
                  <span>Saved</span>
                </span>
              )}
              
              <button
                onClick={handleSave}
                className="flex cursor-pointer items-center space-x-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--text-inverse)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary-hover)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Save className="w-4 h-4" />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Date Display */}
          <div className="fade-in mb-6">
            <p 
              className="text-sm font-medium tracking-wide uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Title Input */}
          <div className="fade-in-delay-1 mb-8">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your entry a title..."
              className="w-full bg-transparent border-0 outline-none title-input"
              style={{ color: 'var(--text-primary)' }}
              autoFocus
            />
          </div>

          {/* Mood Selector */}
          <div className="fade-in-delay-2 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <Smile className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                How are you feeling?
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className="px-4 cursor-pointer py-2 rounded-lg font-medium text-sm transition-all duration-200"
                  style={{
                    backgroundColor: mood === m.value ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                    color: mood === m.value ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: mood === m.value ? 'none' : '1px solid var(--border-subtle)',
                  }}
                >
                  <span className="mr-2">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="fade-in-delay-2 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <ImagePlus className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                <span 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Add Photos ({images.length}/5)
                </span>
              </div>
              
              <label
                className="px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={images.length >= 5}
                />
                Upload Image
              </label>
            </div>

            {uploadError && (
              <p className="text-sm mb-3" style={{ color: 'var(--color-error)' }}>
                {uploadError}
              </p>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="image-preview">
                    <img src={img.data} alt={img.name} />
                    <div className="delete-overlay">
                      <button
                        onClick={() => removeImage(img.id)}
                        className="p-2 rounded-full transition-all"
                        style={{
                          backgroundColor: 'var(--color-error)',
                          color: 'white',
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content Textarea */}
          <div className="fade-in-delay-3 mb-8">
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="w-full bg-transparent border-0 outline-none content-textarea"
              style={{ color: 'var(--text-primary)', minHeight: '200px' }}
              rows={10}
            />
          </div>

          {/* Tags Section */}
          <div className="fade-in-delay-3 mb-8">
            <div className="flex items-center space-x-3 mb-3">
              <Tag className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <span 
                className="text-sm font-semibold"
                style={{ color: 'var(--text-secondary)' }}
              >
                Tags
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: 'var(--accent-secondary)',
                    color: 'var(--text-inverse)',
                  }}
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 rounded-lg outline-none text-sm"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              />
              <button
                onClick={addTag}
                className="px-4 cursor-pointer py-2 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Word Count Footer */}
          <div 
            className="flex justify-between items-center pt-6 border-t text-sm"
            style={{ 
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <span>{wordCount} words · {charCount} characters</span>
            <span>{images.length} {images.length === 1 ? 'photo' : 'photos'}</span>
          </div>
        </main>
      </div>
    </>
  );
}