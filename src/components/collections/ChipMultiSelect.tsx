"use client";

export default function ChipMultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(option)}
            className={`min-h-9 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
              active ? "border-plum bg-plum text-white" : "border-plum/20 text-plum hover:bg-rose-light"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
