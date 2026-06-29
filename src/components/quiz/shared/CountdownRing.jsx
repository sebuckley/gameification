import React from "react";

export default function CountdownRing({ time, total = 60 }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (time / total) * circumference;

  return (
    <svg width="100" height="100">
      {/* Background ring */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="#e5e7eb"
        strokeWidth="8"
        fill="none"
      />

      {/* Progress ring */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        stroke="#6366f1"
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={progress}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />

      {/* Time label */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontSize="20"
        className="font-bold fill-gray-700"
      >
        {time}s
      </text>
    </svg>
  );
}
