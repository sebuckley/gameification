import { useCallback, useEffect, useRef, useState } from "react";
import { QuizActivity, IceBreakerActivity } from "../agendaplayer/AgendaLinkedActivity";

// Runs a quiz or icebreaker with exactly the same player screen and speaker controller as the Agenda Player.
export default function StandaloneActivityRunner({
  kind,
  questionSet,
  iceBreakerSet,
  participants,
  initialSpeakerWindow = null,
  onClose,
}) {
  const activityRef = useRef(null);
  const [speakerWindow, setSpeakerWindow] = useState(initialSpeakerWindow);
  const [navigation, setNavigation] = useState({ nextLabel: "Next" });
  const getSpeakerWindow = useCallback(() => speakerWindow, [speakerWindow]);
  const [seconds, setSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [showMenu, setShowMenu] = useState(true);
  const title = kind === "quiz" ? questionSet?.name || "Quiz" : iceBreakerSet?.name || "Ice Breaker";

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // In fullscreen the menu drops down when the cursor reaches the top, like the Agenda Player.
  useEffect(() => {
    if (!isFullscreen) {
      setShowMenu(true);
      return undefined;
    }
    setShowMenu(false);
    const onMove = (event) => setShowMenu(event.clientY < 80);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.()?.catch?.(() => {});
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()?.catch?.(() => {});
    } catch {
      // Fullscreen is optional.
    }
    return () => {
      document.body.style.overflow = previousOverflow;
      if (document.fullscreenElement) document.exitFullscreen?.().catch?.(() => {});
    };
  }, []);

  const speakerWindowRef = useRef(speakerWindow);
  speakerWindowRef.current = speakerWindow;
  const closeAll = useCallback(() => {
    const win = speakerWindowRef.current;
    if (win && !win.closed) win.close();
    onClose();
  }, [onClose]);

  const handleLeave =  useCallback((direction) => {
    if (direction === "next") closeAll();
  }, [closeAll]);

  const openSpeakerMode = () => {
    const win = window.open("", "speaker", "popup=yes,width=1100,height=800");
    if (win) setSpeakerWindow(win);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        if (activityRef.current?.advance?.()) handleLeave("next");
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        if (activityRef.current?.previous?.()) handleLeave("prev");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleLeave]);

  const activityProps = {
    ref: activityRef,
    participants,
    speakerWindow: speakerWindow ? getSpeakerWindow : null,
    onSpeakerWindowClose: setSpeakerWindow,
    onNavigationChange: setNavigation,
    onLeave: handleLeave,
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-900">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">{kind === "quiz" ? "Quiz" : "Ice Breaker"}</div>
          <div className={`text-xl font-black ${kind === "quiz" ? "text-indigo-700" : "text-purple-700"}`}>{title}</div>
        </div>
        <div className="rounded-lg bg-slate-100 px-4 py-2 text-lg font-bold tabular-nums text-slate-700 shadow">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
        </div>
      </div>
      {showMenu && (
        <div
          className="flex flex-wrap items-center gap-3 bg-black/70 px-5 py-2 text-white backdrop-blur"
          style={isFullscreen ? { position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 } : undefined}
        >
          <button type="button" onClick={toggleFullscreen} className="min-w-[140px] rounded bg-white px-3 py-2 text-center text-black">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</button>
          <button type="button" onClick={openSpeakerMode} className="min-w-[140px] rounded bg-yellow-500 px-3 py-2 text-center text-black">{speakerWindow ? "Reopen Speaker Mode" : "Open Speaker Mode"}</button>
          <button type="button" onClick={() => activityRef.current?.previous?.() && handleLeave("prev")} className="min-w-[140px] rounded bg-white px-3 py-2 text-center text-black">Previous</button>
          <button type="button" onClick={() => activityRef.current?.advance?.() && handleLeave("next")} className="min-w-[140px] rounded bg-white px-3 py-2 text-center text-black">{navigation.nextLabel}</button>
          <button type="button" onClick={closeAll} className="ml-auto min-w-[140px] rounded bg-red-600 px-3 py-2 text-center text-white">Close {kind === "quiz" ? "Quiz" : "Ice Breaker"}</button>
        </div>
      )}
      <div className="min-h-0 flex-1 p-3" style={{ containerType: "size" }}>
        <div className="mx-auto" style={{ width: "min(100cqw, 100cqh * 16 / 9)", aspectRatio: "16 / 9", containerType: "size" }}>
          {kind === "quiz"
            ? <QuizActivity {...activityProps} questionSet={questionSet} />
            : <IceBreakerActivity {...activityProps} iceBreakerSet={iceBreakerSet} />}
        </div>
      </div>
    </div>
  );
}
