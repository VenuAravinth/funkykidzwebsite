import { FiPhone, FiMail } from "react-icons/fi";
import { FaWhatsapp, FaLocationDot } from "react-icons/fa6";
import { SITE } from "@/lib/site";

const INFO = [
  { icon: FiPhone, title: "Phone Number", lines: ["+91 9342422170"] },
  { icon: FiMail, title: "Email Address", lines: [`Orders: ${SITE.ordersEmail}`, `Support: ${SITE.supportEmail}`] },
  { icon: FaWhatsapp, title: "WhatsApp", lines: ["+91 9342422170"] },
  { icon: FaLocationDot, title: "Our Store", lines: ["Funky Kidz, Shiva textiles Backside parking road, Jawahar Bazaar, Karur, Tamil Nadu 639001"] },
];

export default function ContactInfo() {
  return (
    <div>
      <p className="text-ink/60">
        Have a question about sizing, an order, or a custom hanbok request? We&apos;d love to hear from
        you — reach out through the form, or find us directly below.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6">
        {INFO.map((item) => (
          <div key={item.title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span
              className={`grid h-12 w-12 place-items-center rounded-full text-xl ${
                item.title === "Our Store" ? "bg-rose-dark text-white" : "bg-rose-light text-rose-dark"
              }`}
            >
              <item.icon />
            </span>
            <p className="mt-3 text-sm font-semibold text-plum">{item.title}</p>
            {item.lines.map((line) => (
              <p key={line} className="text-sm text-ink/60">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-plum/10 shadow-sm">
        <iframe
          title="FunkyKidz store location"
          src="https://www.google.com/maps?q=Funky%20Kidz%20Wear,%20Shiva%20Textiles,%20Jawahar%20Bazaar,%20Karur,%20Tamil%20Nadu%20639001&output=embed"
          width="100%"
          height="260"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
