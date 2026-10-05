import { useRef } from "react";
import usePeople from "../store/usePeopleStore";
import PeopleManager from "../people/PeopleManager";
import PeopleSetsManager from "../people/PeopleSetsManager";

export default function PeoplePage() {
  const people = usePeople((s) => s.people);
  const setPeople = usePeople((s) => s.setPeople); // Ensure this exists in your store
  const fileInputRef = useRef(null);

  const isEmpty = people.length === 0;

  /* ---------------------------------------------------------
     EXPORT CSV (with user-defined filename)
  --------------------------------------------------------- */
  const exportCSV = () => {
    if (!people.length) return;

    const defaultName = "people-export";
    const fileName = prompt("Name your export file:", defaultName);

    if (!fileName) return; // user cancelled

    const headers = ["id", "fullName", "preferredName", "color", "isPresenter"];
    const rows = people.map((p) => [
      p.id,
      p.fullName,
      p.preferredName,
      p.color,
      p.isPresenter
    ]);

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ---------------------------------------------------------
     IMPORT CSV
  --------------------------------------------------------- */
  const importCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

      const [headerLine, ...dataLines] = lines;
      const headers = headerLine.split(",").map((h) => h.replace(/"/g, ""));

      const parsed = dataLines.map((line) => {
        const cols = line.split(",").map((c) => c.replace(/"/g, ""));

        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = cols[i];
        });

        obj.isPresenter = obj.isPresenter === "true";

        return obj;
      });

      setPeople(parsed);
      alert("CSV imported successfully");
    };

    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-slate-600">Add the people you work with, then group them into sets for activities.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => fileInputRef.current.click()}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Import CSV
          </button>
          {!isEmpty && (
            <>
              <button
                onClick={exportCSV}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Export CSV
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Delete ALL people? This cannot be undone.")) {
                    setPeople([]);
                  }
                }}
                className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
              >
                Delete all
              </button>
            </>
          )}
        </div>

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={importCSV}
          className="hidden"
        />
      </header>

      <PeopleManager />

      <details className="group rounded-lg border border-slate-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 font-semibold text-slate-800">
          Manage people sets
          <span className="text-xs font-normal text-slate-500 group-open:hidden">Create and edit sets</span>
        </summary>
        <div className="border-t border-slate-200 p-4">
          <PeopleSetsManager />
        </div>
      </details>
    </div>
  );
}
