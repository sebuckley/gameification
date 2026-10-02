import { Document, Page, pdfjs } from "react-pdf";
import { useEffect, useRef, useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

export default function PdfSlideViewer({ blobUrl, page }) {
  const [numPages, setNumPages] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pageSize, setPageSize] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (!blobUrl || typeof blobUrl !== "string") return null;

  const scale = pageSize && containerSize.width > 0 && containerSize.height > 0
    ? Math.min(containerSize.width / pageSize.width, containerSize.height / pageSize.height)
    : 0;

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col items-center overflow-hidden bg-black">
      <div ref={containerRef} className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
        <Document
          key={blobUrl}
          file={blobUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {containerSize.width > 0 && containerSize.height > 0 && (
            <Page
              pageNumber={page}
              scale={scale || 1}
              onLoadSuccess={(loadedPage) => {
                const viewport = loadedPage.getViewport({ scale: 1 });
                setPageSize((previous) => previous?.width === viewport.width && previous?.height === viewport.height
                  ? previous
                  : { width: viewport.width, height: viewport.height });
              }}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>
      <div className="shrink-0 py-1 text-xs text-gray-300">
        Slide {page} of {numPages || "?"}
      </div>
    </div>
  );
}
