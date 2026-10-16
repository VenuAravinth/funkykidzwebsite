import { FiArrowDownCircle, FiCircle, FiMove } from "react-icons/fi";

const STEPS = [
  {
    icon: FiCircle,
    title: "Chest / Bust",
    copy: "Wrap the tape under the arms, around the fullest part of the chest, keeping it level and snug but not tight.",
  },
  {
    icon: FiMove,
    title: "Waist",
    copy: "Measure around the natural waistline — the narrowest point above the belly button — while standing relaxed.",
  },
  {
    icon: FiArrowDownCircle,
    title: "Height",
    copy: "Stand barefoot against a wall and measure from the floor to the top of the head for the most accurate reading.",
  },
];

export default function HowToMeasure() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-10 sm:px-6 md:px-12 md:pb-16">
      <div className="rounded-2xl border border-rose-light/60 bg-blush/40 px-6 py-12 md:px-12">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif-display text-2xl font-bold text-plum md:text-3xl">How to Measure</h2>
          <p className="mt-3 text-sm text-ink/60">
            Use a soft measuring tape and measure over light clothing for the most accurate fit. When
            between sizes, we recommend sizing up for room to grow.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm"
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-rose-light text-xl text-rose-dark">
                  <Icon />
                </span>
                <h3 className="text-sm font-semibold text-plum">{step.title}</h3>
                <p className="text-xs leading-relaxed text-ink/60">{step.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
