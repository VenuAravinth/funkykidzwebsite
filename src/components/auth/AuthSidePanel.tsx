import PersonIllustration from "@/components/PersonIllustration";

export default function AuthSidePanel({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative hidden min-h-[560px] overflow-hidden rounded-2xl bg-gradient-to-b from-blush via-rose-light/50 to-cream shadow-sm lg:block">
      <PersonIllustration
        variant="women"
        outfit="#e78a9b"
        outfitDark="#d9647c"
        accent="#fbe2e6"
        bg="transparent"
        className="absolute inset-x-0 bottom-0 h-[60%] max-h-[340px] w-full animate-float"
      />
      <div className="relative z-10 flex h-full flex-col p-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-rose-dark">{eyebrow}</span>
        <h3 className="mt-2 font-serif-display text-3xl font-bold text-plum">{title}</h3>
        <p className="mt-3 max-w-xs text-sm text-ink/60">{description}</p>
      </div>
    </div>
  );
}
