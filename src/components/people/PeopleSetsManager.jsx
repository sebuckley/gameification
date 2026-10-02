import { useState } from "react";
import usePeople from "../store/usePeopleStore";

const PERSON_COLORS = ["#D16C7A", "#6CA8D1", "#E3C26F", "#D18F6C", "#9B7ED1", "#6CD1A8", "#D16C6C", "#6CD1D1"];
const PEOPLE_SET_TYPES = [
  { value: "team", label: "Team activities" },
  { value: "stakeholders", label: "Stakeholder engagement" },
  { value: "training-event", label: "Training / Event" },
];

function PeopleSetCard({ setItem, people, actions }) {
  const [search, setSearch] = useState("");
  const memberIds = new Set(setItem.personIds);
  const normalizedSearch = search.trim().toLowerCase();
  const members = setItem.personIds
    .map((personId) => people.find((person) => person.id === personId))
    .filter(Boolean);
  const matches = normalizedSearch
    ? people.filter((person) => {
        if (memberIds.has(person.id)) return false;
        const searchable = [person.fullName, person.preferredName, person.email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchable.includes(normalizedSearch);
      }).slice(0, 8)
    : [];
  const exactPerson = people.find((person) =>
    [person.fullName, person.preferredName]
      .filter(Boolean)
      .some((name) => name.trim().toLowerCase() === normalizedSearch)
  );
  const alreadyMember = exactPerson && memberIds.has(exactPerson.id);
  const canCreatePerson = normalizedSearch && !exactPerson && matches.length === 0;

  const addNewPerson = () => {
    const name = search.trim();
    if (!name) return;
    const usedColors = new Set(people.map((person) => person.color?.toLowerCase()).filter(Boolean));
    const color = PERSON_COLORS.find((candidate) => !usedColors.has(candidate.toLowerCase())) || PERSON_COLORS[people.length % PERSON_COLORS.length];
    actions.addPerson({
      fullName: name,
      preferredName: name,
      color,
      peopleSetId: setItem.id,
    });
    setSearch("");
  };

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label={`${setItem.name} set type`}
          value={setItem.type}
          onChange={(event) => actions.updatePeopleSet(setItem.id, { type: event.target.value })}
          className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
        >
          {PEOPLE_SET_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
        <input
          key={`${setItem.id}-${setItem.name}`}
          aria-label={`${setItem.name} set name`}
          defaultValue={setItem.name}
          onBlur={(event) => actions.updatePeopleSet(setItem.id, { name: event.target.value })}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="min-w-48 flex-1 rounded border border-slate-300 px-3 py-2 font-semibold"
        />
        <span className="text-sm text-slate-500">{members.length} {members.length === 1 ? "person" : "people"}</span>
        <button
          type="button"
          onClick={() => {
            const typeLabel = PEOPLE_SET_TYPES.find((type) => type.value === setItem.type)?.label || "people";
            if (window.confirm(`Delete the ${typeLabel} set “${setItem.name}”?`)) {
              actions.deletePeopleSet(setItem.id);
            }
          }}
          className="rounded border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
        >Delete set</button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700" htmlFor={`people-set-search-${setItem.id}`}>
          Add a person
        </label>
        <input
          id={`people-set-search-${setItem.id}`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded border border-slate-300 px-3 py-2"
        />

        {matches.length > 0 && (
          <div className="divide-y divide-slate-100 rounded border border-slate-200">
            {matches.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => {
                  actions.addPersonToPeopleSet(setItem.id, person.id);
                  setSearch("");
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span className="font-medium">{person.preferredName || person.fullName}</span>
                <span className="text-xs text-slate-500">{person.email || person.fullName}</span>
              </button>
            ))}
          </div>
        )}

        {alreadyMember && (
          <p className="text-sm text-slate-500">{exactPerson.preferredName || exactPerson.fullName} is already in this set.</p>
        )}

        {canCreatePerson && (
          <button
            type="button"
            onClick={addNewPerson}
            className="w-full rounded border border-indigo-200 bg-indigo-50 px-3 py-2 text-left text-sm font-semibold text-indigo-800 hover:bg-indigo-100"
          >Create “{search.trim()}” and add to set</button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map((person) => (
          <div key={person.id} className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span>{person.preferredName || person.fullName}</span>
            <button
              type="button"
              aria-label={`Remove ${person.preferredName || person.fullName} from ${setItem.name}`}
              onClick={() => actions.removePersonFromPeopleSet(setItem.id, person.id)}
              className="font-bold text-slate-500 hover:text-rose-700"
            >×</button>
          </div>
        ))}
        {members.length === 0 && <p className="text-sm text-slate-500">No people in this set yet.</p>}
      </div>
    </section>
  );
}

export default function PeopleSetsManager() {
  const people = usePeople((state) => state.people);
  const peopleSets = usePeople((state) => state.peopleSets || []);
  const createPeopleSet = usePeople((state) => state.createPeopleSet);
  const updatePeopleSet = usePeople((state) => state.updatePeopleSet);
  const deletePeopleSet = usePeople((state) => state.deletePeopleSet);
  const addPersonToPeopleSet = usePeople((state) => state.addPersonToPeopleSet);
  const removePersonFromPeopleSet = usePeople((state) => state.removePersonFromPeopleSet);
  const addPerson = usePeople((state) => state.addPerson);
  const [newSetType, setNewSetType] = useState("team");
  const [newSetName, setNewSetName] = useState("");

  const handleCreate = (event) => {
    event.preventDefault();
    const setId = createPeopleSet(newSetType, newSetName);
    if (setId) setNewSetName("");
  };

  const actions = {
    updatePeopleSet,
    deletePeopleSet,
    addPersonToPeopleSet,
    removePersonFromPeopleSet,
    addPerson,
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">People sets</h2>
        <p className="text-sm text-slate-600">Create activity, stakeholder or training lists. A person can belong to multiple sets.</p>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
          Set type
          <select
            value={newSetType}
            onChange={(event) => setNewSetType(event.target.value)}
            className="rounded border border-slate-300 bg-white px-3 py-2"
          >
            {PEOPLE_SET_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm font-semibold text-slate-700">
          Set name
          <input
            required
            value={newSetName}
            onChange={(event) => setNewSetName(event.target.value)}
            placeholder={newSetType === "stakeholders" ? "e.g. Project Sponsors" : newSetType === "training-event" ? "e.g. New Starter Training" : "e.g. Design Team"}
            className="rounded border border-slate-300 bg-white px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700">
          Create set
        </button>
      </form>

      <div className="space-y-3">
        {peopleSets.map((setItem) => (
          <PeopleSetCard key={setItem.id} setItem={setItem} people={people} actions={actions} />
        ))}
        {peopleSets.length === 0 && <p className="rounded border border-dashed border-slate-300 p-4 text-sm text-slate-500">No sets recorded yet.</p>}
      </div>
    </section>
  );
}