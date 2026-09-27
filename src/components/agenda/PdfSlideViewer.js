import { Document, Page } from "react-pdf";
import { useState, useRef, useEffect } from "react";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export default function PdfSlideViewer({ blobUrl, page }) {
  const [numPages, setNumPages] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);



  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (!blobUrl || typeof blobUrl !== "string") {
    return null; // or a loading spinner
  }





  return (
    <>
      <div
        ref={containerRef}
        className="w-full bg-black overflow-hidden"
        style={{ maxWidth: "100%" }}
      >
<Document
  key={blobUrl}
  file={blobUrl}
  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
>
  {containerWidth > 0 && (
    <Page
      pageNumber={page}
      width={containerWidth}
      height={containerWidth * 0.5625}
      renderTextLayer={false}
      renderAnnotationLayer={false}
    />
  )}
</Document>

      </div>

      <div className="mt-3 text-sm text-gray-600">
        Slide {page} of {numPages || "?"}
      </div>
    </>
  );
}
