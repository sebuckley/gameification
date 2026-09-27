export function getQuizStats(questions) {
  const total = questions.length;

  const mediaCounts = questions.reduce(
    (acc, q) => {
      if (q.contentType === "image") acc.images++;
      if (q.contentType === "audio") acc.audio++;
      if (q.contentType === "video") acc.video++;
      if (q.mediaReveal === true) acc.reveals++;

      // Difficulty counts
      const diff = (q.difficulty || "").toLowerCase();
      if (diff === "easy") acc.easy++;
      if (diff === "medium") acc.medium++;
      if (diff === "hard") acc.hard++;

      return acc;
    },
    {
      images: 0,
      audio: 0,
      video: 0,
      reveals: 0,
      easy: 0,
      medium: 0,
      hard: 0
    }
  );

  const hasOptions = questions.some(
    (q) => Array.isArray(q.options) && q.options.length > 0
  );

  return {
    total,
    ...mediaCounts,
    hasOptions
  };
}


export function generateQuizInstructions(
  stats,
  revealSeconds = 10,
  points = false,
  correctAnswerPoints = 1,
  incorrectAnswerPoints = -1,
  removePointsAll = false,
  quizType = "standard"
) {
  const lines = [];

  lines.push(`This quiz contains ${stats.total} questions.`);

  // Difficulty narrative
  if (stats.easy + stats.medium + stats.hard > 0) {
    const diffParts = [];

    if (stats.easy > 0) diffParts.push(`${stats.easy} easy`);
    if (stats.medium > 0) diffParts.push(`${stats.medium} medium`);
    if (stats.hard > 0) diffParts.push(`${stats.hard} hard`);

    const diffSentence = diffParts.join(", ").replace(/,([^,]*)$/, " and$1");

    lines.push(` The quiz includes ${diffSentence} difficulty questions.`);
  }

  // Media reveal logic
  if (stats.images > 0 && stats.reveals > 0 && quizType !== "standard") {
    lines.push(
      ` ${stats.images} questions include images that will be blurred and revealed over ${revealSeconds} seconds, you can answer at any time.`
    );
  }

  if (stats.images > 0 && stats.reveals === 0 && quizType !== "standard") {
    lines.push(` ${stats.images} questions include images that will be shown before answering.`);
  }

  if (stats.audio > 0 && quizType !== "standard") {
    lines.push(` ${stats.audio} questions include audio clips you must listen to before answering.`);
  }

  if (stats.video > 0 && quizType !== "standard") {
    lines.push(` ${stats.video} questions include short video clips.`);
  }

  if (stats.hasOptions) {
    lines.push(` Some questions include multiple-choice options.`);
  }

  // Points system
  if (points && quizType !== "standard") {
    lines.push(` This quiz uses a points system for scoring.`);
    lines.push(` Correct answers are worth ${correctAnswerPoints} point(s).`);
    lines.push(` Incorrect answers are worth ${incorrectAnswerPoints} point(s).`);

    if (removePointsAll !== false) {
      lines.push(` If no one answers everyone will lose ${incorrectAnswerPoints} point(s).`);
    }
  }

  // Standard mode
  if (quizType === "standard") {
    lines.push(
      ` This quiz is in standard mode. Players will write down their own answers and once all questions have been asked the answers will be revealed.`
    );
    lines.push(` Players will receive 1 point for a correct answer in this mode.`);
  }

  return lines;
}

