import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import usePeopleStore from "../store/usePeopleStore";
import { iceBreakers } from "../../data/icebreakers";

export default function IceBreakerSetup({ setRunning }) {
  const {
    selectedIceBreaker,
    selectIceBreaker,
    iceBreakerSets,
    activeIceBreakerSetId,
    createIceBreakerSet,
    selectIceBreakerSet,
    renameIceBreakerSet,
    deleteIceBreakerSet,
  } = usePeopleStore();
  const [open, setOpen] = useState(false);
  const { collectFreeTextAnswers, setCollectFreeTextAnswers } = usePeopleStore();
  const [activeTypeFilter, setActiveTypeFilter] = useState("simple");
  const activeSet = (iceBreakerSets || []).find((setItem) => setItem.id === activeIceBreakerSetId) || null;

  useEffect(() => {
    if (selectedIceBreaker?.type) {
      setActiveTypeFilter(selectedIceBreaker.type);
    }
  }, [selectedIceBreaker?.type]);

  const handleSelectIceBreaker = (selectedPrompt) => {
    selectIceBreaker(selectedPrompt);

    if (!activeIceBreakerSetId) return;

    const nextName = (selectedPrompt?.title || selectedPrompt?.label || "").trim();
    if (!nextName) return;

    renameIceBreakerSet(activeIceBreakerSetId, nextName);
  };

  const grouped = {
    simple: iceBreakers.filter((i) => i.type === "simple"),
    random: iceBreakers.filter((i) => i.type === "random"),
    choice: iceBreakers.filter((i) => i.type === "choice"),
    reveal: iceBreakers.filter((i) => i.type === "reveal"),
    performance: iceBreakers.filter((i) => i.type === "performance")
  };

  const filterOptions = [
    { key: "simple", label: "Simple", title: "Simple Prompts", items: grouped.simple },
    { key: "random", label: "Random", title: "Random Prompts", items: grouped.random },
    { key: "choice", label: "Choice", title: "Choice-Based", items: grouped.choice },
    { key: "reveal", label: "Reveal", title: "Reveal-Based", items: grouped.reveal },
    { key: "performance", label: "Performance", title: "Performance", items: grouped.performance },
  ];

  const visibleFilterOptions = filterOptions.filter((option) => option.items.length > 0);
  const activeFilter =
    visibleFilterOptions.find((option) => option.key === activeTypeFilter) ||
    visibleFilterOptions[0] ||
    null;

  return (
    <div className="border rounded shadow bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none bg-white rounded-t"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="text-gray-500 mr-2">
          <Settings size={16} />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">Ice Breaker Setup</div>
        </div>
        <span className="text-gray-700 text-lg">{open ? "▼" : "◀"}</span>
      </div>

      {open && (
        <div className="p-5 space-y-6">
          <div className="text-sm text-gray-600">
            First manage your set, then filter by type, then pick one icebreaker prompt.
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="text-sm font-semibold text-slate-800">Step 1: Manage icebreaker set</div>
            <div className="text-xs text-slate-600">Create a set, then choose which set you want to edit.</div>

            <button
              type="button"
              onClick={() => createIceBreakerSet()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
            >
              Create New Set
            </button>

            <div className="text-sm font-semibold text-slate-700">Editing set</div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
              <select
                className="border rounded p-2 text-sm"
                value={activeIceBreakerSetId || ""}
                onChange={(e) => selectIceBreakerSet(e.target.value)}
              >
                {(iceBreakerSets || []).map((setItem) => (
                  <option key={setItem.id} value={setItem.id}>
                    {setItem.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                onClick={() => {
                  if (!activeIceBreakerSetId) return;
                  deleteIceBreakerSet(activeIceBreakerSetId);
                }}
              >
                Delete Current Set
              </button>
            </div>

          </div>

          {selectedIceBreaker && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-sm font-semibold text-blue-700">Current selected icebreaker</div>
              <div className="flex items-center gap-3">
                <div className="font-medium text-gray-800">{selectedIceBreaker.label}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                  {selectedIceBreaker.type === "random" ? "Random Prompts" : selectedIceBreaker.type === "performance" ? "Performance" : selectedIceBreaker.type === "choice" ? "Choice" : selectedIceBreaker.type === "reveal" ? "Reveal" : "Simple"}
                </div>
              </div>
              <div className="text-sm text-gray-600">{selectedIceBreaker.prompt}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-800">Step 2: Filter by type</div>
            <div className="flex flex-wrap gap-2">
              {visibleFilterOptions.map((option) => {
                const isActive = activeFilter?.key === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setActiveTypeFilter(option.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {option.label} ({option.items.length})
                  </button>
                );
              })}
            </div>

            <div className="text-sm font-semibold text-slate-800">Step 3: Select an icebreaker</div>
            <div className="text-xs text-slate-600">Click one card below to make it the selected icebreaker for this set.</div>

            {activeFilter && (
              <CategorySection
                title={activeFilter.title}
                items={activeFilter.items}
                selected={selectedIceBreaker}
                onSelect={handleSelectIceBreaker}
              />
            )}
          </div>

          <div className="pt-4 flex items-center gap-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={collectFreeTextAnswers}
                onChange={(e) => setCollectFreeTextAnswers(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-600">Collect answers for non-choice prompts</span>
            </label>
            {!selectedIceBreaker && <span className="text-sm text-gray-500">Choose a prompt set to begin.</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySection({ title, items, selected, onSelect }) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const isSelected = selected?.id === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`p-3 rounded-md border text-left ${isSelected ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-white hover:bg-gray-50"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-gray-800">{item.label}</div>
                {isSelected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                    Selected
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600">{item.prompt}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
