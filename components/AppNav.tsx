"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const mainItems: NavItem[] = [
  { href: "/", icon: "⌂", label: "Home" },
  { href: "/missionen", icon: "✦", label: "Mission" },
  { href: "/routinen", icon: "↻", label: "Routine" },
  { href: "/ziele", icon: "◎", label: "Ziele" },
  { href: "/familie", icon: "☷", label: "Familie" },
];

const moreItems: NavItem[] = [
  { href: "/staerken", icon: "◇", label: "Stärken" },
  { href: "/erfolge", icon: "♕", label: "Erfolge" },
  { href: "/belohnungen", icon: "◈", label: "Belohnungen" },
  { href: "/chronik", icon: "☷", label: "Chronik" },
  { href: "/familienwerte", icon: "♡", label: "Werte" },
  { href: "/wochenrueckblick", icon: "☰", label: "Woche" },
  { href: "/statistik", icon: "▥", label: "Statistik" },
];

export default function AppNav() {
  const pathname = usePathname();
  const [mehrOffen, setMehrOffen] = useState(false);

  useEffect(() => {
    setMehrOffen(false);
  }, [pathname]);

  function istAktiv(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }

  const mehrAktiv = moreItems.some((item) => istAktiv(item.href));

  return (
    <>
      {mehrOffen && (
        <div className="fixed inset-0 z-40 bg-[#182019]/20 backdrop-blur-[2px]">
          <button
            aria-label="Menü schließen"
            onClick={() => setMehrOffen(false)}
            className="absolute inset-0 h-full w-full"
          />

          <div className="absolute bottom-[calc(5.9rem+env(safe-area-inset-bottom))] left-1/2 w-[calc(100%-1rem)] max-w-md -translate-x-1/2 rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] p-3 shadow-[0_18px_45px_rgba(54,42,25,0.20)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#8C7655]">
                  Questino
                </p>
                <p className="text-lg font-black text-[#182019]">Mehr</p>
              </div>

              <button
                type="button"
                onClick={() => setMehrOffen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EBDD] text-sm font-black text-[#20362B] active:scale-95"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const active = istAktiv(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl border p-3 transition active:scale-[0.98] ${
                      active
                        ? "border-[#20362B] bg-[#20362B] text-[#FFF7EA]"
                        : "border-[#E8DECF] bg-[#FBF4EA] text-[#182019]"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${
                        active ? "bg-white/10" : "bg-[#F3EBDD]"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span className="min-w-0 truncate text-sm font-black">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
        <div className="mx-auto mb-[max(0.65rem,env(safe-area-inset-bottom))] w-[calc(100%-1rem)] max-w-md rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF]/96 p-2 shadow-[0_14px_35px_rgba(54,42,25,0.18)] backdrop-blur-xl pointer-events-auto">
          <div className="grid grid-cols-6 gap-1">
            {mainItems.map((item) => {
              const active = istAktiv(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[3.35rem] min-w-0 flex-col items-center justify-center rounded-[1.05rem] px-1 transition active:scale-95 ${
                    active
                      ? "bg-[#20362B] text-[#FFF7EA] shadow-[0_8px_18px_rgba(32,54,43,0.20)]"
                      : "text-[#7A6A54] hover:bg-[#F3EBDD]"
                  }`}
                >
                  <span className="text-[1.05rem] leading-none">
                    {item.icon}
                  </span>
                  <span className="mt-1 max-w-full truncate text-[9px] font-black leading-none">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setMehrOffen((offen) => !offen)}
              className={`flex min-h-[3.35rem] min-w-0 flex-col items-center justify-center rounded-[1.05rem] px-1 transition active:scale-95 ${
                mehrOffen || mehrAktiv
                  ? "bg-[#20362B] text-[#FFF7EA] shadow-[0_8px_18px_rgba(32,54,43,0.20)]"
                  : "text-[#7A6A54] hover:bg-[#F3EBDD]"
              }`}
            >
              <span className="text-[1.05rem] leading-none">☰</span>
              <span className="mt-1 max-w-full truncate text-[9px] font-black leading-none">
                Mehr
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
