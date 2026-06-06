"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "🏠", label: "Home" },
    { href: "/missionen", icon: "📋", label: "Mission" },
    { href: "/einkaufsliste", icon: "🛒", label: "Einkauf" },
    { href: "/kalender", icon: "📅", label: "Kalender" },
    { href: "/belohnungen", icon: "🎁", label: "Rewards" },
    { href: "/familie", icon: "👨‍👩‍👧", label: "Familie" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-6 text-center text-[11px]">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 transition ${
                active
                  ? "text-blue-600 font-bold"
                  : "text-gray-500"
              }`}
            >
              <div className={`text-xl ${active ? "scale-110" : ""}`}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}