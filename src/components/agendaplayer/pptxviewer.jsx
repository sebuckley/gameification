import { useEffect, useState } from "react";
import PptxViewer from "pptx-react-viewer";

export default function PptxSlideViewer({ file }) {
  const [pptxData, setPptxData] = useState(null);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPptxData(e.target.result);
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  if (!pptxData) {
    return <div>Loading PowerPoint…</div>;
  }

  return (
    <div className="w-full border rounded p-4 bg-white shadow">
      <PptxViewer pptxData={pptxData} />
    </div>
  );
}
