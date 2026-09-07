import { useEffect, useState } from "react";
import { GripVertical } from "lucide-react";


export function QuestionItem({
  q,
  index,
  provided,
  snapshot,
  moveQuestion,
  updateSingleQuestion,
  removeQuestion
}) {
  const [open, setOpen] = useState(false);
  const [mediaPreviewError, setMediaPreviewError] = useState(false);
  const [mediaPreviewLoaded, setMediaPreviewLoaded] = useState(false);
  const imageSearchQuery = encodeURIComponent(
    q.mediaAlt || q.question || "football team logo"
  );
  const isMediaItem = q.contentType && q.contentType !== "question";

  useEffect(() => {
    setMediaPreviewError(false);
    setMediaPreviewLoaded(false);
  }, [q.mediaUrl, q.contentType]);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`
        border rounded bg-white shadow-sm transition-all
        ${snapshot.isDragging ? "scale-[1.03] shadow-lg" : ""}
      `}
    >
{/* HEADER */}
<div
  {...provided.dragHandleProps}
  className="flex flex-wrap md:flex-nowrap items-center justify-between p-3 bg-indigo-600 border-b rounded-t gap-3"
>
  {/* Left side */}
  <div className="flex items-center gap-3 min-w-0">
    {/* Move icon */}
    <div
      {...provided.dragHandleProps}
      className="text-indigo-200 hover:text-white cursor-grab select-none pr-1 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      ⋮⋮
    </div>

    {/* Number */}
    <span className="font-semibold text-white">{index + 1}.</span>

    {/* Responsive truncation */}
    <span className="text-white font-medium truncate max-w-[150px] sm:max-w-[250px] md:max-w-[300px]">
      {q.question || "Untitled Question"}
    </span>

    {isMediaItem && (
      <span
        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
          !q.mediaUrl
            ? "bg-red-200 text-red-800"
            : mediaPreviewError
              ? "bg-red-200 text-red-800"
              : mediaPreviewLoaded
                ? "bg-emerald-200 text-emerald-800"
                : "bg-amber-200 text-amber-800"
        }`}
      >
        {!q.mediaUrl
          ? "Edit: media missing"
          : mediaPreviewError
            ? "Edit: media failed"
            : mediaPreviewLoaded
              ? "Media linked"
              : "Edit to check media"}
      </span>
    )}
  </div>

  {/* Right side buttons */}
  <div className="flex items-center gap-2 flex-wrap">
    <button
      onClick={() => setOpen(!open)}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      {open ? "Close Edit" : "Edit"}
    </button>

    <button
      onClick={() => moveQuestion(index, -1)}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      ↑
    </button>

    <button
      onClick={() => moveQuestion(index, 1)}
      className="flex-1 md:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
    >
      ↓
    </button>
  </div>
</div>




      {open && (
        <div className="p-4 space-y-4">
          {/* Question */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Question</label>
            <input
              className="border p-2 rounded w-full"
              value={q.question}
              onChange={(e) =>
                updateSingleQuestion(q.id, "question", e.target.value)
              }
            />
          </div>

          {/* Answer */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Answer</label>
            <input
              className="border p-2 rounded w-full"
              value={q.answer}
              onChange={(e) =>
                updateSingleQuestion(q.id, "answer", e.target.value)
              }
            />
          </div>

          <div className="space-y-2 rounded border border-indigo-200 bg-indigo-50 p-3">
            <label className="text-sm font-medium text-indigo-900">Content type</label>
            <select
              className="border p-2 rounded w-full bg-white"
              value={q.contentType || "question"}
              onChange={(e) =>
                updateSingleQuestion(q.id, "contentType", e.target.value)
              }
            >
              <option value="question">Question only</option>
              <option value="image">Image</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>

          {q.contentType && q.contentType !== "question" && (
            <>
              <input
                className="border p-2 rounded w-full bg-white"
                placeholder="Media URL"
                value={q.mediaUrl?.startsWith("data:") ? "Local file selected" : q.mediaUrl || ""}
                onChange={(e) =>
                  updateSingleQuestion(q.id, "mediaUrl", e.target.value)
                }
              />

              <input
                type="file"
                accept={`${q.contentType}/*`}
                className="block w-full text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () =>
                    updateSingleQuestion(q.id, "mediaUrl", String(reader.result || ""));
                  reader.readAsDataURL(file);
                }}
              />

              <input
                className="border p-2 rounded w-full bg-white"
                placeholder="Image alt text (optional)"
                value={q.mediaAlt || ""}
                onChange={(e) =>
                  updateSingleQuestion(q.id, "mediaAlt", e.target.value)
                }
              />

              {q.mediaUrl && (
                <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Media preview
                  </div>

                  {q.contentType === "image" && (
                    <img
                      src={q.mediaUrl}
                      alt={q.mediaAlt || q.question || "Media preview"}
                      onLoad={() => {
                        setMediaPreviewError(false);
                        setMediaPreviewLoaded(true);
                      }}
                      onError={() => setMediaPreviewError(true)}
                      className="max-h-64 max-w-full rounded object-contain"
                    />
                  )}

                  {q.contentType === "audio" && (
                    <audio
                      controls
                      src={q.mediaUrl}
                      onCanPlay={() => {
                        setMediaPreviewError(false);
                        setMediaPreviewLoaded(true);
                      }}
                      onError={() => setMediaPreviewError(true)}
                      className="w-full"
                    />
                  )}

                  {q.contentType === "video" && (
                    <video
                      controls
                      src={q.mediaUrl}
                      onCanPlay={() => {
                        setMediaPreviewError(false);
                        setMediaPreviewLoaded(true);
                      }}
                      onError={() => setMediaPreviewError(true)}
                      className="max-h-64 max-w-full rounded"
                    />
                  )}

                  <div
                    role="alert"
                    className={`rounded px-3 py-2 text-sm ${
                      mediaPreviewError
                        ? "border border-red-200 bg-red-50 text-red-700"
                        : mediaPreviewLoaded
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {mediaPreviewError
                      ? "This media could not be loaded. Check the URL or choose a local file."
                      : mediaPreviewLoaded
                        ? "Media preview loaded."
                        : "Checking media URL..."
                    }
                  </div>

                  {mediaPreviewError && q.contentType === "image" && (
                    <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <a
                        href={`https://www.google.com/search?tbm=isch&q=${imageSearchQuery}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-indigo-700 underline"
                      >
                        Search Google Images for a replacement
                      </a>
                      <p className="mt-1">
                        Open an image, right-click the actual image, choose
                        <strong> Copy image address</strong>, then paste that
                        direct URL into Media URL. Do not copy the Google search
                        page address.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          </div>

          {/* Multi-choice */}
          {q.type === "multi" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Options</label>

              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="border p-2 rounded w-full"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...q.options];
                      updated[optIndex] = e.target.value;
                      updateSingleQuestion(q.id, "options", updated);
                    }}
                  />

                  <button
                    onClick={() => {
                      const updated = q.options.filter((_, i) => i !== optIndex);
                      updateSingleQuestion(q.id, "options", updated);

                      if (updated.length === 0) {
                        updateSingleQuestion(q.id, "type", "single");
                      }
                    }}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 sm:w-auto w-full"
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button
                onClick={() => {
                  const updated = [...q.options, ""];
                  updateSingleQuestion(q.id, "options", updated);
                  updateSingleQuestion(q.id, "type", "multi");
                }}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm w-full sm:w-auto"
              >
                Add Option
              </button>
            </div>
          )}

          <button
            onClick={() => removeQuestion(q.id)}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
          >
            Remove Question
          </button>
        </div>
      )}
    </div>
  );
}
