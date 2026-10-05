import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import useDiscoveryStore from "../store/useDiscoveryStore";

const primary = "px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-sm";
const secondary = "px-4 py-2 border rounded-lg text-sm hover:bg-slate-50";

const TYPE_LABELS = {
  "business-analyst": "Business analyst",
  "user-researcher": "User researcher"
};

const normalise = (introductions, questions) => [
  ...introductions.map((t) => ({
    id: t.id,
    type: t.type,
    category: t.category,
    text: t.prompt,
    pointers: t.pointers || []
  })),
  ...questions.map((t) => ({
    id: t.id,
    type: t.type,
    category: t.category,
    text: t.question,
    pointers: t.pointers || []
  }))
];

export default function DiscoverySetCreate({
  categories,
  introductions,
  questions,
  onCreated,
  onCancel
}) {
  const createSet = useDiscoveryStore((s) => s.createDiscoveryQuestionSet);
  const replaceQuestions = useDiscoveryStore((s) => s.replaceDiscoveryQuestions);

  const all = useMemo(() => normalise(introductions, questions), [introductions, questions]);
  const userTypes = useMemo(() => [...new Set(all.map((t) => t.type).filter(Boolean))], [all]);

  const [name, setName] = useState("");
  const [userType, setUserType] = useState(userTypes[0] || "");
  const [off, setOff] = useState(() => new Set());
  const [open, setOpen] = useState(() => new Set());

  const toggle = (setter, key) =>
    setter((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const isOn = (key) => !off.has(key);

  const areas = categories
    .map((cat) => ({
      cat,
      items: all.filter((t) => t.category === cat && (!t.type || t.type === userType))
    }))
    .filter((a) => a.items.length > 0);

  const create = () => {
    const built = areas.flatMap(({ cat, items }) =>
      !isOn(`area:${cat}`)
        ? []
        : items
            .filter((t) => isOn(`item:${t.id}`))
            .map((t) => ({
              id: nanoid(),
              question: t.text,
              templateId: t.id,
              category: cat,
              pointers: t.pointers.filter((_, i) => isOn(`pointer:${t.id}:${i}`))
            }))
    );

    const id = createSet(name.trim() || "New discovery set", {});
    replaceQuestions(id, built);
    onCreated(id);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">New Question Set</h2>
        <p className="text-sm text-slate-600">
          Choose a user type, select template areas, customise questions, then save your set.
        </p>
      </div>

      {/* Set Name */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-slate-700">Set name</label>
        <input
          className="border rounded-lg p-2 text-sm w-full"
          placeholder="Enter a name for this discovery set"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* User Type */}
      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-700">User type</div>
        <div className="flex flex-wrap gap-2">
          {userTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setUserType(t)}
              className={`rounded-full border px-3 py-1 text-sm ${
                userType === t
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700"
              }`}
            >
              {TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      </div>

      {/* Template Areas */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-slate-700">Template areas</div>

        {areas.map(({ cat, items }) => {
          const areaOn = isOn(`area:${cat}`);

          return (
            <div key={cat} className="rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between p-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={areaOn}
                    onChange={() => toggle(setOff, `area:${cat}`)}
                  />
                  {cat}
                  <span className="text-xs text-slate-500">({items.length})</span>
                </label>

                <button
                  type="button"
                  className="text-xs text-indigo-600 font-medium"
                  onClick={() => toggle(setOpen, cat)}
                >
                  {open.has(cat) ? "Hide" : "Customise"}
                </button>
              </div>

              {open.has(cat) && (
                <ul className={`border-t p-3 space-y-3 ${areaOn ? "" : "opacity-50"}`}>
                  {items.map((t) => (
                    <li key={t.id} className="space-y-1">
                      <label className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={isOn(`item:${t.id}`)}
                          onChange={() => toggle(setOff, `item:${t.id}`)}
                        />
                        {t.text}
                      </label>

                      {t.pointers.length > 0 && (
                        <ul className="ml-6 space-y-1">
                          {t.pointers.map((p, i) => (
                            <li key={i}>
                              <label className="flex items-start gap-2 text-xs text-slate-600">
                                <input
                                  type="checkbox"
                                  checked={isOn(`pointer:${t.id}:${i}`)}
                                  onChange={() => toggle(setOff, `pointer:${t.id}:${i}`)}
                                />
                                {p}
                              </label>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {areas.length === 0 && (
          <p className="text-sm text-slate-500">
            No templates available for this user type. You can start with an empty set.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" className={primary} onClick={create}>
          Create set
        </button>
        <button type="button" className={secondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
