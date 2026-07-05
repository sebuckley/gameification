import { useState } from "react";
import usePeople from "../store/usePeopleStore";
import ColourPicker from "./PersonCard/ColorPicker";
import InputField from "./PersonCard/InputField";
import SelectField from "./PersonCard/SelectField";
import NotesSection from "./PersonCard/Notes";
import AccessibilityRequirementsSection from "./PersonCard/Accessibility";
import DietaryRequirementsSection from "./PersonCard/Dietry";
import { PERSON_TYPE_OPTIONS } from "../../data/PersonOptions";

import {
  User,
  Tag,
  Mail,
  CheckCircle
} from "lucide-react";


export default function PersonCard({ person, index, dragHandleProps }) {
  const { updatePerson, people, removePerson } = usePeople();
  const [open, setOpen] = useState(false);
  const [dietOpen, setDietOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [olderNotesOpen, setOlderNotesOpen] = useState(false);

  /* ---------------------------------------------------------
     SAFETY: Prevent crash if person is undefined
  --------------------------------------------------------- */
  if (!person) {
    return (
      <div className="p-4 bg-red-50 border border-red-300 rounded text-red-700">
        Person data missing
      </div>
    );
  }

  /* ---------------------------------------------------------
     NORMALISE PERSON OBJECT
  --------------------------------------------------------- */
  const safePerson = {
    id: person.id,
    fullName: "",
    preferredName: "",
    email: "",
    personType: "",
    dietaryRequirements: [],
    accessibilityRequirements: [],
    notesHistory: [],
    color: "#6CA8D1",
    history: [],
    isPresenter: false,
    inSpinner: true,
    inGroups: true,
    ...person
  };



  /* ---------------------------------------------------------
     COMPLETION LOGIC
  --------------------------------------------------------- */
  const fields = [
    safePerson.fullName,
    safePerson.preferredName,
    safePerson.email,
    safePerson.personType,
    safePerson.dietaryRequirements?.length,
    safePerson.accessibilityRequirements?.length,
    safePerson.notesHistory?.length
  ];

  const completion = Math.round(
    (fields.filter(Boolean).length / fields.length) * 100
  );

  const isComplete = completion === 100;

  /* ---------------------------------------------------------
     EMAIL VALIDATION
  --------------------------------------------------------- */
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ---------------------------------------------------------
     UNIQUE COLOUR LOGIC
--------------------------------------------------------- */
  const ensureUniqueColor = (hex) => {
    const lower = hex.toLowerCase();
    const used = people.map((p) => p.color?.toLowerCase()).filter(Boolean);

    if (!used.includes(lower)) return hex;

    let shifted = hex;
    let attempts = 0;

    while (used.includes(shifted.toLowerCase()) && attempts < 20) {
      shifted = shiftHue(shifted);
      attempts++;
    }

    return shifted;
  };

  const chicColors = [
    "#D16C7A", "#6CA8D1", "#E3C26F", "#D18F6C",
    "#9B7ED1", "#6CD1A8", "#D16C6C", "#6CD1D1"
  ];

  const lighten = (hex, amount = 0.55) => {
    if (!hex) return "#f3f4f6";
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const lr = Math.min(255, Math.floor(r + (255 - r) * amount));
    const lg = Math.min(255, Math.floor(g + (255 - g) * amount));
    const lb = Math.min(255, Math.floor(b + (255 - b) * amount));

    return (
      "#" +
      lr.toString(16).padStart(2, "0") +
      lg.toString(16).padStart(2, "0") +
      lb.toString(16).padStart(2, "0")
    );
  };

  const shiftHue = (hex) => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const newR = (r + 140) % 255;
    const newG = (g + 140) % 255;
    const newB = (b + 140) % 255;

    return (
      "#" +
      newR.toString(16).padStart(2, "0") +
      newG.toString(16).padStart(2, "0") +
      newB.toString(16).padStart(2, "0")
    );
  };

  const usedColors = people
    .filter((p) => p.id !== safePerson.id)
    .map((p) => p.color?.toLowerCase())
    .filter(Boolean);

  const availableColors = chicColors.filter((c) => {
    const lower = c.toLowerCase();
    const personColorLower = safePerson.color?.toLowerCase();
    return !usedColors.includes(lower) && lower !== personColorLower;
  });

  const fallbackColor =
    availableColors.length > 0
      ? availableColors[0]
      : shiftHue(safePerson.color || "#6CA8D1");

  const handleColorChange = (newColor) => {
    const unique = ensureUniqueColor(newColor);
    updatePerson(safePerson.id, { color: unique });
  };

  const initials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .join("");

  const headerBg = lighten(safePerson.color, 0.55);

  /* ---------------------------------------------------------
     DELETE CONFIRMATION
  --------------------------------------------------------- */
  const confirmDelete = () => {
    const ok = window.confirm(
      `Are you sure you want to delete ${safePerson.preferredName || safePerson.fullName}?`
    );
    if (ok) removePerson(safePerson.id);
  };

  /* ---------------------------------------------------------
     NOTES HANDLING
  --------------------------------------------------------- */
  const addNote = () => {
    if (!noteDraft.trim()) return;

    const timestamp = new Date().toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short"
    });

    updatePerson(safePerson.id, {
      notesHistory: [
        ...(safePerson.notesHistory || []),
        `${noteDraft} — ${timestamp}`
      ]
    });

    setNoteDraft("");
  };

  function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 py-1">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-gray-700 text-sm">{label}</span>
    </label>
  );
}

  return (

    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-300 flex flex-col self-start">

{/* HEADER */}
<div
  className="px-4 py-3 flex items-center justify-between w-full cursor-pointer"
  style={{ backgroundColor: headerBg }}
  onClick={() => setOpen(!open)}
>
  <div className="flex items-center gap-3">

    {/* DRAG HANDLE — MUST BE OUTSIDE THE BUTTON */}
    <div
      {...dragHandleProps}
      className="text-white hover:text-white-600 cursor-grab select-none pr-1"
      onClick={(e) => e.stopPropagation()}
    >
      ⋮⋮
    </div>

    {/* CIRCLE AVATAR */}
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow"
      style={{
        backgroundColor: safePerson.color,
        border: `2px solid ${safePerson.color}`
      }}
    >
      {initials(safePerson.fullName)}
    </div>

    {/* NAME + NUMBER */}
    <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      {safePerson.preferredName || safePerson.fullName}
      <span className="text-sm text-gray-600 font-medium">#{index + 1}</span>
      {isComplete && <CheckCircle size={18} className="text-green-600" />}
    </div>
  </div>

  <span className="text-gray-700 text-xl">
    {open ? "▼" : "◀"}
  </span>
</div>



      {/* COMPLETION BAR */}
      <div className="w-full bg-gray-200 h-2">
        <div
          className="h-2 bg-green-600 transition-all"
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* BODY */}
      <div
        className={`
          transition-all duration-300
          ${open ? "opacity-100 p-5" : "opacity-0 p-0 pointer-events-none"}
        `}
        style={{
          height: open ? "auto" : 0,
          overflow: "hidden"
        }}
      >
        <div className="space-y-4">

          {/* Full Name */}
          <InputField
            label="Full Name"
            icon={<User size={16} />}
            value={safePerson.fullName}
            onChange={(v) =>
              updatePerson(safePerson.id, {
                fullName: v,
                preferredName: safePerson.preferredName || v.split(" ")[0]
              })
            }
          />

          {/* Preferred Name */}
          <InputField
            label="Preferred Name"
            icon={<Tag size={16} />}
            value={safePerson.preferredName}
            onChange={(v) => updatePerson(safePerson.id, { preferredName: v })}
          />

{/* Email */}
<InputField
  label="Email Address"
  icon={<Mail size={16} />}
  value={safePerson.email || ""}
  error={safePerson.email && !validateEmail(safePerson.email)}
  onChange={(v) => {
    // Just store exactly what the user typed
    updatePerson(safePerson.id, { email: v });
  }}
/>


          <SelectField
            label="Select Person Type"
            options={PERSON_TYPE_OPTIONS}
            value={safePerson.personType}
            onSelect={(item) => {
              const nextType = typeof item === "string" ? item : item?.value;
              if (!nextType) return;

              const isPresenterType = nextType === "presenter" || nextType === "keynote-speaker";
              const isParticipantType = nextType === "participant";

              updatePerson(safePerson.id, {
                personType: nextType,
                isPresenter: isPresenterType,
                inSpinner: !isPresenterType,
                inGroups: isParticipantType,
              });
            }}
          />

          {/* Toggles */}
          <div className="space-y-2">
            <Toggle
              label="Include in Spinner"
              value={safePerson.inSpinner}
              onChange={(v) => updatePerson(safePerson.id, { inSpinner: v })}
            />

            <Toggle
              label="Include in Groups"
              value={safePerson.inGroups}
              onChange={(v) => updatePerson(safePerson.id, { inGroups: v })}
            />
          </div>

          {/* Dietary Requirements */}
          <DietaryRequirementsSection
            safePerson={safePerson}
            updatePerson={updatePerson}
            dietOpen={dietOpen}
            setDietOpen={setDietOpen}

          />

          {/* Accessibility Requirements */}
          <AccessibilityRequirementsSection
            safePerson={safePerson}
            updatePerson={updatePerson}
            accessOpen={accessOpen}
            setAccessOpen={setAccessOpen}
         
          />

          <NotesSection
            notesHistory={safePerson.notesHistory}
            olderNotesOpen={olderNotesOpen}
            setOlderNotesOpen={setOlderNotesOpen}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            addNote={addNote}
          />

          {/* Colour Picker */}
          <ColourPicker
            person={safePerson}
            availableColors={availableColors}
            fallbackColor={fallbackColor}
            handleColorChange={handleColorChange}
          />

          {/* History */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="font-medium text-gray-700 mb-1">History (last 3)</div>
            <ul className="list-disc ml-5 space-y-1">
              {safePerson.history.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div
        className={`
          transition-all duration-300 border-t bg-white
          ${open ? "opacity-100 p-4" : "opacity-0 p-0 pointer-events-none"}
        `}
        style={{
          height: open ? "auto" : 0,
          overflow: "hidden"
        }}
      >
        <div className="flex justify-center">
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 text-sm"

          >
            Delete Person
          </button>
        </div>
      </div>

    </div>

  );

}


