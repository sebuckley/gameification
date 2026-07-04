import React from "react";

export default function ToggleButton({
  value,
  onChange,
  onLabel = "ON",
  offLabel = "OFF",
  onBg = "bg-indigo-600",
  onHoverBg = "hover:bg-indigo-700",
  onBorder = "border-indigo-600",
  offBg = "bg-gray-600",
  offBorder = "border-gray-500",
  onText = "text-white",
  offText = "text-gray-200",
  className = ""
}) {
  const isOn = Boolean(value);

  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center px-6 py-1 rounded-full border transition-colors
        ${isOn ? `${onBg} ${onHoverBg} ${onBorder}` : `${offBg} ${offBorder}`}
        ${className}
      `}
    >
      <span
        className={`text-xs font-bold ${isOn ? onText : offText}`}
      >
        {isOn ? onLabel : offLabel}
      </span>
    </button>
  );
}
