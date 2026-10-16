const STYLES: Record<string, string> = {
  Processing: "bg-[#fff4e0] text-[#9a5b00]",
  Packed: "bg-[#eaf1ff] text-[#2453a6]",
  "In Transit": "bg-[#efe9ff] text-[#5a3aa8]",
  Delivered: "bg-[#e8f6ee] text-[#1f7a4a]",
  Cancelled: "bg-[#f1f1f1] text-[#666]",
  "Pending Verification": "bg-[#fff4e0] text-[#9a5b00]",
  Verified: "bg-[#e8f6ee] text-[#1f7a4a]",
  Rejected: "bg-[#fdecec] text-[#b42318]",
};

// Status is always text + colour, never colour alone.
export default function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${STYLES[value] ?? "bg-plum/5 text-plum"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}
