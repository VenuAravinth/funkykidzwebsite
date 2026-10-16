import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { FiMail, FiPhone } from "react-icons/fi";
import footerImg1 from "@/assets/img/home/footer/footer-img1.png";
import logo from "@/assets/img/logo/logo.png";
import { SITE, fullAddress, whatsappLink } from "@/lib/site";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/collections" },
      { label: "New Arrivals", href: "/collections?new=1&sort=newest" },
      { label: "Girls", href: "/collections?gender=Girls" },
      { label: "Boys", href: "/collections?gender=Boys" },
      { label: "Hanbok Sets", href: "/collections?category=Hanbok+Sets" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help / FAQ", href: "/faq" },
      { label: "How to Use Redeem Codes", href: "/redeem-codes" },
      { label: "Contact Us", href: "/contact" },
      { label: "Track Order", href: "/track-order" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Payment Methods", href: "/payment-methods" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Shipping & Delivery", href: "/shipping-info" },
      { label: "Returns & Exchanges", href: "/returns-exchanges" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-conditions" },
      { label: "About Us", href: "/about" },
      { label: "Our Karur Store", href: "/kids-dresses-karur" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-plum text-white/80">
      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-2 gap-10 px-6 py-14 sm:grid-cols-3 md:px-12 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="FunkyKidz Karur logo" className="h-9 w-auto" />
            <span className="font-serif-display text-lg font-bold text-white">FunkyKidz</span>
          </Link>
          <p className="mt-2 text-xs tracking-wide text-white/50">KOREAN-STYLE KIDS&apos; CLOTHING · AGES 0–15</p>
          <p className="mt-4 max-w-[240px] text-sm text-white/60">
            Bringing the best of Korean fashion to your little stars — from Karur to all of India.
          </p>
          <address className="mt-4 max-w-[240px] text-xs not-italic leading-relaxed text-white/50">
            {fullAddress()}
          </address>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1.5 hover:text-white">
                <FaWhatsapp className="text-[#25d366]" /> WhatsApp {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 py-1.5 hover:text-white">
                <FiPhone /> Call {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.ordersEmail}`} className="flex items-center gap-2 break-all py-1.5 hover:text-white">
                <FiMail className="shrink-0" /> Orders: {SITE.ordersEmail}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.supportEmail}`} className="flex items-center gap-2 break-all py-1.5 hover:text-white">
                <FiMail className="shrink-0" /> Support: {SITE.supportEmail}
              </a>
            </li>
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="mb-4 text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-0.5 text-sm text-white/60">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="inline-block py-1.5 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[420px] overflow-hidden md:block lg:w-[520px]">
        <Image
          src={footerImg1}
          alt=""
          fill
          sizes="520px"
          className="object-cover object-right opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-plum via-plum/40 to-transparent" />
      </div>

      <div className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-white/50 sm:flex-row md:px-12">
          <p>© {new Date().getFullYear()} FunkyKidz, Karur. All Rights Reserved.</p>
          <p className="flex items-center gap-2">
            <span>We accept</span>
            <span className="rounded bg-white/10 px-2 py-1 font-semibold text-white/80">UPI</span>
            <span className="text-white/40">GPay · PhonePe · Paytm · BHIM</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
