import usePeople from "../store/usePeopleStore";
import { lighten } from "./GroupEditor";
import { initials } from "./GroupEditor";

const STAGE_ASPECT = 16 / 9;

// Picks the column count that lets the largest base font size (in cqh) fit every group
// inside the 16:9 stage. All card dimensions are in em, so they scale with the stage.
function fitGrid(groups) {
  const count = Math.max(groups.length, 1);
  const maxMembers = Math.max(1, ...groups.map((group) => group.length));
  let best = { cols: count, size: 1 };

  for (let cols = 1; cols <= count; cols += 1) {
    const rows = Math.ceil(count / cols);
    const byHeight = 100 / (rows * (4.2 + 3 * maxMembers) + 2);
    const byWidth = (100 / (cols * 13 + 2)) * STAGE_ASPECT;
    const size = Math.min(byHeight, byWidth);
    if (size > best.size || cols === 1) best = { cols, size };
  }

  return { cols: best.cols, size: Math.min(best.size, 5) };
}

export default function GroupViewer({ index }) {
  const groupsHistory = usePeople((s) => s.groupsHistory);
  const session = groupsHistory.find((s) => s._id === index);

  if (!session) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white font-semibold text-red-600">
        Error: Group session not found.
      </div>
    );
  }

  const { cols, size } = fitGrid(session.groups);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-white">
      <div
        className="grid w-full items-start justify-center gap-[1em] p-[1em]"
        style={{
          fontSize: `${size}cqh`,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {session.groups.map((group, groupIndex) => (
          <div key={groupIndex} className="min-w-0 rounded-[0.4em] border bg-white shadow-md">
            <div className="rounded-t-[0.4em] bg-indigo-600 px-[0.7em] py-[0.4em] font-semibold leading-tight text-white">
              Group {groupIndex + 1}
            </div>

            <ul className="flex flex-col gap-[0.4em] p-[0.5em]">
              {group.map((p) => (
                <li
                  key={p.id}
                  className="flex min-w-0 items-center gap-[0.6em] rounded-[0.3em] p-[0.3em] shadow-sm"
                  style={{
                    backgroundColor: lighten(p.color, 0.55),
                    border: `2px solid ${p.color}`,
                  }}
                >
                  <div
                    className="flex h-[2em] w-[2em] shrink-0 items-center justify-center rounded-full text-[0.8em] font-bold text-white shadow"
                    style={{ backgroundColor: p.color }}
                  >
                    {initials(p.fullName)}
                  </div>

                  <span className="min-w-0 truncate font-medium text-gray-800">
                    {p.preferredName || p.fullName}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
