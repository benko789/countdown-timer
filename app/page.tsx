'use client';

import { useState, useEffect, useRef } from 'react';

// Font options
const fontOptions = [
  { name: 'Monospace', style: 'font-mono' },
  { name: 'Sans-serif', style: 'font-sans' },
  { name: 'Serif', style: 'font-serif' }
];

// Font weight options
const weightOptions = [
  { name: 'Normal', value: 'font-normal' },
  { name: 'Medium', value: 'font-medium' },
  { name: 'Bold', value: 'font-bold' }
];

export default function Home() {
  const [time, setTime] = useState('00:00:00');
  const [inputBuffer, setInputBuffer] = useState('000000');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [endColor, setEndColor] = useState('#FF5733'); // Default end color
  const [pauseColor, setPauseColor] = useState('#EDC912'); // Default pause color
  const [showEndColorPicker, setShowEndColorPicker] = useState(false);
  const [showPauseColorPicker, setShowPauseColorPicker] = useState(false);
  const [selectedFont, setSelectedFont] = useState(fontOptions[0].style);
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0].value);
  const [showDev, setShowDev] = useState(false);
  const [originalSeconds, setOriginalSeconds] = useState(0); // Track total time for progress bar
  const mainRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const pauseColorPickerRef = useRef<HTMLInputElement>(null);

  const parseTime = (timeString: string) => {
    const hours = parseInt(timeString.slice(0, 2));
    const minutes = parseInt(timeString.slice(2, 4));
    const seconds = parseInt(timeString.slice(4, 6));
    return hours * 3600 + minutes * 60 + seconds;
  };

  const normalizeTime = (timeString: string) => {
    // Extract hours, minutes, seconds
    let hours = parseInt(timeString.slice(0, 2));
    let minutes = parseInt(timeString.slice(2, 4));
    let seconds = parseInt(timeString.slice(4, 6));
    
    // Adjust if seconds >= 60
    if (seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds %= 60;
    }
    
    // Adjust if minutes >= 60
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }
    
    // Format back to string
    return `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
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
    // Don't capture keys if timer is running or paused
    if (isRunning || isPaused || e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
    
    // Handle numeric keys
    if (/^\d$/.test(e.key)) {
      setInputBuffer(prev => {
        // Shift digits left and add new digit at the end, keeping only 6 digits
        return (prev + e.key).slice(-6);
      });
    } 
    // Handle backspace/delete
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      setInputBuffer(prev => prev.slice(0, -1));
    }
  };

  const startTimer = () => {
    // If already paused, resume from current time
    if (isPaused) {
      setIsRunning(true);
      setIsPaused(false);
      
      // Reset background if it was changed during pause
      if (mainRef.current) {
        mainRef.current.style.backgroundColor = '';
        mainRef.current.style.color = '';
      }
      
      return;
    }
    
    if (!isRunning) {
      // Normalize time before starting (handle minutes/seconds >= 60)
      const normalizedBuffer = normalizeTime(inputBuffer);
      setInputBuffer(normalizedBuffer);
      
      // Check if timer is 00:00:00, don't start if it is
      const seconds = parseTime(normalizedBuffer);
      if (seconds === 0) return;
      
      setRemainingSeconds(seconds);
      setOriginalSeconds(seconds); // Store original time for progress bar
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    
    // Apply pause color
    if (mainRef.current) {
      mainRef.current.style.backgroundColor = pauseColor;
      // Keep text color for contrast
      mainRef.current.style.color = isDarkMode ? '#ffffff' : '#000000';
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime('00:00:00');
    setRemainingSeconds(0);
    
    // Reset background if timer was ended or paused
    if (mainRef.current) {
      mainRef.current.style.backgroundColor = '';
      mainRef.current.style.color = '';
    }
  };

  const resetTimer = () => {
    stopTimer();
    setInputBuffer('000000');
    setOriginalSeconds(0);
  };

  const toggleDarkMode = (value: boolean) => {
    setIsDarkMode(value);
  };

  const toggleDevMode = () => {
    setShowDev(prev => !prev);
  };

  const handleEndColorClick = () => {
    setShowEndColorPicker(true);
    // Use setTimeout to ensure the DOM is updated before focusing
    setTimeout(() => {
      if (colorPickerRef.current) {
        colorPickerRef.current.click();
      }
    }, 0);
  };

  const handlePauseColorClick = () => {
    setShowPauseColorPicker(true);
    // Use setTimeout to ensure the DOM is updated before focusing
    setTimeout(() => {
      if (pauseColorPickerRef.current) {
        pauseColorPickerRef.current.click();
      }
    }, 0);
  };

  // Handle clicks outside the color picker to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showEndColorPicker && !e.composedPath().includes(colorPickerRef.current as EventTarget)) {
        setShowEndColorPicker(false);
      }
      if (showPauseColorPicker && !e.composedPath().includes(pauseColorPickerRef.current as EventTarget)) {
        setShowPauseColorPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showEndColorPicker, showPauseColorPicker]);

  // Calculate progress percentage for the progress bar
  const calculateProgress = () => {
    if (originalSeconds === 0) return 0;
    const progress = ((originalSeconds - remainingSeconds) / originalSeconds) * 100;
    return Math.min(Math.max(progress, 0), 100); // Ensure between 0-100
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
  }, [isRunning, isPaused]); // Re-add when running or paused state changes

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

  return (
    <main 
      ref={mainRef}
      className="countdown-container"
      tabIndex={0}
    >
      <div className={`countdown-timer ${selectedFont} ${selectedWeight}`}>
        {isRunning || isPaused ? time : formatInputBuffer(inputBuffer)}
      </div>
      
      <div className="control-group">
        {/* Fixed height container for hints to prevent layout shift */}
        <div className="input-hint-container">
          {!isRunning && !isPaused && (
            <div className="input-hint">
              Type numbers to set time, backspace to delete
            </div>
          )}
        </div>
        
        <div className="countdown-controls">
          <button
            onClick={startTimer}
            className={`text-btn ${isRunning && !isPaused ? 'active' : ''}`}
            disabled={isRunning && !isPaused || (!isPaused && parseTime(inputBuffer) === 0)}
          >
            {isPaused ? 'resume' : 'start'}
          </button>
          <button
            onClick={pauseTimer}
            className={`text-btn ${isPaused ? 'active' : ''}`}
            disabled={!isRunning || isPaused}
          >
            pause
          </button>
          <button
            onClick={stopTimer}
            className="text-btn"
            disabled={!isRunning && !isPaused}
          >
            stop
          </button>
          <button
            onClick={resetTimer}
            className="text-btn"
          >
            reset
          </button>
        </div>

        <div className="theme-toggle-container">
          <button
            onClick={() => toggleDarkMode(false)}
            className={`text-btn ${!isDarkMode ? 'active' : ''}`}
          >
            light
          </button>
          <button
            onClick={() => toggleDarkMode(true)}
            className={`text-btn ${isDarkMode ? 'active' : ''}`}
          >
            dark
          </button>
        </div>
        
        <button
          onClick={toggleDevMode}
          className={`text-btn ${showDev ? 'active' : ''}`}
        >
          dev
        </button>
        
        {/* Fixed height dev section to prevent layout shifts */}
        <div className="dev-section-container">
          <div className={`dev-section ${showDev ? 'visible' : ''}`}>
            <div className="control-group">
              <div className="color-picker-container">
                <span>End color:</span>
                <div 
                  className="color-preview"
                  style={{ backgroundColor: endColor }}
                  onClick={handleEndColorClick}
                ></div>
                
                {showEndColorPicker && (
                  <input 
                    ref={colorPickerRef}
                    type="color" 
                    value={endColor}
                    onChange={(e) => setEndColor(e.target.value)}
                  />
                )}
              </div>
              
              <div className="color-picker-container">
                <span>Pause color:</span>
                <div 
                  className="color-preview"
                  style={{ backgroundColor: pauseColor }}
                  onClick={handlePauseColorClick}
                ></div>
                
                {showPauseColorPicker && (
                  <input 
                    ref={pauseColorPickerRef}
                    type="color" 
                    value={pauseColor}
                    onChange={(e) => setPauseColor(e.target.value)}
                  />
                )}
              </div>
              
              <div className="font-selector">
                <div className="font-option">
                  <span>Font:</span>
                  <select 
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                  >
                    {fontOptions.map(option => (
                      <option key={option.style} value={option.style}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="font-option">
                  <span>Weight:</span>
                  <select 
                    value={selectedWeight}
                    onChange={(e) => setSelectedWeight(e.target.value)}
                  >
                    {weightOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="progress-container">
                <span>Progress:</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <span>{calculateProgress().toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

