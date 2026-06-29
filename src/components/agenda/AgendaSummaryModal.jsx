import { useState } from "react";
import usePeople from "../store/usePeopleStore";

export default function AgendaSummaryModal({ onClose }) {
  const exportCSV = usePeople((s) => s.exportAgendaCSV);
  const exportHtml = usePeople((s) => s.exportAgendaHtmlTable);

  const csv = exportCSV();
  const html = exportHtml();

  const [copied, setCopied] = useState(null);

  const copy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyHtml = (html) => {
  navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([html], { type: "text/plain" })
    })
  ]);
};

  const download = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xl space-y-6 border overflow-y-auto max-h-[90vh]">

        <h2 className="text-2xl font-bold text-center">Agenda Export</h2>

        {/* CSV */}
        <div className="space-y-2">
          <div className="font-semibold text-gray-700">CSV Export</div>
          <textarea
            className="border rounded p-3 w-full h-32 text-xs bg-gray-50"
            readOnly
            value={csv}
          />
          <div className="flex gap-2">
            <button
              onClick={() => copy(csv, "csv")}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
            >
              {copied === "csv" ? "Copied!" : "Copy CSV"}
            </button>
            <button
              onClick={() =>
                download(csv, "agenda.csv", "text/csv;charset=utf-8")
              }
              className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200 w-full"
            >
              Download CSV
            </button>
          </div>
        </div>

        {/* HTML Table */}
        <div className="space-y-2">
          <div className="font-semibold text-gray-700">PowerPoint Table (HTML)</div>
          <textarea
            className="border rounded p-3 w-full h-32 text-xs bg-gray-50"
            readOnly
            value={html}
          />
          <div className="flex gap-2">
           <button
  onClick={() => {
    copyHtml(html);
    setCopied("html");
    setTimeout(() => setCopied(null), 1500);
  }}
  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
>
  {copied === "html" ? "Copied!" : "Copy PowerPoint Table"}
</button>
            <button
              onClick={() =>
                download(html, "agenda-table.html", "text/html;charset=utf-8")
              }
              className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200 w-full"
            >
              Download HTML
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}
