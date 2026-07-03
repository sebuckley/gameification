import { useState } from "react";
import usePeopleStore from "../store/usePeopleStore";
import { iceBreakers } from "../../data/icebreakers";

export default function IceBreakerSetup({ setRunning }) {
  const { selectedIceBreaker, selectIceBreaker } = usePeopleStore();
  const [open, setOpen] = useState(false);
  const { collectFreeTextAnswers, setCollectFreeTextAnswers } = usePeopleStore();

  const grouped = {
    simple: iceBreakers.filter((i) => i.type === "simple"),
    random: iceBreakers.filter((i) => i.type === "random"),
    choice: iceBreakers.filter((i) => i.type === "choice"),
    reveal: iceBreakers.filter((i) => i.type === "reveal"),
    performance: iceBreakers.filter((i) => i.type === "performance")
  };

  return (
    <div className="border rounded shadow bg-white">
      <div
        className="flex items-center justify-between px-4 py-3 border-b cursor-pointer select-none bg-white rounded-t"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="text-gray-500 mr-2">⋮⋮</div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">Ice Breaker Setup</div>
          {selectedIceBreaker && (
            <div className="mt-1 text-sm text-gray-500">
              {selectedIceBreaker.label} • {selectedIceBreaker.type === "random" ? "Random" : selectedIceBreaker.type === "performance" ? "Performance" : selectedIceBreaker.type === "choice" ? "Choice" : selectedIceBreaker.type === "reveal" ? "Reveal" : "Simple"}
            </div>
          )}
        </div>
        <span className="text-gray-700 text-lg">{open ? "▼" : "◀"}</span>
      </div>

      {open && (
        <div className="p-5 space-y-6">
          <div className="text-sm text-gray-600">
            Pick a prompt set, then launch it in fullscreen so one person answers at a time.
          </div>

          {selectedIceBreaker && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-sm font-semibold text-blue-700">Selected</div>
              <div className="flex items-center gap-3">
                <div className="font-medium text-gray-800">{selectedIceBreaker.label}</div>
                <div className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                  {selectedIceBreaker.type === "random" ? "Random Prompts" : selectedIceBreaker.type === "performance" ? "Performance" : selectedIceBreaker.type === "choice" ? "Choice" : selectedIceBreaker.type === "reveal" ? "Reveal" : "Simple"}
                </div>
              </div>
              <div className="text-sm text-gray-600">{selectedIceBreaker.prompt}</div>
            </div>
          )}

          <div className="space-y-6">
            <CategorySection title="Simple Prompts" items={grouped.simple} selected={selectedIceBreaker} onSelect={selectIceBreaker} />
            <CategorySection title="Random Prompts" items={grouped.random} selected={selectedIceBreaker} onSelect={selectIceBreaker} />
            <CategorySection title="Choice-Based" items={grouped.choice} selected={selectedIceBreaker} onSelect={selectIceBreaker} />
            <CategorySection title="Reveal-Based" items={grouped.reveal} selected={selectedIceBreaker} onSelect={selectIceBreaker} />
            <CategorySection title="Performance" items={grouped.performance} selected={selectedIceBreaker} onSelect={selectIceBreaker} />
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
              <div className="font-semibold text-gray-800">{item.label}</div>
              <div className="text-xs text-gray-600">{item.prompt}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
