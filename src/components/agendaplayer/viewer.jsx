import React from "react";

export default function SlideViewer({
  url,
  title = "Slide Deck",
  height = "80vh",
  slide = 1 // NEW: slide number
}) {
  if (!url) {
    return (
      <div className="w-full text-center text-purple-600 font-semibold py-10">
        No slide deck available for this agenda item.
      </div>
    );
  }

  const encodedUrl = encodeURIComponent(url);

  // Add slide number parameter
  const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}&wdSlideId=${slide}`;

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      
      {/* Title */}
      <div className="text-xl font-bold text-purple-700">
        {title}
      </div>

      {/* PowerPoint Viewer */}
      <iframe
        src={viewerUrl}
        title={title}
        style={{ width: "100%", height }}
        className="rounded-xl border border-purple-200 shadow-md"
        frameBorder="0"
      />
    </div>
  );
}
