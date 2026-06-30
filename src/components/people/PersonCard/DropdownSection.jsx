export default function DropdownSection({ label, icon, open, setOpen, children }) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">

      {/* Header */}
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {label}
        </span>

        <span className="text-gray-700 text-xl">
          {open ? "▼" : "◀"}
        </span>
      </button>

      {/* Body — isolated height control */}
      <div
        className={`
          overflow-hidden transition-all duration-300
          ${open ? "max-h-[600px] mt-3" : "max-h-0"}
        `}
      >
        {/* This wrapper prevents sibling expansion */}
        <div className="pl-2">
          {children}
        </div>
      </div>
    </div>
  );
}