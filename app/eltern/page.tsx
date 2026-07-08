import Link from "next/link";
import AppNav from "@/components/AppNav";

export default function ElternPage() {
  const freigaben = [
    {
      icon: "🛏️",
      titel: "Zimmer aufräumen",
      kind: "Kind 1",
      xp: 10,
      typ: "Mission",
      farbe: "bg-[#E7F0E4]",
      textFarbe: "text-[#2F5D43]",
    },
    {
      icon: "🍫",
      titel: "Schokolade",
      kind: "Kind 1",
      xp: 0,
      typ: "Einkaufswunsch",
      farbe: "bg-[#F6EAD8]",
      textFarbe: "text-[#8A4D1F]",
    },
    {
      icon: "🎂",
      titel: "Geburtstag Max",
      kind: "Kind 2",
      xp: 0,
      typ: "Termin-Vorschlag",
      farbe: "bg-[#E8E4F2]",
      textFarbe: "text-[#564485]",
    },
  ];

  const actions = [
    { href: "/missionen", icon: "✦", label: "Mission" },
    { href: "/kalender", icon: "▤", label: "Termin" },
    { href: "/einkaufsliste", icon: "☷", label: "Einkauf" },
    { href: "/belohnungen", icon: "◈", label: "Reward" },
  ];

  const kpis = [
    {
      icon: "⭐",
      wert: "260 XP",
      label: "Familie gesamt",
      farbe: "bg-[#E7F0E4]",
      textFarbe: "text-[#2F5D43]",
    },
    {
      icon: "🏕️",
      wert: "62%",
      label: "Familienziel",
      farbe: "bg-[#F3EBDD]",
      textFarbe: "text-[#8C7655]",
    },
    {
      icon: "🎯",
      wert: "14 / 20",
      label: "Wochenziel",
      farbe: "bg-[#F6EAD8]",
      textFarbe: "text-[#8A4D1F]",
    },
    {
      icon: "👨‍👩‍👧",
      wert: "3",
      label: "Mitglieder",
      farbe: "bg-[#F3EBDD]",
      textFarbe: "text-[#8C7655]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-5 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Kommandozentrale
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight">
                  Eltern
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Familie Gunkel verwalten und den Überblick behalten.
                </p>
              </div>

              <Link
                href="/"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner active:scale-95"
              >
                🧒
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3">
            <div className="rounded-2xl bg-[#F8E8DD] p-3 text-[#9A3A28]">
              <p className="text-xl font-black">3</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#B76B55]">
                Offen
              </p>
            </div>

            <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
              <p className="text-xl font-black">3</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                Missionen
              </p>
            </div>

            <div className="rounded-2xl bg-[#F3EBDD] p-3">
              <p className="text-xl font-black">1</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                Wunsch
              </p>
            </div>
          </div>
        </header>

        <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                Heute im Blick
              </p>

              <h2 className="mt-1 text-2xl font-black">3 Freigaben</h2>

              <p className="mt-1 text-sm leading-5 text-[#776B5B]">
                Missionen, Wünsche und Termine warten auf dich.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E4] text-xl">
              ✅
            </div>
          </div>
        </section>

        <section className="mb-3 grid grid-cols-4 gap-2">
          {actions.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-h-[5.2rem] flex-col items-center justify-center rounded-[1.35rem] border border-[#E1D7C7] bg-[#FFF9EF] p-3 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)] transition active:scale-[0.98]"
            >
              <span className="text-xl">{item.icon}</span>

              <span className="mt-2 text-[10px] font-black text-[#776B5B]">
                {item.label}
              </span>
            </Link>
          ))}
        </section>

        <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">Freigaben</h2>
              <p className="text-sm text-[#776B5B]">
                Entscheide, was übernommen wird.
              </p>
            </div>

            <span className="rounded-full bg-[#F8E8DD] px-3 py-1 text-xs font-black text-[#9A3A28]">
              3 offen
            </span>
          </div>

          <div className="space-y-3">
            {freigaben.map((item) => (
              <div
                key={item.titel}
                className="rounded-[1.25rem] border border-[#E8DECF] bg-[#FBF4EA] p-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.farbe} text-xl`}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-black">{item.titel}</h3>

                    <p className="text-sm text-[#776B5B]">
                      {item.typ} · {item.kind}
                      {item.xp > 0 ? ` · +${item.xp} XP` : ""}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="rounded-2xl bg-[#20362B] py-3 text-sm font-black text-[#FFF7EA] active:scale-[0.98]">
                    Genehmigen
                  </button>

                  <button className="rounded-2xl bg-[#EFE6D8] py-3 text-sm font-black text-[#776B5B] active:scale-[0.98]">
                    Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-lg font-black">Familienübersicht</h2>
            <p className="text-sm text-[#776B5B]">
              Die wichtigsten Zahlen auf einen Blick.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {kpis.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${item.farbe} text-xl`}
                >
                  {item.icon}
                </div>

                <p className={`font-black ${item.textFarbe}`}>{item.wert}</p>

                <p className="mt-1 text-sm text-[#776B5B]">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AppNav />
    </main>
  );
}
