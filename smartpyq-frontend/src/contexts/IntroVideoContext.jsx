import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const IntroVideoContext = createContext();

export const useIntroVideo = () => {
  const context = useContext(IntroVideoContext);
  if (!context) throw new Error("useIntroVideo must be used within IntroVideoProvider");
  return context;
};

export const IntroVideoProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const videoRef = useRef(null);
  const initRef = useRef(false);
  // Synchronous guard against rapid duplicate triggers (e.g. multiple Home clicks)
  const activeRef = useRef(false);

  const onCompleteRef = React.useRef(null);

  const triggerIntro = useCallback((onComplete) => {
    if (activeRef.current || isActive) return;
    activeRef.current = true;
    onCompleteRef.current = onComplete || null;
    setIsActive(true);
    setHasTriggered(true);
  }, [isActive]);

  // Check if intro should play on first load (guest user, not authenticated)
  const checkInitialIntro = useCallback((isAuthenticated) => {
    if (initRef.current) return;
    initRef.current = true;
    // Only trigger on first load if guest user
    if (!isAuthenticated) {
      setTimeout(() => {
        triggerIntro(null);
      }, 100);
    }
  }, [triggerIntro]);

  const skipIntro = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setIsActive(false);
    if (onCompleteRef.current) {
      const cb = onCompleteRef.current;
      onCompleteRef.current = null;
      setTimeout(() => cb(), 50);
    }
  }, []);

  const completeIntro = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setIsActive(false);
    if (onCompleteRef.current) {
      const cb = onCompleteRef.current;
      onCompleteRef.current = null;
      // Use setTimeout to ensure state updates before navigation
      setTimeout(() => cb(), 50);
    }
  }, []);

  const replayIntro = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const value = {
    isActive,
    hasTriggered,
    videoRef,
    triggerIntro,
    skipIntro,
    completeIntro,
    replayIntro,
    checkInitialIntro,
  };

  return (
    <IntroVideoContext.Provider value={value}>
      {children}
    </IntroVideoContext.Provider>
  );
};

export default IntroVideoContext;
