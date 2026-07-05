import { useState } from "react";
import { Accessibility, Plus, X } from "lucide-react";
import { ACCESSIBILITY_OPTIONS } from "../../../data/PersonCardOptions";
import DropdownSection from "./DropdownSection";
import SelectField from "./SelectField";
import BubbleList from "./BubbleList";

export default function AccessibilityRequirementsSection({
  safePerson,
  updatePerson,
  accessOpen,
  setAccessOpen,
}) {
  const [selectedAccess, setSelectedAccess] = useState("");
  const [otherText, setOtherText] = useState("");

  const isOther = selectedAccess === "Other";

  const addAccess = () => {
    if (!selectedAccess) return;

    const valueToAdd = isOther ? otherText.trim() : selectedAccess;
    if (!valueToAdd) return;

    updatePerson(safePerson.id, {
      accessibilityRequirements: [
        ...(safePerson.accessibilityRequirements || []),
        valueToAdd
      ]
    });

    // Reset fields
    setSelectedAccess("");
    setOtherText("");
  };

  const removeAccess = (i) => {
    updatePerson(safePerson.id, {
      accessibilityRequirements: safePerson.accessibilityRequirements.filter(
        (_, idx) => idx !== i
      )
    });
  };

  return (
    <DropdownSection
      label="Accessibility Requirements"
      icon={<Accessibility size={16} />}
      open={accessOpen}
      setOpen={setAccessOpen}
    >
      {/* Select new accessibility requirement */}
      <SelectField
        label="Select Accessibility Requirement"
        options={[...ACCESSIBILITY_OPTIONS, "Other"]}
        value={selectedAccess}
        onSelect={(item) => setSelectedAccess(item)}
      />

      {/* Other input */}
      {isOther && (
        <input
          type="text"
          className="border p-2 rounded w-full border-gray-300 text-sm mt-2"
          placeholder="Enter custom requirement"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
        />
      )}

      {/* Add button */}
      <button
        className="px-3 py-2 bg-gray-100 rounded border text-sm flex items-center gap-2 mt-3"
        onClick={addAccess}
      >
        <Plus size={16} /> Add Requirement
      </button>

      {/* Bubble list */}
        <BubbleList
            items={safePerson.accessibilityRequirements || []}
            onRemove={(i) => removeAccess(i)}
        />
    </DropdownSection>
  );
}
