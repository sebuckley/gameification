import { useState } from "react";
import { Utensils, Plus, X } from "lucide-react";
import { DIETARY_OPTIONS } from "../../../data/PersonCardOptions";
import DropdownSection from "./DropdownSection";
import SelectField from "./SelectField";
import BubbleList from "./BubbleList";

export default function DietaryRequirementsSection({
  safePerson,
  updatePerson,
  dietOpen,
  setDietOpen,
}) {
  const [selectedDiet, setSelectedDiet] = useState("");
  const [otherText, setOtherText] = useState("");

  const isOther = selectedDiet === "Other";

  const addDiet = () => {
    if (!selectedDiet) return;

    const valueToAdd = isOther ? otherText.trim() : selectedDiet;
    if (!valueToAdd) return;

    updatePerson(safePerson.id, {
      dietaryRequirements: [
        ...(safePerson.dietaryRequirements || []),
        valueToAdd
      ]
    });

    // Reset fields
    setSelectedDiet("");
    setOtherText("");
  };

  const removeDiet = (i) => {
    updatePerson(safePerson.id, {
      dietaryRequirements: safePerson.dietaryRequirements.filter(
        (_, idx) => idx !== i
      )
    });
  };

  return (

    
    <DropdownSection
      label="Dietary Requirements"
      icon={<Utensils size={16} />}
      open={dietOpen}
      setOpen={setDietOpen}
    >
      {/* Select new dietary requirement */}
      <SelectField
        label="Select Dietary Requirement"
        options={[...DIETARY_OPTIONS, "Other"]}
        value={selectedDiet}
        onSelect={(item) => setSelectedDiet(item)}
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
        onClick={addDiet}
      >
        <Plus size={16} /> Add Requirement
      </button>

        <BubbleList
            items={safePerson.dietaryRequirements || []}
            onRemove={(i) => removeDiet(i)}
        />

    </DropdownSection>
  );
}
