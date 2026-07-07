"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "⌂", label: "Home" },
    { href: "/missionen", icon: "✦", label: "Mission" },
    { href: "/staerken", icon: "◇", label: "Stärken" },
    { href: "/ziele", icon: "◎", label: "Ziele" },
    { href: "/routinen", icon: "↻", label: "Routine" },
    { href: "/erfolge", icon: "♕", label: "Erfolge" },
    { href: "/belohnungen", icon: "◈", label: "Belohn." },
    { href: "/familie", icon: "☷", label: "Familie" },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-[1.35rem] border border-[#E1D7C7] bg-[#FFF9EF]/95 px-2 py-2 shadow-[0_14px_35px_rgba(54,42,25,0.16)] backdrop-blur-xl">
      <div className="grid grid-cols-8 gap-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center rounded-[1rem] px-1 py-2 transition active:scale-95 ${
                active
                  ? "bg-[#20362B] text-[#FFF7EA] shadow-[0_8px_18px_rgba(32,54,43,0.20)]"
                  : "text-[#7A6A54] hover:bg-[#F3EBDD]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="mt-1 max-w-full truncate text-[9px] font-black leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
