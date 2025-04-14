'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [time, setTime] = useState('00:00:00');
  const [inputBuffer, setInputBuffer] = useState('000000');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [endColor, setEndColor] = useState('#FF5733'); // Default end color
  const [showColorPicker, setShowColorPicker] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const parseTime = (timeString: string) => {
    const hours = parseInt(timeString.slice(0, 2));
    const minutes = parseInt(timeString.slice(2, 4));
    const seconds = parseInt(timeString.slice(4, 6));
    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatInputBuffer = (buffer: string) => {
    const padded = buffer.padStart(6, '0');
    return `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Don't capture keys if timer is running
    if (isRunning || e.target instanceof HTMLInputElement) return;
    
    // Handle numeric keys
    if (/^\d$/.test(e.key)) {
      setInputBuffer(prev => {
        const newBuffer = (prev + e.key).slice(-6); // Keep last 6 digits
        return newBuffer;
      });
    } 
    // Handle backspace/delete
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      setInputBuffer(prev => prev.slice(0, -1));
    }
  };

  const startTimer = () => {
    if (!isRunning && !isPaused) {
      setRemainingSeconds(parseTime(inputBuffer));
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime('00:00:00');
    setRemainingSeconds(0);
  };

  const clearTimer = () => {
    stopTimer();
    setInputBuffer('000000');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    // Apply dark mode to document
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  useEffect(() => {
    // Only set up keydown listener if main element exists
    if (mainRef.current) {
      mainRef.current.focus();
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRunning]); // Re-add when isRunning changes

  useEffect(() => {
    setTime(formatInputBuffer(inputBuffer));
  }, [inputBuffer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            
            // Apply end color to background when timer finishes
            if (mainRef.current) {
              mainRef.current.style.backgroundColor = endColor;
              // Keep text color for contrast
              mainRef.current.style.color = isDarkMode ? '#ffffff' : '#000000';
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, endColor, isDarkMode]);

  useEffect(() => {
    setTime(formatTime(remainingSeconds));
  }, [remainingSeconds]);

  // Here is the web page code
  return (
    <main 
      ref={mainRef}
      className="min-h-screen flex flex-col items-center justify-center pt-20 outline-none countdown-container"
      tabIndex={0}
    >
      <div className="font-mono mb-8 countdown-timer">
        {isRunning || isPaused ? time : formatInputBuffer(inputBuffer)}
      </div>
      
      <div className="flex flex-col items-center gap-4 control-group">
        {!isRunning && !isPaused && (
          <div className="text-5xl mb-2 input-hint">
            Type numbers to set time, backspace to delete
          </div>
        )}
        
        <div className="flex gap-4 mt-4 countdown-controls">
          <button
            onClick={startTimer}
            className="btn"
            disabled={isRunning && !isPaused}
          >
            ▶
          </button>
          <button
            onClick={pauseTimer}
            className="btn"
            disabled={!isRunning || isPaused}
          >
            ⏸
          </button>
          <button
            onClick={stopTimer}
            className="btn"
            disabled={!isRunning && !isPaused}
          >
            ⏹
          </button>
          <button
            onClick={clearTimer}
            className="btn"
          >
            ↺
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 control-group">
          <button
            onClick={toggleDarkMode}
            className="btn theme-toggle"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <div className="color-picker-container">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="color-picker-btn"
            >
              Set End Color
            </button>
            
            <div 
              className="color-preview"
              style={{ backgroundColor: endColor }}
            ></div>
            
            {showColorPicker && (
              <input 
                type="color" 
                value={endColor}
                onChange={(e) => setEndColor(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
