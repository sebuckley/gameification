import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import PdfSlideViewer from "../agenda/PdfSlideViewer";
import useStore from "../store/usePeopleStore";
import { loadFile } from "../store/db";
import GroupViewer from "../groups/GroupViewer";
import AgendaLinkedActivity from "./AgendaLinkedActivity";
import BreakActivity, { isBreakItem } from "./BreakActivity";
import { getPeopleSetRoster } from "../../utils/peopleSetMembers";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/build/pdf.worker";
pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.js";



export default function AgendaRunner({ agenda, currentIndex, setCurrentIndex, fullScreen, setFullScreen, activityControlsRef, onActivityNavigationChange }) {
  
  const item = agenda[currentIndex];
  // Windowed: fill the container width, capped by the viewport height.
  // Fullscreen: the largest 16:9 box that fits the space left under the header (container units).
  const stageStyle = {
    ...(fullScreen
      ? { width: "min(100cqw, 100cqh * 16 / 9)" }
      : { width: "100%", maxWidth: "min(1400px, calc((100vh - 340px) * 16 / 9))" }),
    aspectRatio: "16 / 9",
    containerType: "size",
  };
  // console.log(item);

  function getPresenterName(people, presenterId) {
    const person = people.find(p => p.id === presenterId);
    return person?.fullName || person?.preferredName || "No presenter";
  }

  const [speakerWindow, setSpeakerWindow] = useState(null);
  const getSpeakerWindow = useCallback(() => speakerWindow, [speakerWindow]);
  const [timeLeft, setTimeLeft] = useState(item.minutes * 60);
  const [slidePage, setSlidePage] = useState(item?.artefacts?.[0]?.page || 1);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [blobCache, setBlobCache] = useState({});
  const [pageCache, setPageCache] = useState({});
  const [navLock, setNavLock] = useState(false);
  const [navAction, setNavAction] = useState(null);
  const autoAdvance = useStore((state) => state.autoAdvance);
  const updateAgendaItem = useStore((state) => state.updateAgendaItem);
  const autoAdvanceSeconds = useStore((state) => state.autoAdvanceSeconds);
  const people = useStore((state) => state.people);
  const peopleSets = useStore((state) => state.peopleSets || []);
  const questionSets = useStore((state) => state.questionSets || []);
  const iceBreakerSets = useStore((state) => state.iceBreakerSets || []);
  const eventPeopleSetId = useStore((state) => state.agendaLinkedPeopleSetId);
  const linkedQuestionSet = questionSets.find((setItem) => setItem.id === item?.linkedQuestionSetId);
  const linkedIceBreakerSet = iceBreakerSets.find((setItem) => setItem.id === item?.linkedIceBreakerSetId);
  const linkedPeopleSetId = linkedQuestionSet?.peopleSetId || item?.linkedPeopleSetId || eventPeopleSetId;
  const linkedPeopleSet = peopleSets.find((setItem) => setItem.id === linkedPeopleSetId);
  const activityParticipants = useMemo(
    () => getPeopleSetRoster(people, linkedPeopleSet).filter((person) => person?.inSpinner !== false && person?.isPresenter !== true),
    [people, linkedPeopleSet]
  );
  const currentPresenter = getPresenterName(people, item?.presenterId);
  const nextPresenterName = getPresenterName(people, agenda[currentIndex + 1]?.presenterId);
  const [lastLoadedHash, setLastLoadedHash] = useState(null);
  const displayTitleSection = true;

  const timerRef = useRef(null);
  const lastNav = useRef(null);


useEffect(() => {
  if (!pdfBlobUrl) return;

  const artefact = agenda[currentIndex]?.artefacts?.[0];
  if (artefact?.type === "pdf-upload") {
    preloadPdfPages(pdfBlobUrl, artefact.from, artefact.to);
  }
}, [pdfBlobUrl]);

  function getSlideBounds(artefact) {

    if (artefact?.from && artefact?.to) {
      return {
        from: artefact.from,
        to: artefact.to
      };
    }

    // fallback for old single-page artefacts
    return {
      from: artefact?.page || 1,
      to: artefact?.page || 1
    };
  }

useEffect(() => {
  if (!navAction) return;

  if (navAction === "NEXT") lastNav.current = "NEXT";
  if (navAction === "PREV") lastNav.current = "PREV";

  const artefact = agenda[currentIndex]?.artefacts?.[0];
  const { from, to } = getSlideBounds(artefact);

  if (navAction === "NEXT") {
    if (slidePage < to) {
      setSlidePage(slidePage + 1);
    } else {
      setCurrentIndex(Math.min(currentIndex + 1, agenda.length - 1));
    }
  }

  if (navAction === "PREV") {
    if (slidePage > from) {
      setSlidePage(slidePage - 1);
    } else {
      setCurrentIndex(Math.max(currentIndex - 1, 0));
    }
  }

  setNavAction(null);
}, [navAction, slidePage, currentIndex, agenda]);

useEffect(() => {
  const artefact = agenda[currentIndex]?.artefacts?.[0];

  if (!artefact) {
    setSlidePage(1);
    return;
  }

  const { from, to } = getSlideBounds(artefact);

  // If we just moved forward into a new item → start at first slide
  if (lastNav.current === "NEXT") {
    setSlidePage(from);
    return;
  }

  // If we just moved backward into a new item → start at last slide
  if (lastNav.current === "PREV") {
    setSlidePage(to);
    return;
  }
}, [currentIndex, agenda]);



  const checkPDFLoaded = () => {
    return pdfBlobUrl && typeof pdfBlobUrl === "string";
  };

  // MAIN WINDOW: listen for messages from speaker window or AgendaPlayer
  useEffect(() => {
    const handler = (event) => {

      const { action, payload } = event.data || {};

  

      switch (action) {
        case "NEXT_SLIDE":
          console.log("NEXT_SLIDE message received");
          setNavAction("NEXT");
          break;
        case "PREV_SLIDE":
          console.log("PREV_SLIDE message received");
          setNavAction("PREV");
          break;
        case "SET_INDEX":
          setCurrentIndex(payload);
          break;
        case "RESET_TIMER":
          setTimeLeft(item.minutes * 60);
          break;
        case "OPEN_SPEAKER":
          openSpeakerMode();
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [agenda, item, setCurrentIndex]);

  // Reset timer when the agenda item changes (not when its minutes are edited mid-session)
  useEffect(() => {
    setTimeLeft(item.minutes * 60);
  }, [currentIndex, item.id]);

  // Change the length of the current item and keep the countdown in step with it
  const setItemMinutes = (minutes) => {
    const next = Math.max(1, Math.round(Number(minutes) || 0));
    const delta = next - item.minutes;
    if (!delta) return;
    setTimeLeft((t) => Math.max(0, t + delta * 60));
    updateAgendaItem(item.id, { minutes: next });
  };

  // Countdown timer
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => Math.max(t - 1, 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
   
  }, [item]);

  // Open speaker mode window
  const openSpeakerMode = () => {
    const win = window.open("", "speaker", "width=1100,height=800");
    setSpeakerWindow(win);
  };

  const getSlideImage = () => {
    const canvas = document.querySelector(".react-pdf__Page__canvas");
    if (!canvas) return null;
    return canvas.toDataURL("image/png");
  };

  const now = new Date();
  const timeNow = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // SPEAKER WINDOW: render content + wire controls
  useEffect(() => {
    if (!speakerWindow || isBreakItem(item) || linkedQuestionSet?.questions?.length || linkedIceBreakerSet?.selectedIceBreaker) return;

    const slideImage = getSlideImage();

    const nextItem = agenda[currentIndex + 1];


    speakerWindow.document.body.innerHTML = `
      <style>
        body {
          font-family: sans-serif;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-rows: auto auto 1fr;
          height: 100vh;
          overflow: hidden;
        }

        /* ROW 1 — Big Title + Current Presenter */
        .titlebar {
          width: 100%;
          padding: 12px 20px;
        
          background: #f7f7f7;
          border-bottom: 2px solid #ddd;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;

        }

        .titlebar .title {
          font-size: 40px;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .titlebar .presenter {
          font-size: 16px;
          font-weight: 600;
          white-space: nowrap;
          margin-right: 35px;
        }

        /* ROW 2 — Slide count + Timer + Buttons + Next Presenter + Reset */
        .controlbar {
          width: 100%;
          padding: 10px 20px;
          background: #ffffff;
          border-bottom: 2px solid #ddd;
          display: grid;
          grid-template-columns: auto auto auto auto auto;
          align-items: center;
          gap: 10px;
        }

        .slidecount {
          font-size: 15px;
          font-weight: bold;
          white-space: nowrap;
        }

        .timenow {
          font-size: 15px;
          font-weight: bold;
          white-space: nowrap;
        }

        .timer {
          font-size: 15px;
          font-weight: bold;
          white-space: nowrap;
        }

        .controls {
          display: flex;
          gap: 10px;
          width: "200px";
        }

        .controls button {
          padding: 8px 14px;
          font-size: 14px;
          border-radius: 6px;
          border: 1px solid #ccc;
          background: #f0f0f0;
          cursor: pointer;
          transition: background 0.2s;
        }

        .controls button:hover {
          background: #e4e4e4;
        }

        .next-presenter {
          font-size: 14px;
          white-space: nowrap;
        }

        /* RED RESET BUTTON — proper styling */
        #reset {
          padding: 8px 14px;
          font-size: 14px;
          border-radius: 6px;
          border: 1px solid #cc0000;
          background: #ffdddd;
          color: #990000;
          font-weight: bold;
          white-space: nowrap;
          margin-right: 35px;
        }

        #reset:hover {
          background: #ffcccc;
        }

        /* MAIN AREA */
        .main {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          height: 100%;
        }

        .slide-area {
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .slide-area img {
          max-width: 100%;
          max-height: 100%;
          border: 1px solid #ccc;
          border-radius: 6px;
        }

        .notes {
          padding: 20px;
          border-left: 2px solid #ddd;
          overflow-y: auto;
        }

        .notes h3 {
          margin-top: 0;
        }
      </style>

      <div class="titlebar">
        <span class="title">${item.label}</span>
        <span class="presenter">Presenter: ${currentPresenter}</span>
      </div>

      <div class="controlbar">
        <span class="slidecount">Slide ${currentIndex + 1} of ${agenda.length}</span>
        <span class="timenow">${timeNow}</span>
        <span class="timer">Time left: ${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}</span>

        <div class="controls">
          <button id="prev">Previous</button>
          <button id="next">Advance</button>
        </div>

        <span class="next-presenter">Next presenter: ${nextPresenterName}</span>

        <button id="reset">Reset Timer</button>
      </div>

      <div class="main">
        <div class="slide-area">
          ${slideImage ? `<img src="${slideImage}" />` : "<p>No slide available</p>"}
        </div>

        <div class="notes">
          <h3>Speaker Notes</h3>
          <p>${item.notes || "No notes for this section."}</p>
        </div>
      </div>
    `;

    // BUTTON EVENTS
    const prevBtn = speakerWindow.document.getElementById("prev");
    const nextBtn = speakerWindow.document.getElementById("next");
    const resetBtn = speakerWindow.document.getElementById("reset");

    // Route through the linked activity (quiz / icebreaker) first; only leave the item when it is done
    const go = (direction) => {
      const activity = activityControlsRef?.current;
      const leave = !activity || (direction === "next" ? activity.advance() : activity.previous());
      if (leave) window.postMessage({ action: direction === "next" ? "NEXT_SLIDE" : "PREV_SLIDE" }, "*");
    };

    if (prevBtn) prevBtn.onclick = () => go("prev");

    if (nextBtn) nextBtn.onclick = () => go("next");

    if (resetBtn) resetBtn.onclick = () => {
      const ok = speakerWindow.confirm("Reset the timer?");
      if (ok) window.postMessage({ action: "RESET_TIMER" }, "*");
    };

    // KEYBOARD SHORTCUTS
    speakerWindow.onkeydown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          go("prev");
          break;
        case "ArrowRight":
        case " ":
          go("next");
          break;
        case "r":
        case "R":
          const ok = speakerWindow.confirm("Reset the timer?");
          if (ok) window.postMessage({ action: "RESET_TIMER" }, "*");
          break;
      }
    };
  }, [speakerWindow, item, timeLeft, currentIndex, agenda, currentPresenter, nextPresenterName, linkedQuestionSet, linkedIceBreakerSet]);

  useEffect(() => {
   const artefact = agenda[currentIndex]?.artefacts?.[0];

    // No artefact at all → clear everything
    if (!artefact) {
      setPdfBlobUrl(null);
      setLastLoadedHash(null);
      return;
    }

    // If it's a PDF
    if (artefact.type === "pdf-upload" && artefact.hash) {

      // If cached → reuse instantly
      if (blobCache[artefact.hash]) {
        setPdfBlobUrl(blobCache[artefact.hash]);
        setLastLoadedHash(artefact.hash);
        return;
      }

      // If it's the same PDF → keep existing blob
      if (lastLoadedHash === artefact.hash && pdfBlobUrl) {
        return;
      }

      // Otherwise load new blob
      loadFile(artefact.hash).then(file => {
        if (file) {
          const url = URL.createObjectURL(file);
          setBlobCache(prev => ({ ...prev, [artefact.hash]: url }));
          setPdfBlobUrl(url);
          setLastLoadedHash(artefact.hash);
        }
      });

      return; // IMPORTANT: do not clear blob URL here
    }

    // If it's NOT a PDF → clear blob
    setPdfBlobUrl(null);
    setLastLoadedHash(null);

  }, [item, currentIndex]);   // <-- REQUIRED for backward navigation


  // Render artefact viewer
  const renderArtefact = () => {

    const artefact = agenda[currentIndex]?.artefacts?.[0];
    if (isBreakItem(item) && !item.linkedQuestionSetId && !item.linkedIceBreakerSetId) {
      return (
        <BreakActivity
          key={item.id}
          ref={activityControlsRef}
          item={item}
          timeLeft={timeLeft}
          onSetMinutes={setItemMinutes}
          speakerWindow={speakerWindow ? getSpeakerWindow : null}
          onSpeakerWindowClose={setSpeakerWindow}
          onNavigationChange={onActivityNavigationChange}
        />
      );
    }
    if (item.linkedQuestionSetId || item.linkedIceBreakerSetId) {
      return (
        <AgendaLinkedActivity
          key={`${item.id}-${linkedQuestionSet?.id || linkedIceBreakerSet?.id}`}
          ref={activityControlsRef}
          questionSet={linkedQuestionSet}
          iceBreakerSet={linkedIceBreakerSet}
          participants={activityParticipants}
          speakerWindow={speakerWindow ? getSpeakerWindow : null}
          onSpeakerWindowClose={setSpeakerWindow}
          onNavigationChange={onActivityNavigationChange}
        />
      );
    }
    const groupSet = agenda[currentIndex].enableGroupSetup;
    let groupID = null;

    if (groupSet) {
      groupID = agenda[currentIndex]?.groupHistoryEntryId || null;
    }

    if (groupSet) {

      return <GroupViewer index={groupID} displayTitleSection={displayTitleSection} fullScreen={fullScreen}/>;

    }

    if (!artefact) return null;
    const { from, to } = getSlideBounds(artefact);
    const safePage = Math.min(Math.max(slidePage, from), to);

    // Uploaded slides (PDF)
    if (artefact.type === "pdf-upload") {

      if (!pdfBlobUrl || typeof pdfBlobUrl !== "string") {
        return <div>Loading PDF…</div>;
      } 

      return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden bg-black">
          <PdfSlideViewer blobUrl={pdfBlobUrl} page={safePage} />
        </div>  
      );
    }

    // PDF from URL
    if (artefact.type === "pdf") {
      return (
        <iframe
          src={artefact.url}
          className="h-full w-full border-0 object-contain"
          title={artefact.name}
        />
      );
    }

 

    // Other documents
    return (
      <a
        href={artefact.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 underline"
      >
        Open Document
      </a>
    );
  };

  const renderStage = () => {
    const stage = (
      <div
        className={`mx-auto flex min-h-0 min-w-0 items-center justify-center overflow-hidden ${item.linkedQuestionSetId || item.linkedIceBreakerSetId || isBreakItem(item) ? "rounded-lg" : "bg-black"}`}
        style={stageStyle}
      >
        {renderArtefact()}
      </div>
    );

    if (!fullScreen) return stage;

    return (
      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center"
        style={{ containerType: "size" }}
      >
        {stage}
      </div>
    );
  };

  async function preloadPdfPages(url, from = 1, to = from) {

    // HARD GUARD — absolutely no PDF.js call allowed
    if (!url || typeof url !== "string") {
      console.warn("Preload aborted: invalid URL");
      return;
    }

    let pdf;
    try {
      pdf = await pdfjsLib.getDocument(url).promise;
    } catch (err) {
      console.warn("Preload aborted: invalid URL", err);
      return;
    }

    for (let pageNum = from; pageNum <= to; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;
    }
  }




  return (

    <div className={fullScreen ? "flex h-screen min-h-0 flex-col gap-2 bg-black p-2" : "contents"}>

      <div className={`bg-white rounded shadow ${fullScreen ? "shrink-0 p-3" : "p-4"}`}>

        { displayTitleSection && (

          <>
            <div className="flex items-center justify-between gap-4 mb-2">

            {/* LEFT — Title + Presenter + Time */}
            <div className="flex flex-col min-w-[160px]">
              <h2 className="text-2xl font-bold leading-tight">{item.label}</h2>

              <div className="text-gray-700">
                Presenter: {currentPresenter}
              </div>

              <div className="text-sm text-gray-500">
                {item.startTime} → {item.endTime}
                <span className="ml-4 font-semibold">
                  Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* CENTER — Description */}
            <div className="flex-1 text-center px-4">
              <p className="text-gray-600 text-lg">
                {item.description || ""}
              </p>
            </div>

            {/* RIGHT — Logo / Advert / Image (only if exists) */}
            <div className="w-14 h-14 flex items-center justify-center">

              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt="Agenda Item Visual"
                  className="object-contain w-full h-full"
                />
              ) : (
                // Placeholder for future adverts
                <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                  {/* Empty placeholder */}
                </div>
              )}

            </div>

            </div>
          </>

        )}


     
   
        {/* PDF VIEWER INSIDE THE PADDED CARD */}
        { !fullScreen && renderStage() }
      </div>

      { fullScreen && renderStage() }


    </div>

  );
}
