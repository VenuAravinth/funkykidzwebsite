"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDE_NAV, isNavActive } from "@/lib/navigation";

// Main page navigation from tablet width up (phones get the same items in the header menu).
export default function SideIconRail() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none absolute left-4 top-40 z-20 hidden flex-col items-center gap-4 md:flex lg:left-6">
      <nav aria-label="Main" className="pointer-events-auto flex flex-col items-center gap-1 rounded-full bg-white/90 p-2.5 shadow-lg shadow-rose-light/60">
        {SIDE_NAV.map(({ icon: Icon, href, label }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`group relative grid h-11 w-11 place-items-center rounded-full text-base transition-colors ${
                active ? "bg-rose text-white" : "text-plum/70 hover:bg-rose-light"
              }`}
            >
              <Icon />
              {/* Hover label so the icons are self-explanatory on desktop. */}
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-full bg-plum px-3 py-1 text-xs font-semibold text-white opacity-0 shadow transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
