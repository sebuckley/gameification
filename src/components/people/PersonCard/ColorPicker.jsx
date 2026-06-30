export default function ColourPicker({ person, availableColors, fallbackColor, handleColorChange }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-gray-700">
        Colour
      </span>

      <div className="mt-3 space-y-4">

        {/* Current Colour */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">
            Current Colour
          </div>

          <button
            type="button"
            onClick={() =>
              document.querySelector(`#picker-${person.id}`).click()
            }
            className="w-8 h-8 rounded-full border shadow"
            style={{ backgroundColor: person.color }}
          />
        </div>

        {/* Available Colours */}
        {availableColors.length > 0 && (
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">
              Available Colours
            </div>

            <div className="flex gap-2 flex-wrap">
              {availableColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleColorChange(c)}
                  className={`
                    w-8 h-8 rounded-full border shadow transition-transform
                    ${person.color === c ? "ring-2 ring-blue-600 scale-110" : ""}
                  `}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Custom Colour */}
        <div>
          <div className="text-xs font-medium text-gray-600 mb-1">
            Custom Colour
          </div>

          <button
            type="button"
            onClick={() => {
              handleColorChange(fallbackColor);
              document.querySelector(`#picker-${person.id}`).click();
            }}
            className="
              px-3 py-2 rounded-md border shadow text-sm font-medium
              bg-white hover:bg-gray-100 flex items-center gap-2
            "
          >
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: fallbackColor }}
            />
            Choose Custom Colour
          </button>
        </div>

        {/* Hidden native colour picker */}
        <input
          id={`picker-${person.id}`}
          type="color"
          value={person.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="hidden"
        />
      </div>
    </div>
  );
}