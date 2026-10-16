"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { FiMail } from "react-icons/fi";
import { SITE, whatsappLink } from "@/lib/site";

type FormState = { name: string; phone: string; orderNumber: string; message: string };

const EMPTY_FORM: FormState = { name: "", phone: "", orderNumber: "", message: "" };

const inputClass =
  "w-full rounded-lg border border-plum/15 bg-cream/40 px-4 py-3 text-base text-ink outline-none transition-colors focus:border-rose-dark sm:text-sm";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/50";

// The site has no inbox of its own, so the message is handed to WhatsApp (or the email app)
// already filled in — nothing is silently lost.
export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState("");

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const composed = () =>
    [
      `Hi FunkyKidz, this is ${form.name.trim()}.`,
      form.orderNumber.trim() && `Order: #${form.orderNumber.trim().replace(/^#/, "")}`,
      form.phone.trim() && `Phone: ${form.phone.trim()}`,
      "\n" + form.message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

  function valid() {
    if (!form.name.trim() || !form.message.trim()) {
      setError("Please add your name and a message.");
      return false;
    }
    setError("");
    return true;
  }

  function sendWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    if (!valid()) return;
    window.open(whatsappLink(composed()), "_blank", "noopener,noreferrer");
  }

  function sendEmail() {
    if (!valid()) return;
    const orderNumber = form.orderNumber.trim();
    const subject = orderNumber ? `Order #${orderNumber.replace(/^#/, "")}` : "Question from the website";
    // Messages about a specific order go straight to the orders inbox.
    const to = orderNumber ? SITE.ordersEmail : SITE.supportEmail;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(composed())}`;
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      <span className="text-xs font-semibold uppercase tracking-widest text-rose-dark">Contact Us</span>
      <h2 className="mt-2 font-serif-display text-2xl font-bold text-plum sm:text-3xl">Send us a message</h2>
      <p className="mt-1 text-sm text-ink/55">We usually reply on WhatsApp within a few hours during store hours.</p>

      <form onSubmit={sendWhatsApp} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="c-name" className={labelClass}>Name</label>
            <input id="c-name" required autoComplete="name" value={form.name} onChange={update("name")} className={inputClass} />
          </div>
          <div>
            <label htmlFor="c-phone" className={labelClass}>
              Phone <span className="normal-case text-ink/30">(optional)</span>
            </label>
            <input
              id="c-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={form.phone}
              onChange={update("phone")}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="c-order" className={labelClass}>
            Order number <span className="normal-case text-ink/30">(if it&apos;s about an order)</span>
          </label>
          <input id="c-order" inputMode="numeric" value={form.orderNumber} onChange={update("orderNumber")} className={inputClass} />
        </div>
        <div>
          <label htmlFor="c-message" className={labelClass}>Message</label>
          <textarea
            id="c-message"
            required
            rows={4}
            value={form.message}
            onChange={update("message")}
            placeholder="e.g. Is the hanbok set available in 5-6Y?"
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && <p className="text-sm font-medium text-rose-dark">{error}</p>}

        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3 font-semibold text-white shadow-lg shadow-[#25d366]/30"
          >
            <FaWhatsapp className="text-lg" /> Send on WhatsApp
          </button>
          <button
            type="button"
            onClick={sendEmail}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-plum/20 px-6 py-3 font-semibold text-plum hover:bg-rose-light/40"
          >
            <FiMail /> Send by email
          </button>
        </div>
      </form>
    </div>
  );
}
