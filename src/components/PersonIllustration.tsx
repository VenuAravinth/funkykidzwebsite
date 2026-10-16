type Props = {
  variant: "women" | "men";
  outfit: string;
  outfitDark?: string;
  accent?: string;
  skin?: string;
  hair?: string;
  bg?: string;
  className?: string;
};

export default function PersonIllustration({
  variant,
  outfit,
  outfitDark,
  accent = "#f4d9c6",
  skin = "#f2c9a5",
  hair = "#2c2438",
  bg = "#f8e9e6",
  className = "",
}: Props) {
  const dark = outfitDark ?? outfit;
  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label={`Illustration of ${variant === "women" ? "a woman" : "a man"} wearing a ${outfit} outfit`}
    >
      <rect x="0" y="0" width="300" height="400" fill={bg} />
      <ellipse cx="150" cy="384" rx="98" ry="14" fill="#00000010" />

      {variant === "women" ? (
        <>
          {/* long flowing gown */}
          <path d="M104 196 Q150 170 196 196 L220 372 L80 372 Z" fill={outfit} />
          {/* fitted bodice */}
          <path d="M108 196 Q150 214 192 196 L184 240 Q150 252 116 240 Z" fill={dark} />
          <rect x="134" y="193" width="32" height="50" fill={accent} />
          {/* long sleeves following the gown */}
          <path d="M76 200 Q98 184 112 206 L96 288 Q74 280 68 238 Z" fill={outfit} />
          <path d="M224 200 Q202 184 188 206 L204 288 Q226 280 232 238 Z" fill={outfit} />
          {/* head */}
          <circle cx="150" cy="150" r="42" fill={skin} />
          {/* hair cap */}
          <path d="M110 146 Q110 96 150 92 Q190 96 190 146 Q190 118 150 112 Q110 118 110 146 Z" fill={hair} />
          {/* long side strands past the shoulders */}
          <path d="M108 140 Q96 200 106 260 L124 250 Q114 195 116 138 Z" fill={hair} />
          <path d="M192 140 Q204 200 194 260 L176 250 Q186 195 184 138 Z" fill={hair} />
          <circle cx="136" cy="152" r="3.6" fill="#2c2438" />
          <circle cx="164" cy="152" r="3.6" fill="#2c2438" />
          <path d="M141 168 Q150 173 159 168" stroke="#b5654f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* structured knee-length coat */}
          <path d="M94 190 L206 190 L218 372 L82 372 Z" fill={outfit} />
          {/* lapel / inner panel */}
          <path d="M134 190 L166 190 L174 290 L150 372 L126 290 Z" fill={dark} />
          <rect x="138" y="188" width="24" height="34" fill={accent} />
          {/* structured sleeves */}
          <path d="M66 196 L94 186 L106 226 L88 300 L60 292 Z" fill={outfit} />
          <path d="M234 196 L206 186 L194 226 L212 300 L240 292 Z" fill={outfit} />
          {/* head */}
          <circle cx="150" cy="145" r="40" fill={skin} />
          {/* short, simple hair */}
          <path d="M112 138 Q112 104 150 102 Q188 104 188 138 Q166 118 150 118 Q134 118 112 138 Z" fill={hair} />
          <circle cx="137" cy="147" r="3.4" fill="#2c2438" />
          <circle cx="163" cy="147" r="3.4" fill="#2c2438" />
          <path d="M141 163 Q150 167 159 163" stroke="#b5654f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
