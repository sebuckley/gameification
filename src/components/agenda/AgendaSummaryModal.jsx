import usePeople from "../store/usePeopleStore";

export default function AgendaSummaryModal({ onClose }) {
  const exportMarkdown = usePeople((s) => s.exportAgendaMarkdown);
  const exportPowerPoint = usePeople((s) => s.exportAgendaPowerPointTable);

  const md = exportMarkdown();
  const ppt = exportPowerPoint();

  const copy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[600px] space-y-6 border">

        <h2 className="text-2xl font-bold text-center">Agenda Summary</h2>

        {/* Markdown Section */}
        <div className="space-y-2">
          <div className="font-semibold text-gray-700">Markdown Export</div>
          <textarea
            className="border rounded p-3 w-full h-40 text-sm bg-gray-50"
            readOnly
            value={md}
          />
          <button
            onClick={() => copy(md)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-full"
          >
            Copy Markdown
          </button>
        </div>

        {/* PowerPoint Table Section */}
        <div className="space-y-2">
          <div className="font-semibold text-gray-700">PowerPoint Table</div>
          <textarea
            className="border rounded p-3 w-full h-40 text-sm bg-gray-50"
            readOnly
            value={ppt}
          />
          <button
            onClick={() => copy(ppt)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
          >
            Copy PowerPoint Table
          </button>
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
