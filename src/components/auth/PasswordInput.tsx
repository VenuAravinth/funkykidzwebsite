"use client";

import { useState, type InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Classes for the <input>; right padding for the eye button is added automatically. */
  className?: string;
  wrapperClassName?: string;
};

// Password field with a show/hide (eye) button. The button sits inside the field, keeps a
// 40px tap target, and announces its state to screen readers.
export default function PasswordInput({ className = "", wrapperClassName = "", ...props }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={`${className} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-ink/45 transition-colors hover:bg-plum/5 hover:text-plum"
      >
        {visible ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
      </button>
    </div>
  );
}
