import AppNav from "@/components/AppNav";

export default function ElternPage() {
  const freigaben = [
    {
      icon: "🛏️",
      titel: "Zimmer aufräumen",
      kind: "Kind 1",
      xp: 10,
      typ: "Mission",
      farbe: "bg-blue-100",
    },
    {
      icon: "🍫",
      titel: "Schokolade",
      kind: "Kind 1",
      xp: 0,
      typ: "Einkaufswunsch",
      farbe: "bg-yellow-100",
    },
    {
      icon: "🎂",
      titel: "Geburtstag Max",
      kind: "Kind 2",
      xp: 0,
      typ: "Termin-Vorschlag",
      farbe: "bg-purple-100",
    },
  ];

  const actions = [
    { href: "/missionen", icon: "➕", label: "Mission" },
    { href: "/kalender", icon: "📅", label: "Termin" },
    { href: "/einkaufsliste", icon: "🛒", label: "Einkauf" },
    { href: "/belohnungen", icon: "🎁", label: "Reward" },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-slate-800 to-blue-700 text-white flex items-center justify-center text-2xl shadow">
              👨
            </div>

            <div>
              <p className="text-gray-500 font-medium">Kommandozentrale</p>
              <h1 className="text-3xl font-black leading-none">
                Eltern
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Familie Gunkel verwalten
              </p>
            </div>
          </div>

          <a
            href="/"
            className="bg-white px-4 py-2 rounded-2xl shadow font-black text-sm"
          >
            🧒 Kind
          </a>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-800 to-indigo-700 rounded-[2.2rem] p-6 shadow-2xl text-white mb-5">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-white/10 rounded-full"></div>

          <div className="relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/70 font-medium">Heute im Blick</p>
                <h2 className="text-3xl font-black">3 Freigaben</h2>
                <p className="text-white/70 text-sm mt-1">
                  Missionen, Wünsche und Termine warten auf dich.
                </p>
              </div>

              <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center text-3xl">
                ✅
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">🔥</p>
                <p className="font-black mt-1">3</p>
                <p className="text-xs text-white/70">Missionen</p>
              </div>

              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">🛒</p>
                <p className="font-black mt-1">1</p>
                <p className="text-xs text-white/70">Wunsch</p>
              </div>

              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">📅</p>
                <p className="font-black mt-1">1</p>
                <p className="text-xs text-white/70">Termin</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {actions.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center active:scale-95 transition"
            >
              <span className="text-2xl mb-2">{item.icon}</span>
              <span className="text-[11px] font-black text-gray-700 text-center">
                {item.label}
              </span>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow mb-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-black">Freigaben</h2>
              <p className="text-sm text-gray-500">
                Entscheide, was übernommen wird.
              </p>
            </div>

            <span className="bg-red-100 text-red-600 text-xs font-black px-3 py-1 rounded-full">
              3 offen
            </span>
          </div>

          <div className="space-y-4">
            {freigaben.map((item) => (
              <div
                key={item.titel}
                className="border border-gray-100 rounded-3xl p-4"
              >
                <div className="flex gap-4 items-start">
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.farbe} flex items-center justify-center text-2xl shrink-0`}
                  >
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-black">{item.titel}</h3>
                    <p className="text-sm text-gray-500">
                      {item.typ} · {item.kind}
                      {item.xp > 0 ? ` · +${item.xp} XP` : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="bg-green-500 text-white font-black py-3 rounded-2xl">
                    Genehmigen
                  </button>

                  <button className="bg-gray-200 text-gray-600 font-black py-3 rounded-2xl">
                    Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">⭐</p>
            <p className="font-black">260 XP</p>
            <p className="text-sm text-gray-500">Familie gesamt</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">🏕️</p>
            <p className="font-black">62%</p>
            <p className="text-sm text-gray-500">Familienziel</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">🎯</p>
            <p className="font-black">14 / 20</p>
            <p className="text-sm text-gray-500">Wochenziel</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">👨‍👩‍👧</p>
            <p className="font-black">3</p>
            <p className="text-sm text-gray-500">Mitglieder</p>
          </div>
        </div>
      </div>

      <AppNav />
    </main>
  );
}