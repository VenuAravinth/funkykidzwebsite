import type { IconType } from "react-icons";
import { FiHome, FiPhone, FiUser } from "react-icons/fi";
import { TbShirt, TbTruckDelivery } from "react-icons/tb";

// Single source for the side menu (tablet/desktop) and the mobile menu, so both always
// show the same pages with the same icons.
export type NavItem = { label: string; href: string; icon: IconType };

export const SIDE_NAV: NavItem[] = [
  { label: "Home", href: "/", icon: FiHome },
  { label: "Shop All", href: "/collections", icon: TbShirt },
  { label: "Track Order", href: "/track-order", icon: TbTruckDelivery },
  { label: "My Account", href: "/profile", icon: FiUser },
  { label: "Contact Us", href: "/contact", icon: FiPhone },
];

export const isNavActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
