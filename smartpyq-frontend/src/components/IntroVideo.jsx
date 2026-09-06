import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useIntroVideo } from "../contexts/IntroVideoContext";

const IntroVideo = () => {
  const { isActive, videoRef, skipIntro, completeIntro, replayIntro } = useIntroVideo();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion && isActive) completeIntro();
  }, [prefersReducedMotion, isActive, completeIntro]);

  useEffect(() => {
    if (isActive) {
      setIsLoaded(false);
      setHasError(false);
      setProgress(0);
      setShowControls(true);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && videoRef.current && isLoaded) {
      videoRef.current.play().catch(() => {});
    }
  }, [isActive, isLoaded, videoRef]);

  const handleLoadedData = useCallback(() => setIsLoaded(true), []);
  const handleError = useCallback(() => setHasError(true), []);
  const handleEnded = useCallback(() => completeIntro(), [completeIntro]);
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setProgress((cur / dur) * 100);
    }
  }, [videoRef]);

  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    skipIntro();
  }, [videoRef, skipIntro]);

  const handleReplay = useCallback(() => replayIntro(), [replayIntro]);

  if (!isActive) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
        onLoadedData={handleLoadedData}
        onError={handleError}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src="/intro.mp4" type="video/mp4" />
      </video>

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
            <p className="text-white/60 text-sm">Loading intro...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/60 mb-4">Unable to load intro video</p>
            <button onClick={handleSkip} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
              Continue to Home
            </button>
          </div>
        </div>
      )}

      {isLoaded && !hasError && (
        <div className="absolute inset-0" onMouseMove={() => setShowControls(true)}>
          <motion.div
            className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -20 }}
            transition={{ duration: 0.2 }}
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}
          >
            <button onClick={handleReplay} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg backdrop-blur-sm transition-all" aria-label="Replay intro video">Replay</button>
            <button onClick={handleSkip} className="px-6 py-2 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-lg backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all" aria-label="Skip intro video">Skip</button>
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
            <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-100" style={{ width: progress + "%" }} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IntroVideo;
