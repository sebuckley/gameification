import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AgendaRunner from "../agendaplayer/angendarunner";
import usePeople from "../store/usePeopleStore";

export default function AgendaPlayer() {
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(20);
  const [showMenuBar, setShowMenuBar] = useState(true);

  const people = usePeople((s) => s.people);
  const currentEventId = usePeople((s) => s.currentEventId);
  const events = usePeople((s) => s.events);

  const activeEvent = events.find((event) => event.id === currentEventId);
  const agenda = activeEvent?.agendaItems || [];

  const hasPeople = people.some((p) => p?.inGroups !== false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };


  const exitPlayer = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    navigate("/agenda");
  };

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
        window.postMessage({ action: "NEXT_SLIDE" }, "*");
      }
      if (e.key === "ArrowLeft") {
        window.postMessage({ action: "PREV_SLIDE" }, "*");
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
  }, []);

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
    if (!autoAdvance) return;
    const timer = setTimeout(() => window.postMessage({ action: "NEXT_SLIDE" }, "*"), autoAdvanceSeconds * 1000);
    return () => clearTimeout(timer);
  }, [currentIndex, autoAdvance, autoAdvanceSeconds]);



  if (!hasPeople) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Groups</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="text-sm">No people loaded for this event yet.</p>
          <Link
            to="/people"
            className="inline-block mt-3 px-3 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Go to People
          </Link>
        </div>
      </div>
    );
  }

  const currentItem = agenda[currentIndex];

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

    <button onClick={() => window.postMessage({ action: "PREV_SLIDE" }, "*")} className={`${buttonStyle} mr-4`}>
      Previous
    </button>

    <button onClick={() => window.postMessage({ action: "NEXT_SLIDE" }, "*")} className={`${buttonStyle} mr-4`}>
      Next
    </button>
  </>
);


  return (
    <div ref={playerRef} className="max-w-4xl mx-auto p-4 space-y-6">

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
