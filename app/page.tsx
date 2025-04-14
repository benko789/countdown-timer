// Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=89443">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=89443">Pixabay</a>
// Sound Effect by <a href="https://pixabay.com/users/whassupdonkey-46813463/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=287560">WhassupDonkey</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=287560">Pixabay</a>

'use client';

import { useState, useEffect, useRef } from 'react';

// Font options
const fontOptions = [
  { name: 'Mono', style: 'font-mono' },
  { name: 'Sans', style: 'font-sans' },
  { name: 'Serif', style: 'font-serif' },
  { name: 'RMono', style: 'font-roboto-mono' },
  { name: 'Source', style: 'font-source-code-pro' }, 
  // { name: 'Monofett', style: 'font-monofett' }
];

// Font weight options
const weightOptions = [
  { name: 'Light', value: 'font-light' },
  { name: 'Normal', value: 'font-normal' },
  { name: 'Medium', value: 'font-medium' },
  { name: 'Bold', value: 'font-bold' }
];

// Display mode options
const displayModes = [
  { name: 'Instant', value: 'instant' },
  { name: 'Scroll', value: 'scroll' },
  { name: 'Scroller', value: 'scroller' }
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
  const [displayMode, setDisplayMode] = useState(displayModes[0].value);
  const [playPauseSound, setPlayPauseSound] = useState(false);
  const [playEndSound, setPlayEndSound] = useState(false);
  const [showDev, setShowDev] = useState(false);
  const [originalSeconds, setOriginalSeconds] = useState(0);
  const [timerInTransition, setTimerInTransition] = useState(false);
  const [previousTime, setPreviousTime] = useState('00:00:00');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  // Scroller mode state variables
  const [scrollerValues, setScrollerValues] = useState([0, 0, -1, 0, 0, -1, 0, 0]); // HH:MM:SS with colons
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [activeDigit, setActiveDigit] = useState(-1);
  const scrollerRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null, null, null, null]);
  const mainRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const pauseColorPickerRef = useRef<HTMLInputElement>(null);
  const pauseSoundRef = useRef<HTMLAudioElement>(null);
  const endSoundRef = useRef<HTMLAudioElement>(null);

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
    
    // Reset background color when user starts typing
    if (mainRef.current && mainRef.current.style.backgroundColor !== '') {
      mainRef.current.style.backgroundColor = '';
      mainRef.current.style.color = '';
    }
    
    // Handle numeric keys
    if (/^\d$/.test(e.key)) {
      setHasStartedTyping(true);
      setInputBuffer(prev => {
        // For scroll mode, animate the digit change
        if (displayMode === 'scroll') {
          setPreviousTime(formatInputBuffer(prev));
          setTimerInTransition(true);
          setTimeout(() => setTimerInTransition(false), 300);
        }
        
        // Shift digits left and add new digit at the end, keeping only 6 digits
        return (prev + e.key).slice(-6);
      });
    } 
    // Handle backspace/delete
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      setHasStartedTyping(true);
      setInputBuffer(prev => {
        // For scroll mode, animate the digit change
        if (displayMode === 'scroll') {
          setPreviousTime(formatInputBuffer(prev));
          setTimerInTransition(true);
          setTimeout(() => setTimerInTransition(false), 300);
        }
        
        return prev.slice(0, -1);
      });
    }
  };

  const startTimer = () => {
    // Reset background color when starting/resuming timer
    if (mainRef.current) {
      mainRef.current.style.backgroundColor = '';
      mainRef.current.style.color = '';
    }
    
    // If already paused, resume from current time
    if (isPaused) {
      setIsRunning(true);
      setIsPaused(false);
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
      
      // Only animate if we've made new edits or are using scroll mode
      if (hasStartedTyping || displayMode === 'scroll') {
        setPreviousTime(formatInputBuffer(normalizedBuffer));
        setTimerInTransition(true);
        setTimeout(() => setTimerInTransition(false), 300);
        setHasStartedTyping(false);
      }
    }
    
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    
    // Play pause sound if enabled
    if (playPauseSound && pauseSoundRef.current) {
      pauseSoundRef.current.currentTime = 0;
      pauseSoundRef.current.play().catch(err => console.error('Error playing pause sound:', err));
    }
    
    // Apply pause color
    if (mainRef.current) {
      mainRef.current.style.backgroundColor = pauseColor;
      // Do not change text color to preserve contrast with the theme
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Reset background if timer was ended or paused
    if (mainRef.current) {
      mainRef.current.style.backgroundColor = '';
      mainRef.current.style.color = '';
    }
    
    // For scroll mode, animate the change to 00:00:00 only if time is not already 00:00:00
    if (displayMode === 'scroll' && time !== '00:00:00') {
      setPreviousTime(time);
      setTimerInTransition(true);
      setTimeout(() => {
        setTime('00:00:00');
        setTimerInTransition(false);
      }, 300);
    } else {
      setTime('00:00:00');
    }
    
    setRemainingSeconds(0);
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
      if (showEndColorPicker && colorPickerRef.current && !e.composedPath().includes(colorPickerRef.current)) {
        setShowEndColorPicker(false);
      }
      if (showPauseColorPicker && pauseColorPickerRef.current && !e.composedPath().includes(pauseColorPickerRef.current)) {
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
  }, [isRunning, isPaused, displayMode]); // Re-add when running, paused, or display mode changes

  useEffect(() => {
    setTime(formatInputBuffer(inputBuffer));
  }, [inputBuffer]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          // For scroll mode, set previous time for transition
          if (displayMode === 'scroll') {
            setPreviousTime(formatTime(prev));
            setTimerInTransition(true);
            setTimeout(() => setTimerInTransition(false), 300);
          }
          
          if (prev <= 1) {
            setIsRunning(false);
            
            // Play end sound if enabled
            if (playEndSound && endSoundRef.current) {
              endSoundRef.current.currentTime = 0;
              endSoundRef.current.play().catch(err => console.error('Error playing end sound:', err));
            }
            
            // Apply end color to background when timer finishes
            if (mainRef.current) {
              mainRef.current.style.backgroundColor = endColor;
              // Do not change text color to preserve contrast with the theme
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, remainingSeconds, endColor, isDarkMode, displayMode, playEndSound]);

  useEffect(() => {
    setTime(formatTime(remainingSeconds));
  }, [remainingSeconds]);

  // Render either normal digits or scrolling digits based on display mode
  const renderDigit = (index: number, currentTime: string, previousTime: string) => {
    const digit = currentTime[index];
    const prevDigit = previousTime[index];
    
    // For colons, just render them directly (no animation)
    if (digit === ':') {
      return <span key={index} className="digit-container colon">:</span>;
    }
    
    // For digits that aren't transitioning or in instant mode, just render them
    if (displayMode === 'instant' || !timerInTransition || digit === prevDigit) {
      return <span key={index} className="digit-container">{digit}</span>;
    }
    
    // For transitioning digits, animate them
    return (
      <span key={index} className="digit-container">
        <span className="digit-prev">{prevDigit}</span>
        <span className="digit-current">{digit}</span>
      </span>
    );
  };

  // Handle mouse/touch events for scroller
  const handleScrollerMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (isRunning || isPaused) return;
    setIsDragging(true);
    setActiveDigit(index);
    setDragStartY(e.clientY);
  };

  const handleScrollerTouchStart = (e: React.TouchEvent<HTMLDivElement>, index: number) => {
    if (isRunning || isPaused) return;
    setIsDragging(true);
    setActiveDigit(index);
    setDragStartY(e.touches[0].clientY);
  };

  const handleScrollerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || activeDigit === -1 || isRunning || isPaused) return;
    handleScrollerMove(e.clientY);
  };

  const handleScrollerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || activeDigit === -1 || isRunning || isPaused) return;
    handleScrollerMove(e.touches[0].clientY);
  };

  const handleScrollerMouseUp = () => {
    setIsDragging(false);
    setActiveDigit(-1);
  };

  const handleMouseWheel = (e: React.WheelEvent<HTMLDivElement>, index: number) => {
    if (isRunning || isPaused) return;
    
    // Prevent default scrolling behavior
    e.preventDefault();
    
    // Determine direction: positive deltaY means scroll down (increase value)
    const direction = e.deltaY > 0 ? 1 : -1;
    
    // Update the scroller value
    updateScrollerValue(index, direction);
  };

  const handleScrollerMove = (clientY: number) => {
    // Calculate movement based on drag distance
    const deltaY = dragStartY - clientY;
    // Use a threshold to avoid too sensitive movement
    const threshold = 8;
    
    if (Math.abs(deltaY) > threshold) {
      // Determine direction: positive deltaY means drag up (decrease value)
      const direction = deltaY > 0 ? 1 : -1;
      
      // Update value and reset drag start position
      updateScrollerValue(activeDigit, direction);
      setDragStartY(clientY);
    }
  };

  const updateScrollerValue = (index: number, direction: number) => {
    // Don't update if this is a colon position
    if (index === 2 || index === 5) return;
    
    setScrollerValues(prev => {
      const newValues = [...prev];
      // Adjust the digit by the direction (up = -1, down = +1)
      if (index === 0) {
        // First digit of hours (0-9)
        newValues[index] = (newValues[index] + direction + 10) % 10;
      } else if (index === 1) {
        // Second digit of hours (0-9)
        newValues[index] = (newValues[index] + direction + 10) % 10;
      } else if (index === 3) {
        // First digit of minutes (0-5)
        // newValues[index] = (newValues[index] + direction + 6) % 6;
        // First digit of hours (0-9)
        newValues[index] = (newValues[index] + direction + 10) % 10
      } else if (index === 4) {
        // Second digit of minutes (0-9)
        newValues[index] = (newValues[index] + direction + 10) % 10;
      } else if (index === 6) {
        // First digit of seconds (0-5)
        // newValues[index] = (newValues[index] + direction + 6) % 6;
        // First digit of hours (0-9)
        newValues[index] = (newValues[index] + direction + 10) % 10
      } else if (index === 7) {
        // Second digit of seconds (0-9)
        newValues[index] = (newValues[index] + direction + 10) % 10;
      }
      
      // Update inputBuffer to match scroller values
      const hours = `${newValues[0]}${newValues[1]}`;
      const minutes = `${newValues[3]}${newValues[4]}`;
      const seconds = `${newValues[6]}${newValues[7]}`;
      setInputBuffer(`${hours}${minutes}${seconds}`);
      
      return newValues;
    });
  };

  // Use inputBuffer to update scrollerValues when switching to scroller mode
  useEffect(() => {
    if (displayMode === 'scroller' && !isRunning && !isPaused) {
      const padded = inputBuffer.padStart(6, '0');
      setScrollerValues([
        parseInt(padded[0]),
        parseInt(padded[1]),
        -1, // colon
        parseInt(padded[2]),
        parseInt(padded[3]),
        -1, // colon
        parseInt(padded[4]),
        parseInt(padded[5])
      ]);
    }
  }, [displayMode, inputBuffer, isRunning, isPaused]);

  // Update scrollerValues when timer is running
  useEffect(() => {
    if (displayMode === 'scroller' && (isRunning || isPaused)) {
      const timeStr = time.replace(/:/g, '');
      setScrollerValues([
        parseInt(timeStr[0]),
        parseInt(timeStr[1]),
        -1, // colon
        parseInt(timeStr[2]),
        parseInt(timeStr[3]),
        -1, // colon
        parseInt(timeStr[4]),
        parseInt(timeStr[5])
      ]);
    }
  }, [displayMode, time, isRunning, isPaused]);

  // Add global mouse/touch event handlers
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setActiveDigit(-1);
      }
    };
    
    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setActiveDigit(-1);
      }
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  // Helper function to render a single scroller digit
  const renderScrollerDigit = (index: number) => {
    // Handle colon positions
    if (index === 2 || index === 5) {
      return (
        <div key={`colon-${index}`} className="scroller-colon">:</div>
      );
    }
    
    const currentValue = scrollerValues[index];
    const digit = currentValue === undefined ? 0 : currentValue;
    
    // Generate array of values to display in the scroller
    // For visual effect, show 5 values: 2 above, current, 2 below
    const values = [];
    for (let i = -2; i <= 2; i++) {
      let displayValue;
      if (index === 0) {
        // First digit of hours (0-9)
        displayValue = (digit + i + 100) % 10;
      } else if (index === 1) {
        // Second digit of hours (0-9)
        displayValue = (digit + i + 100) % 10;
      } else if (index === 3 || index === 6) {
        // First digit of minutes or seconds (0-5)
        // displayValue = (digit + i + 60) % 6;
        // First digit of minutes or seconds (0-9)
        displayValue = (digit + i + 100) % 10;
      } else {
        // Second digit of minutes or seconds (0-9)
        displayValue = (digit + i + 100) % 10;
      }
      values.push(displayValue);
    }
    
    return (
      <div
        key={`digit-${index}`}
        className={`scroller-digit ${isDragging && activeDigit === index ? 'dragging' : ''}`}
        ref={(el) => { scrollerRefs.current[index] = el; }}
        onMouseDown={(e) => handleScrollerMouseDown(e, index)}
        onTouchStart={(e) => handleScrollerTouchStart(e, index)}
        onMouseMove={handleScrollerMouseMove}
        onTouchMove={handleScrollerTouchMove}
        onWheel={(e) => handleMouseWheel(e, index)}
      >
        <div className="scroller-values">
          {values.map((val, i) => (
            <div 
              key={i} 
              className={`scroller-value ${i === 2 ? 'current' : ''}`}
            >
              {val}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main 
      ref={mainRef}
      className="countdown-container"
      tabIndex={0}
    >
      {/* Add audio elements */}
      <audio ref={pauseSoundRef} src="/pause.mp3" preload="auto" />
      <audio ref={endSoundRef} src="/end.mp3" preload="auto" />
      
      <div className={`countdown-timer ${selectedFont} ${selectedWeight}`}>
        {displayMode === 'scroll' ? (
          <div className="scroll-container">
            {isRunning || isPaused ? 
              time.split('').map((_, i) => renderDigit(i, time, previousTime)) :
              formatInputBuffer(inputBuffer).split('').map((_, i) => renderDigit(i, formatInputBuffer(inputBuffer), previousTime))
            }
          </div>
        ) : displayMode === 'scroller' ? (
          <div className="scroller-container">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(index => renderScrollerDigit(index))}
          </div>
        ) : (
          <div className="fixed-width-display">
            {isRunning || isPaused ? time : formatInputBuffer(inputBuffer)}
          </div>
        )}
      </div>
      
      <div className="control-group">
        {/* Fixed height container for hints to prevent layout shift */}
        <div className="input-hint-container">
          {!isRunning && !isPaused && (
            <div className="input-hint">
              {displayMode === 'scroller' 
                ? "Drag digits up/down or use mouse wheel to set time" 
                : "Type numbers to set time, backspace to delete"}
            </div>
          )}
        </div>
        
        <div className="countdown-controls">
          <button
            onClick={startTimer}
            className={`text-btn fixed-width ${isRunning && !isPaused ? 'active' : ''}`}
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
        
        {/* Dev section with 2x2 grid layout */}
        <div className="dev-section-container">
          <div className={`dev-section ${showDev ? 'visible' : ''}`}>
            <div className="dev-grid">
              {/* Top-left cell: Colors and sounds in a 2x2 grid */}
              <div className="dev-cell">
                {/* <div className="cell-title"></div> */}
                <div className="cell-title">Colors & Sounds</div>
                <div className="colors-sounds-grid">
                  {/* End color */}
                  <div className="color-picker-container">
                    <span>Finish</span>
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
                  
                  {/* Pause color */}
                  <div className="color-picker-container">
                    <span>Pause</span>
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
                  
                  {/* End sound */}
                  <div className="sound-option">
                    <span>Finish</span>
                    <button
                      onClick={() => setPlayEndSound(prev => !prev)}
                      className={`text-btn-dev ${playEndSound ? 'active' : ''}`}
                    >
                      {playEndSound ? 'on' : 'off'}
                    </button>
                  </div>
                  
                  {/* Pause sound */}
                  <div className="sound-option">
                    <span>Pause</span>
                    <button
                      onClick={() => setPlayPauseSound(prev => !prev)}
                      className={`text-btn-dev ${playPauseSound ? 'active' : ''}`}
                    >
                      {playPauseSound ? 'on' : 'off'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Top-right cell: Font and weight options */}
              <div className="dev-cell">
                {/* <div className="cell-title"></div> */}
                <div className="cell-title">Font and Weight</div>
                <div className="font-weight-grid">
                  {/* Font options */}
                  <div className="option-row">
                    {/* <span>Font</span> */}
                    <div className="option-buttons">
                      {fontOptions.map(option => (
                        <button
                          key={option.style}
                          onClick={() => setSelectedFont(option.style)}
                          className={`text-btn-dev ${selectedFont === option.style ? 'active' : ''}`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Weight options */}
                  <div className="option-row">
                    {/* <span>Weight</span> */}
                    <div className="option-buttons">
                      {weightOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => setSelectedWeight(option.value)}
                          className={`text-btn-dev ${selectedWeight === option.value ? 'active' : ''}`}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom-left cell: Display mode */}
              <div className="dev-cell">
                <div className="cell-title">Display Mode</div>
                <div className="option-row">
                  <div className="option-buttons">
                    {displayModes.map(mode => (
                      <button
                        key={mode.value}
                        onClick={() => setDisplayMode(mode.value)}
                        className={`text-btn-dev ${displayMode === mode.value ? 'active' : ''}`}
                      >
                        {mode.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Bottom-right cell: Progress bar */}
              <div className="dev-cell">
                <div className="cell-title">Progress - {calculateProgress().toFixed(0)}%</div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  {/* <span>%</span> */}
                  {/* <div className="progress-text"> */}
                    {/* <span>0%</span> */}
                    
                    {/* <span>100%</span> */}
                  {/* </div> */}
                  {/* <div className="progress-text">
                    <span>0%</span>
                    <span>{calculateProgress().toFixed(0)}%</span>
                    <span>100%</span>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

