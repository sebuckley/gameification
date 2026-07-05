import { X } from "lucide-react";

export default function BubbleList({ items = [], onRemove }) {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {items.map((item, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-3 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm font-semibold"
        >
          {item}
          <button
            onClick={() => onRemove(idx)}
            className="text-white hover:text-gray-200"
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  );
}
