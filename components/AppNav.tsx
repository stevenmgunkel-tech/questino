"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "🏠", label: "Home" },
    { href: "/missionen", icon: "🔥", label: "Mission" },
    { href: "/familienkueche", icon: "🍽️", label: "Küche" },
    { href: "/einkaufsliste", icon: "🛒", label: "Einkauf" },
    { href: "/kalender", icon: "📅", label: "Plan" },
    { href: "/familie", icon: "👨‍👩‍👧", label: "Familie" },
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 px-4 z-50">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-6 gap-1 rounded-[2rem] bg-white/90 backdrop-blur-xl p-2 shadow-2xl border border-white/70">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl py-2 transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>

                <span className="mt-1 text-[10px] font-black leading-none">
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