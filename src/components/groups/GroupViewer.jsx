import usePeople from "../store/usePeopleStore";
import { lighten } from "./GroupEditor";
import { initials } from "./GroupEditor";

export default function GroupViewer({ index, fullScreen = false }) {
  const groupsHistory = usePeople((s) => s.groupsHistory);

  // Find the session by _id
  const session = groupsHistory.find(s => s._id === index);

  console.log("Current session:", session);

  if (!session) {
    return (
      <div className="text-red-600 font-semibold">
        Error: Group session not found.
      </div>
    );
  }

return (
  <div className={`w-full h-full bg-white overflow-auto ${fullScreen ? "min-h-screen" : ""}`}>

    <div className={` ${fullScreen ? "min-h-[calc(100vh-150px)]" : ""} flex items-center justify-center`}>

      <div className="flex flex-wrap justify-center gap-10 max-w-[95%]">
        {session.groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="
              rounded border bg-white shadow-md 
              min-w-[250px] max-w-[350px]
              w-full sm:w-[45%] lg:w-[30%]
            "
          >
            <div className="bg-indigo-600 text-white px-4 py-2 rounded-t font-semibold">
              Group {groupIndex + 1}
            </div>

            <ul className="p-4 space-y-4">
              {group.map((p) => {
                const bg = lighten(p.color, 0.55);
                const border = p.color;

                return (
                  <li
                    key={p.id}
                    className="p-3 rounded flex items-center gap-4 shadow-sm"
                    style={{
                      backgroundColor: bg,
                      border: `2px solid ${border}`,
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow"
                      style={{
                        backgroundColor: p.color,
                        border: `2px solid ${border}`,
                      }}
                    >
                      {initials(p.fullName)}
                    </div>

                    <span className="font-medium text-gray-800 text-lg">
                      {p.preferredName || p.fullName}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

    </div>

  </div>
);





}
