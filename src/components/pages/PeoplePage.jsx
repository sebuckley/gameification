import { useRef } from "react";
import usePeople from "../store/usePeopleStore";
import PeopleManager from "../people/PeopleManager";

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
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">People Manager</h1>

  {isEmpty ? (
    <button
      onClick={() => fileInputRef.current.click()}
      className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 text-sm"
    >
      Import CSV
    </button>
  ) : (
    <div className="flex gap-3">
      <button
        onClick={exportCSV}
        className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 text-sm"
      >
        Export CSV
      </button>

      <button
        onClick={() => {
          if (window.confirm("Delete ALL people? This cannot be undone.")) {
            setPeople([]);
          }
        }}
        className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 text-sm"
      >
        Delete All
      </button>
    </div>
  )}

  <input
    type="file"
    accept=".csv"
    ref={fileInputRef}
    onChange={importCSV}
    className="hidden"
  />
</div>


      <PeopleManager />
    </div>
  );
}
