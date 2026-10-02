import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AgendaRunner from "../agendaplayer/angendarunner";
import usePeople from "../store/usePeopleStore";

export default function AgendaPlayer() {
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const activityControlsRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(20);
  const [showMenuBar, setShowMenuBar] = useState(true);
  const [activityNavigation, setActivityNavigation] = useState(null);

  const currentEventId = usePeople((s) => s.currentEventId);
  const events = usePeople((s) => s.events);
  const resetQuizScores = usePeople((s) => s.resetQuizScores);

  // Start every agenda player launch with a clean scoreboard.
  useEffect(() => {
    resetQuizScores();
  }, []);
  const activeEvent = events.find((event) => event.id === currentEventId);
  const agenda = activeEvent?.agendaItems || [];
  const currentItem = agenda[currentIndex];
  const hasLinkedActivity = Boolean(currentItem?.linkedQuestionSetId || currentItem?.linkedIceBreakerSetId);

  useEffect(() => {
    setActivityNavigation(null);
  }, [currentIndex]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);


  const exitPlayer = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    navigate("/agenda");
  }, [navigate]);

  const advanceAgendaPlayer = useCallback(() => {
    const activity = activityControlsRef.current;
    if (!activity || activity.advance()) {
      setActivityNavigation(null);
      window.postMessage({ action: "NEXT_SLIDE" }, "*");
    }
  }, []);

  const goBackAgendaPlayer = useCallback(() => {
    const activity = activityControlsRef.current;
    if (!activity || activity.previous()) {
      setActivityNavigation(null);
      window.postMessage({ action: "PREV_SLIDE" }, "*");
    }
  }, []);

  // Auto-hide menu bar in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const handler = (e) => {
      if (e.clientY < 80) setShowMenuBar(true);
      else setShowMenuBar(false);
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [isFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        advanceAgendaPlayer();
      }
      if (e.key === "ArrowLeft") {
        goBackAgendaPlayer();
      }
      if (e.key === "f") {
        toggleFullscreen();
        setIsFullscreen(prev => !prev);
      }
      if (e.key === "Escape") {
        exitPlayer();
        setIsFullscreen(prev => !prev);
      }
      if (e.key === "n") setShowNotes(s => !s);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advanceAgendaPlayer, goBackAgendaPlayer, toggleFullscreen, exitPlayer]);

  useEffect(() => {
  function handleFullscreenChange() {
    const isNowFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement;

    setIsFullscreen(!!isNowFullscreen);
  }

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  };
}, []);


  // Auto‑advance timer
  useEffect(() => {
    if (!autoAdvance || hasLinkedActivity) return;
    const timer = setTimeout(advanceAgendaPlayer, autoAdvanceSeconds * 1000);
    return () => clearTimeout(timer);
  }, [currentIndex, autoAdvance, autoAdvanceSeconds, hasLinkedActivity, advanceAgendaPlayer]);



  // Fixed bar style for fullscreen
  const fixedBarStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "rgba(0,0,0,0.7)",
    color: "white",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    zIndex: 9999,
    backdropFilter: "blur(6px)"
  };

  const buttonStyle = "px-3 py-2 bg-white text-black rounded min-w-[140px] text-center";


const Controls = (
  <>


    <button onClick={toggleFullscreen} className={`${buttonStyle} mr-4`}>
      {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
    </button>

    <button onClick={() => setShowNotes(s => !s)} className={`${buttonStyle} mr-4`}>
      {showNotes ? "Hide Notes" : "Show Notes"}
    </button>

    <button onClick={() => setAutoAdvance(s => !s)} className={`${buttonStyle} mr-4`}>
      {autoAdvance ? "Stop Auto" : "Auto‑Advance"}
    </button>

    <button
      onClick={() => window.postMessage({ action: "OPEN_SPEAKER" }, "*")}
      className={`px-3 py-2 bg-yellow-500 text-black rounded min-w-[140px] text-center mr-4`}
    >
      Open Speaker Mode
    </button>

    <button onClick={exitPlayer} className="px-3 py-2 bg-red-600 text-white rounded min-w-[140px] text-center">
      Exit Presentation
    </button>

    <button onClick={goBackAgendaPlayer} className={`${buttonStyle} mr-4`}>
      Previous
    </button>

    <button onClick={advanceAgendaPlayer} className={`${buttonStyle} mr-4`}>
      {activityNavigation?.nextLabel || "Next"}
    </button>
  </>
);


  return (
    <div ref={playerRef} className={isFullscreen ? "h-screen w-full bg-black" : "max-w-6xl mx-auto p-2 sm:p-4 space-y-3"}>

      {/* FULLSCREEN FIXED AUTO-HIDE BAR */}
      {isFullscreen && showMenuBar && (
        <div style={fixedBarStyle}>{Controls}</div>
      )}

      {/* NORMAL MODE INLINE BAR ABOVE SLIDE */}
      {!isFullscreen && (
        <div
          className="mb-4"
          style={{
            background: "rgba(0,0,0,0.7)",
            color: "white",
            margin: "5px 5px",
            display: "flex",
            alignItems: "flex-start",
            rowGap: "10px",
            flexFlow: "row wrap",
            padding: "10px 10px",
            borderRadius: "8px",
            backdropFilter: "blur(6px)"
          }}
        >
          {Controls}
        </div>
      )}

      {/* Runner */}
      <AgendaRunner
        agenda={agenda}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        fullScreen={isFullscreen}
        setFullScreen={setIsFullscreen}
        activityControlsRef={activityControlsRef}
        onActivityNavigationChange={setActivityNavigation}
      />

      {/* Speaker notes */}
      {!isFullscreen && showNotes && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded">
          <h2 className="font-bold mb-2">Speaker Notes</h2>
          <p className="text-sm">{currentItem?.notes || "No notes for this item."}</p>
        </div>
      )}
    </div>
  );
}
