"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUser, FiHeart, FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import logo from "@/assets/img/logo/logo.png";
import HeaderSearch from "./HeaderSearch";
import { SIDE_NAV, isNavActive } from "@/lib/navigation";

const ICON_CLASS = "grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-rose-light/50 hover:text-rose-dark";


export default function Header() {
  const pathname = usePathname();
  const { isAuthenticated, currentUser } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${
        scrolled ? "border-black/5 bg-white/90 shadow-[0_8px_30px_-12px_rgba(54,42,69,0.18)]" : "border-transparent bg-white/70"
      }`}
    >
      <div
        className={`relative mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 transition-all sm:px-6 duration-300 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <Link href="/" aria-label="FunkyKidz home" className="flex shrink-0 items-center gap-2" onClick={() => setIsMenuOpen(false)}>
          <Image src={logo} alt="FunkyKidz Karur — Korean kids fashion" style={{ height: scrolled ? "40px" : "48px" }}
            className="h-10 w-auto transition-all duration-300"
            priority
          />
          {/* Wordmark hidden on the narrowest phones so it never collides with the icons. */}
          <span className="hidden flex-col leading-none min-[380px]:flex">
            <span className="font-serif-display text-lg font-bold text-plum sm:text-xl">FunkyKidz</span>
            <span className="hidden text-[10px] tracking-wider text-rose-dark sm:block">KOREAN KIDS WEAR</span>
          </span>
        </Link>


        <div className="flex items-center gap-0.5 text-xl text-ink/80 sm:gap-1 sm:text-lg">
          <HeaderSearch onOpenChange={(open) => open && setIsMenuOpen(false)} />
          <Link
            href={isAuthenticated ? "/profile" : "/login"}
            aria-label={isAuthenticated ? `Account: ${currentUser?.name}` : "Account"}
            title={isAuthenticated ? currentUser?.name : "Account"}
            className={`relative hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-rose-light/50 hover:text-rose-dark sm:grid ${isAuthenticated ? "text-rose-dark" : ""}`}
          >
            <FiUser />
            {isAuthenticated && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-dark ring-2 ring-white" />
            )}
          </Link>
          <Link href="/wishlist" aria-label={`Wishlist, ${wishlistCount} saved`} className={`relative ${ICON_CLASS}`}>
            <FiHeart />
            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-dark px-1 text-[10px] font-semibold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            aria-label={`Bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            className={`relative ${ICON_CLASS}`}
          >
            <FiShoppingBag />
            {cartCount > 0 && (
              <span className="absolute right-0 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-dark px-1 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => {
              setIsMenuOpen((open) => !open);
            }}
            className={`${ICON_CLASS} md:hidden`}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
      {isMenuOpen && (
        <motion.nav
          key="mobile-nav"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Main"
          className="flex flex-col gap-1 overflow-hidden border-t border-black/5 bg-white px-4 py-3 text-sm font-medium text-ink/80 md:hidden"
        >
          {SIDE_NAV.map(({ label, href, icon: Icon }) => {
            const active = isNavActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-base transition-colors hover:bg-rose-dark/10 hover:text-rose-dark ${
                  active ? "bg-rose-light/50 text-rose-dark" : ""
                }`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-full text-lg ${active ? "bg-rose text-white" : "bg-cream text-plum/70"}`}>
                  <Icon />
                </span>
                {label}
              </Link>
            );
          })}
        </motion.nav>
      )}
      </AnimatePresence>
    </header>
  );
}
