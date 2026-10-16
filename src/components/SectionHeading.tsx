import { HiSparkles } from "react-icons/hi2";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  tone?: "light" | "dark";
};

export default function SectionHeading({ eyebrow, title, subtitle, align = "center", as: Tag = "h2", tone = "light" }: Props) {
  const centered = align === "center";
  const dark = tone === "dark";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-3xl`}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] ${
            dark ? "bg-white/10 text-rose-light" : "bg-rose-light text-rose-dark"
          }`}
        >
          <HiSparkles className="text-gold" /> {eyebrow}
        </span>
      )}
      <Tag className={`mt-4 font-serif-display text-3xl font-bold leading-tight md:text-[2.6rem] ${dark ? "text-white" : "text-plum"}`}>
        {title}
      </Tag>
      {subtitle && <p className={`mt-4 text-base leading-relaxed ${dark ? "text-white/70" : "text-ink/60"}`}>{subtitle}</p>}
    </div>
  );
}
