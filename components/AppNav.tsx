"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const pathname = usePathname();

  const navItems = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/missionen", icon: "🔥", label: "Mission" },
  { href: "/staerken", icon: "🌱", label: "Stärken" },
  { href: "/ziele", icon: "🎯", label: "Ziele" },
  { href: "/familienkueche", icon: "🍽️", label: "Küche" },
  { href: "/einkaufsliste", icon: "🛒", label: "Einkauf" },
  { href: "/familie", icon: "👨‍👩‍👧", label: "Familie" },
];

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-50 px-3">
      <div className="mx-auto max-w-md">
        <div className="grid grid-cols-7 gap-1 rounded-[2rem] border border-white/80 bg-white/90 p-2 shadow-2xl backdrop-blur-xl">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 transition-all duration-200 ${
                  active
                    ? "scale-105 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                <span className="text-lg leading-none sm:text-xl">
                  {item.icon}
                </span>

                <span className="mt-1 max-w-full truncate text-[9px] font-black leading-none sm:text-[10px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}