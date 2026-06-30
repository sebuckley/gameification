import {

  Trash2,

} from "lucide-react";


export default function ListField({ items, onRemove }) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="ml-4 list-disc text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between items-center">
            {item}
            <button
              className="text-red-600 text-xs flex items-center gap-1"
              onClick={() => onRemove(i)}
            >
              <Trash2 size={12} /> remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

}