import { useState, useEffect } from "react";

export default function SpinnerWheel({ people, onResult, autoRemove, setAutoRemove }) {
  const isInSpinner = (person) => person?.inSpinner !== false;

  // Track spinner membership only
  const spinnerKey = people
    .filter(isInSpinner)
    .map((p) => p.id)
    .sort()
    .join(",");

  // Initial spinner list
  const initialSpinnerPeople = people.filter(isInSpinner);

  const [activePeople, setActivePeople] = useState(initialSpinnerPeople);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [winnerIndex, setWinnerIndex] = useState(null);

  // ⭐ Only resync when spinner membership changes
  useEffect(() => {
    const newSpinnerPeople = people.filter(isInSpinner);
    setActivePeople(newSpinnerPeople);
    setWinnerIndex(null);
  }, [spinnerKey]);

  const sliceAngle =
    activePeople.length > 0 ? 360 / activePeople.length : 0;

  const lighten = (hex, amount = 0.75) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const lr = Math.min(255, r + (255 - r) * amount);
    const lg = Math.min(255, g + (255 - g) * amount);
    const lb = Math.min(255, b + (255 - b) * amount);

    return `#${Math.round(lr).toString(16).padStart(2, "0")}${Math.round(lg)
      .toString(16)
      .padStart(2, "0")}${Math.round(lb).toString(16).padStart(2, "0")}`;
  };

  const darken = (hex, amount = 0.35) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const dr = Math.max(0, r * (1 - amount));
    const dg = Math.max(0, g * (1 - amount));
    const db = Math.max(0, b * (1 - amount));

    return `#${Math.round(dr).toString(16).padStart(2, "0")}${Math.round(dg)
      .toString(16)
      .padStart(2, "0")}${Math.round(db).toString(16)
      .padStart(2, "0")}`;
  };

  const getInitials = (fullName) =>
    (fullName || "")
      .split(" ")
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 3);

  const gradient =
    activePeople.length > 0
      ? `conic-gradient(from 0deg, ${activePeople
          .map(
            (p, i) =>
              `${lighten(p.color, 0.75)} ${i * sliceAngle}deg ${(i + 1) * sliceAngle}deg`
          )
          .join(", ")})`
      : "#222";

  const spin = () => {
    if (activePeople.length === 0) return;

    const extraSpins = 6;
    const randomOffset = Math.random() * 360;

    const finalRotation = currentRotation - (extraSpins * 360 + randomOffset);
    setCurrentRotation(finalRotation);

    setTimeout(() => {
      const normalized = ((finalRotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalized + 90) % 360;
      const index =
        Math.floor(pointerAngle / sliceAngle) % activePeople.length;

      setWinnerIndex(index);

      const winner = activePeople[index];
      onResult(winner);

      if (autoRemove) {
        setActivePeople((prev) => {
          const updated = prev.filter((p) => p.id !== winner.id);

          if (updated.length === 0) {
            // ⭐ Reset to current spinner membership
            const resetList = people.filter(isInSpinner);
            setWinnerIndex(null);
            return resetList;
          }

          return updated;
        });
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-6">

      {/* Toggle */}
      <div className="flex flex-col items-center text-sm mb-2">
        <div className="flex items-center gap-3">
          <span className="font-medium">Remove winner from next spin:</span>

          <button
            type="button"
            onClick={() => setAutoRemove((v) => !v)}
            className={`flex items-center px-3 py-1 rounded-full border ${
              autoRemove
                ? "bg-indigo-600 hover:bg-indigo-700 border-indigo-600"
                : "bg-gray-600 border-gray-500"
            }`}
          >
            <span
              className={`text-xs font-bold ${
                autoRemove ? "text-white" : "text-gray-200"
              }`}
            >
              {autoRemove ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {autoRemove && (
          <div className="mt-1">
            Remaining before reset:{" "}
            <span className="font-bold">{activePeople.length}</span>
          </div>
        )}
      </div>

      <div className="relative w-80 h-80">
        <div
          className="
            absolute inset-0 
            rounded-full 
            border-4 border-indigo-600 
            shadow-xl 
            transition-transform 
            duration-[3000ms] 
            ease-out
          "
          style={{
            background: gradient,
            transform: `rotate(${currentRotation}deg)`
          }}
        >
          {activePeople.map((p, i) => {
            const centerAngle = -90 + i * sliceAngle + sliceAngle / 2;
            const radius = 3;

            return (
              <div
                key={p.id}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `
                    translate(-50%, -50%)
                    rotate(${centerAngle}deg)
                    translate(${radius * 100}%)
                    rotate(0deg)
                  `,
                  transformOrigin: "center"
                }}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    ${winnerIndex === i ? "scale-125 shadow-xl" : ""}
                  `}
                  style={{
                    backgroundColor: p.color,
                    color: "white",
                    border: `2px solid ${p.color}`
                  }}
                >
                  {getInitials(p.fullName || p.preferredName || p.name)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pointer */}
        <div
          className="absolute z-10"
          style={{
            top: "50%",
            right: "-10px",
            transform: "translateY(-50%) rotate(180deg)",
            width: 0,
            height: 0,
            borderTop: "14px solid transparent",
            borderBottom: "14px solid transparent",
            borderLeft: "22px solid red"
          }}
        ></div>
      </div>

      <button
        onClick={spin}
        className="px-6 py-2 rounded text-white text-lg font-medium shadow-md bg-indigo-600 hover:bg-indigo-700"
      >
        Spin
      </button>
    </div>
  );
}
