export default function PresenterController({
  index,
  total,
  currentQuestion,
  quizPeople,
  mode,
  cycle,
  quizElapsed,
  questionElapsed,
  nextQuestionPreview,
  finished,
  finalScores,
  showAnswer,
  revealAnswer,
  canProgress,
  onNext,
  allowNoOneAnswered = true,
  play,
  onClose,
  activeQuizType,
  embedded = false,
  hideFooter = false,
  hideQuestion = false,
  alwaysShowAnswer = false
}) {
  const {
    selectedPersonId, wrongPlayerIds, correctPlayerId, questionResolved,
    selectPlayer, submitResult, submitOption, handleNoOneAnswered,
  } = play;
  const options = Array.isArray(currentQuestion?.options)
    ? currentQuestion.options.filter(Boolean)
    : [];

  if (!currentQuestion) return null;

  const renderMedia = () => {
    if (!currentQuestion.mediaUrl) return null;

    if (currentQuestion.contentType === "image") {
      return (
        <img
          src={currentQuestion.mediaUrl}
          alt={currentQuestion.mediaAlt || currentQuestion.question || "Quiz media"}
          className="max-h-full max-w-full rounded-lg object-contain"
        />
      );
    }

    if (currentQuestion.contentType === "audio") {
      return <audio controls src={currentQuestion.mediaUrl} className="w-full" />;
    }

    if (currentQuestion.contentType === "video") {
      return <video controls src={currentQuestion.mediaUrl} className="max-h-full max-w-full rounded-lg" />;
    }

    return null;
  };

  const isStandardPoints = mode === "standard-points";
  const isAnswerReveal = mode === "standard" && cycle === 2;
  const questionText = currentQuestion.question || currentQuestion.questionText || currentQuestion.text;


  if (finished && mode !== "standard") {
    return (
      <main className={embedded ? "flex h-full w-full flex-col overflow-hidden bg-slate-100 p-3 text-slate-900" : "h-dvh overflow-hidden bg-slate-100 p-3 text-slate-900 sm:p-4"}>
        <div className={`mx-auto flex h-full w-full flex-col gap-3 ${embedded ? "" : "max-w-4xl"}`}>
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-300 pb-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Quiz Controller</div>
              <h1 className="mt-1 text-2xl font-bold">Final scores</h1>
            </div>
            {!embedded && <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >Close controller</button>}
          </header>
          <ol className="min-h-0 flex-1 divide-y divide-slate-200 overflow-y-auto rounded-lg bg-white px-5 shadow-sm">
            {finalScores.map((person, position) => (
              <li key={person.id} className="flex items-center justify-between gap-4 py-4">
                <span className="font-semibold">{position + 1}. {person.preferredName || person.fullName}</span>
                <span className="font-bold tabular-nums">{person.quizScore ?? 0} pts</span>
              </li>
            ))}
          </ol>
        </div>
      </main>
    );
  }else  if (finished && mode === "standard"){
    return (
      <main className={embedded ? "flex h-full w-full flex-col overflow-hidden bg-slate-100 p-3 text-slate-900" : "h-dvh overflow-hidden bg-slate-100 p-3 text-slate-900 sm:p-4"}>
      <div className={`mx-auto flex h-full w-full flex-col gap-3 ${embedded ? "" : "max-w-7xl"}`}>
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Quiz Controller</div>
            <div className="mt-1 text-xl font-bold">Question {index + 1} of {total}</div>
          </div>
          <div className="flex gap-4 text-right text-xs tabular-nums text-slate-600 sm:text-sm">
            <div><div className="text-xs uppercase tracking-wide text-slate-400">Quiz time</div>{quizElapsed}</div>
            <div><div className="text-xs uppercase tracking-wide text-slate-400">Question time</div>{questionElapsed}</div>
          </div>
          {!embedded && <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Close controller
          </button>}
        </header>
      </div>
    </main> 
    );
  }

  return (
    <main className={embedded ? "flex h-full w-full flex-col overflow-hidden bg-slate-100 p-2 text-slate-900" : "h-dvh overflow-hidden bg-slate-100 p-3 text-slate-900 sm:p-4"}>
      <div className={`mx-auto flex h-full min-h-0 w-full flex-col gap-3 ${embedded ? "" : "max-w-7xl"}`}>
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Quiz Controller</div>
            <div className="mt-1 text-xl font-bold">Question {index + 1} of {total}</div>
          </div>
          <div className="flex gap-4 text-right text-xs tabular-nums text-slate-600 sm:text-sm">
            <div><div className="text-xs uppercase tracking-wide text-slate-400">Quiz time</div>{quizElapsed}</div>
            <div><div className="text-xs uppercase tracking-wide text-slate-400">Question time</div>{questionElapsed}</div>
          </div>
          {!embedded && <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Close controller
          </button>}
        </header>

        <div className={`grid min-h-0 flex-1 ${hideQuestion ? "grid-cols-1" : "grid-cols-1 grid-rows-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:grid-rows-1"} gap-3 overflow-hidden`}>
          {!hideQuestion && <div className="flex min-h-0 flex-col gap-3 overflow-hidden">
            {currentQuestion.mediaUrl && currentQuestion.contentType !== "question" &&  activeQuizType !== "standard" && (
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-white p-2 shadow-sm">
                {renderMedia()}
              </div>
            )}

            <section className="max-h-[42%] shrink-0 overflow-y-auto rounded-lg bg-slate-900 p-4 text-white shadow-sm sm:p-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Current question</div>
              <h1 className="text-xl font-bold leading-tight sm:text-2xl">{questionText}</h1>
            </section>

            {(mode !== "standard" || isAnswerReveal || alwaysShowAnswer) && (
              <section className=" shrink-0 overflow-y-auto rounded-lg border border-emerald-200 bg-white p-3 text-center shadow-sm sm:p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Answer{alwaysShowAnswer && mode === "standard" && !showAnswer ? " (not yet shown on screen)" : ""}</div>
                {showAnswer || mode !== "standard" || alwaysShowAnswer ? (
                  <div className="mt-1 text-xl font-black text-emerald-800 sm:text-2xl">{currentQuestion.answer}</div>
                ) : (
                  <div className="mt-1 text-sm font-semibold text-slate-500">Reveal the answer to continue.</div>
                )}
                {isAnswerReveal && !showAnswer && (
                  <button
                    type="button"
                    onClick={revealAnswer}
                    className="mt-2 rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
                  >Reveal answer</button>
                )}
              </section>
            )}
          </div>}

          <div className="min-h-0 space-y-3 overflow-y-auto pr-1">
        {hideQuestion && mode === "standard" && isAnswerReveal && !showAnswer && (
          <section className="rounded-lg border border-indigo-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Reveal the answer shown in the Agenda Player.</p>
            <button
              type="button"
              onClick={revealAnswer}
              className="mt-3 rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
            >Reveal answer</button>
          </section>
        )}
        {hideQuestion && mode === "standard" && !isAnswerReveal && (
          <p className="rounded-lg bg-white p-4 text-sm text-slate-600 shadow-sm">
            Questions and answer choices are shown in the Agenda Player.
          </p>
        )}
        {mode !== "standard" && quizPeople.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Players</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 2xl:grid-cols-3">
              {quizPeople.map((person) => {
                const personName = person.preferredName || person.fullName || "Player";
                const selected = selectedPersonId === person.id;
                const answeredWrong = wrongPlayerIds.includes(person.id);

                if (questionResolved) {
                  return (
                    <div
                      key={person.id}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm ${answeredWrong ? "border-red-700 bg-red-100 text-red-900" : correctPlayerId === person.id ? "border-emerald-700 bg-emerald-100 text-emerald-900" : "border-slate-200 bg-white text-slate-900"}`}
                    >
                      <span>{personName}</span>
                      <span className={`tabular-nums ${answeredWrong ? "text-red-800" : correctPlayerId === person.id ? "text-emerald-800" : "text-slate-600"}`}>
                        {person.quizScore ?? 0} pts
                      </span>
                    </div>
                  );
                }

                if (isStandardPoints && options.length === 0) {
                  return (
                    <div key={person.id} className={`flex items-center justify-between gap-2 rounded-lg p-2 shadow-sm ${answeredWrong ? "bg-red-100 text-red-900 ring-1 ring-red-300" : "bg-white"}`}>
                      <div>
                        <div className="font-semibold">{personName}</div>
                        <div className="text-xs tabular-nums text-slate-500">{person.quizScore ?? 0} pts</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={answeredWrong}
                          onClick={() => submitResult(person.id, "correct")}
                          className={`rounded px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed ${answeredWrong ? "bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                        >Correct</button>
                        <button
                          type="button"
                          disabled={answeredWrong}
                          onClick={() => submitResult(person.id, "wrong")}
                          className={`rounded px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed ${answeredWrong ? "bg-red-700" : "bg-rose-600 hover:bg-rose-700"}`}
                        >Wrong</button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={person.id}
                    type="button"
                    disabled={wrongPlayerIds.includes(person.id)}
                    onClick={() => selectPlayer(person.id)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-semibold shadow-sm disabled:cursor-not-allowed ${wrongPlayerIds.includes(person.id) ? "border-red-700 bg-red-100 text-red-900" : selected ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  >
                    <span>{personName}</span>
                    <span className="text-sm tabular-nums text-slate-500">{person.quizScore ?? 0} pts</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {!questionResolved && options.length > 0 && mode !== "standard" && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Answer choices{!selectedPersonId ? " — select a player first" : ""}</h2>
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
              {options.map((option, optionIndex) => (
                <button
                  key={`${option}-${optionIndex}`}
                  type="button"
                  disabled={!selectedPersonId}
                  onClick={() => submitOption(option)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-left font-semibold shadow-sm enabled:hover:bg-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >{option}</button>
              ))}
            </div>
          </section>
        )}

        {mode === "standard" && cycle === 1 && options.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Answer choices</h2>
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
              {options.map((option, optionIndex) => (
                <div key={`${option}-${optionIndex}`} className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">{option}</div>
              ))}
            </div>
          </section>
        )}

        {!questionResolved && !isStandardPoints && options.length === 0 && quizPeople.length > 0 && mode !== "standard" && (
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!selectedPersonId}
              onClick={() => {
                submitResult(selectedPersonId, "correct");
              }}
              className="rounded bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300"
            >Correct</button>
            <button
              type="button"
              disabled={!selectedPersonId}
              onClick={() => {
                submitResult(selectedPersonId, "wrong");
              }}
              className="rounded bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-700 disabled:bg-slate-300"
            >Wrong</button>
          </div>
        )}

            {!questionResolved && mode !== "standard" && allowNoOneAnswered && (
            <button
            type="button"
            onClick={handleNoOneAnswered}
            className="rounded bg-red-800 px-4 py-2 font-semibold text-white hover:bg-red-700"
            >No One Answered</button>
        )}

        {nextQuestionPreview && (
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Next question</div>
            <div className="mt-1 text-sm font-semibold">{nextQuestionPreview}</div>
          </section>
        )}
          </div>
        </div>

        {!hideFooter && <div className="flex shrink-0 items-center justify-between gap-3 rounded-lg bg-slate-900 p-3 text-white shadow-sm">
          <div className="font-bold">Q{index + 1} / {total}</div>
          <div className="flex gap-2">
     
            <button
              type="button"
              onClick={onNext}
              disabled={!canProgress}
              className="rounded bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-600"
            >Next question</button>
          </div>
        </div>}
      </div>
    </main>
  );
}