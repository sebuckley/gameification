export function getQuizStats(questions) {
  const total = questions.length;

  const mediaCounts = questions.reduce(
    (acc, q) => {
      if (q.contentType === "image") acc.images++;
      if (q.contentType === "audio") acc.audio++;
      if (q.contentType === "video") acc.video++;
      if (q.mediaReveal === true) acc.reveals++;
      return acc;
    },
    { images: 0, audio: 0, video: 0, reveals: 0 }
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

export function generateQuizInstructions(stats, revealSeconds = 10, points = false, correctAnswerPoints = 1, incorrectAnswerPoints = -1, noAnswerPoints = false, extra = "") {
  const lines = [];

  lines.push(`This quiz contains ${stats.total} questions.`);

  if (stats.images > 0 && stats.reveals > 0) {
    lines.push(` ${stats.images} questions include images that will be shown for ${revealSeconds} seconds before answering.`);
  }

  if (stats.images > 0 && stats.reveals === 0) {
    lines.push(` ${stats.images} questions include images that will be shown before answering.`);
  }

  if (stats.audio > 0) {
    lines.push(` ${stats.audio} questions include audio clips you must listen to before answering.`);
  }

  if (stats.video > 0) {
    lines.push(` ${stats.video} questions include short video clips.`);
  }

  if (stats.hasOptions) {
    lines.push(` ${stats.hasOptions} questions include multiple-choice options.`);
  }

  if (points) {
    lines.push(` This quiz uses a points system for scoring.`);
    lines.push(` Correct answers are worth ${correctAnswerPoints} point(s).`);
    lines.push(` Incorrect answers are worth ${incorrectAnswerPoints} point(s).`);
    if (noAnswerPoints !== false) {
      lines.push(` If no one answers everyone will lose ${incorrectAnswerPoints} point(s).`);
    }
  }
  
  if (extra) {
    lines.push(` ${extra}`);
  }


  return lines;
}
