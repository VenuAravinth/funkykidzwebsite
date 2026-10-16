import { FiCheck, FiCheckCircle, FiCreditCard, FiMapPin, FiShield } from "react-icons/fi";

export type CheckoutStep = "address" | "payment" | "proof" | "success";

const STEPS: { id: CheckoutStep; label: string; icon: typeof FiMapPin }[] = [
  { id: "address", label: "Address", icon: FiMapPin },
  { id: "payment", label: "Payment", icon: FiCreditCard },
  { id: "proof", label: "Payment Verification", icon: FiShield },
  { id: "success", label: "Order Confirmation", icon: FiCheckCircle },
];

// Progress bar across the top of checkout. Finished steps get a small tick badge; on the
// confirmation screen every step shows as done.
export default function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  const allDone = current === "success";

  return (
    <nav aria-label="Checkout progress" className="mx-auto mb-10 max-w-2xl">
      <ol className="flex">
        {STEPS.map((s, i) => {
          const done = i < currentIndex || allDone;
          const active = i === currentIndex && !allDone;
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center" aria-current={active ? "step" : undefined}>
              {/* Connector to the next step, drawn from this circle's centre. */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute left-1/2 top-[23px] h-[3px] w-full rounded-full min-[360px]:top-[27px] sm:top-[31px] ${i < currentIndex || allDone ? "bg-plum" : "bg-plum/15"}`}
                />
              )}
              <span
                className={`relative grid h-12 w-12 place-items-center rounded-full text-[22px] transition-colors min-[360px]:h-14 min-[360px]:w-14 min-[360px]:text-2xl sm:h-16 sm:w-16 sm:text-[28px] ${
                  done
                    ? "bg-plum text-white"
                    : active
                      ? "bg-rose text-white shadow-lg shadow-rose/30 ring-4 ring-rose-light"
                      : "border-2 border-plum/20 bg-white text-plum/40"
                }`}
              >
                <s.icon aria-hidden />
                {done && (
                  <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-xs text-white ring-2 ring-white">
                    <FiCheck aria-hidden />
                  </span>
                )}
              </span>
              <span
                className={`mt-2.5 max-w-[84px] px-0.5 text-center text-[11px] font-semibold leading-tight min-[360px]:text-xs sm:max-w-none sm:text-sm ${
                  done || active ? "text-plum" : "text-ink/40"
                }`}
              >
                {s.label}
                <span className="sr-only">{done ? " (done)" : active ? " (current step)" : ""}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
