type Props = {
  variant: "girl" | "boy";
  outfit: string;
  outfitDark?: string;
  accent?: string;
  skin?: string;
  hair?: string;
  bg?: string;
  className?: string;
};

export default function KidIllustration({
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
      viewBox="0 0 300 340"
      className={className}
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label={`Illustration of a child wearing a ${outfit} hanbok`}
    >
      <rect x="0" y="0" width="300" height="340" fill={bg} />
      <ellipse cx="150" cy="300" rx="90" ry="14" fill="#00000010" />

      {variant === "girl" ? (
        <>
          <path d="M95 190 Q150 165 205 190 L225 320 L75 320 Z" fill={outfit} />
          <path d="M95 190 Q150 210 205 190 L215 225 Q150 250 85 225 Z" fill={dark} />
          <rect x="130" y="185" width="40" height="55" fill={accent} />
          <path d="M85 225 L215 225 L222 320 L78 320 Z" fill={outfit} opacity="0.95" />
          <path d="M60 195 Q90 175 100 205 L88 250 Q60 245 55 220 Z" fill={outfit} />
          <path d="M240 195 Q210 175 200 205 L212 250 Q240 245 245 220 Z" fill={outfit} />
          <circle cx="150" cy="140" r="46" fill={skin} />
          <path
            d="M104 130 Q104 78 150 76 Q196 78 196 130 Q196 108 150 104 Q104 108 104 130 Z"
            fill={hair}
          />
          <path d="M100 128 Q96 168 108 186 L118 178 Q108 150 112 126 Z" fill={hair} />
          <path d="M200 128 Q204 168 192 186 L182 178 Q192 150 188 126 Z" fill={hair} />
          <circle cx="132" cy="142" r="4" fill="#2c2438" />
          <circle cx="168" cy="142" r="4" fill="#2c2438" />
          <path d="M138 160 Q150 168 162 160" stroke="#b5654f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="120" cy="152" r="7" fill="#f1a998" opacity="0.6" />
          <circle cx="180" cy="152" r="7" fill="#f1a998" opacity="0.6" />
        </>
      ) : (
        <>
          <path d="M100 195 L200 195 L215 320 L85 320 Z" fill={outfit} />
          <path d="M100 195 Q150 218 200 195 L192 232 Q150 250 108 232 Z" fill={dark} />
          <rect x="132" y="188" width="36" height="50" fill={accent} />
          <path d="M62 200 Q92 182 106 208 L92 245 Q64 240 58 220 Z" fill={outfit} />
          <path d="M238 200 Q208 182 194 208 L208 245 Q236 240 242 220 Z" fill={outfit} />
          <circle cx="150" cy="140" r="44" fill={skin} />
          <path d="M108 118 Q108 82 150 80 Q192 82 192 118 Q170 100 150 100 Q130 100 108 118 Z" fill={hair} />
          <circle cx="133" cy="142" r="4" fill="#2c2438" />
          <circle cx="167" cy="142" r="4" fill="#2c2438" />
          <path d="M138 160 Q150 166 162 160" stroke="#b5654f" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="122" cy="150" r="6" fill="#f1a998" opacity="0.55" />
          <circle cx="178" cy="150" r="6" fill="#f1a998" opacity="0.55" />
        </>
      )}
    </svg>
  );
}
