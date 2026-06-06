import AppNav from "@/components/AppNav";

export default function ElternPage() {
  const freigaben = [
    {
      icon: "🛏️",
      titel: "Zimmer aufräumen",
      kind: "Kind 1",
      xp: 10,
      typ: "Mission",
    },
    {
      icon: "🍫",
      titel: "Schokolade",
      kind: "Kind 1",
      xp: 0,
      typ: "Einkaufswunsch",
    },
    {
      icon: "🎂",
      titel: "Geburtstag Max",
      kind: "Kind 2",
      xp: 0,
      typ: "Termin-Vorschlag",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 font-medium">Kommandozentrale</p>
            <h1 className="text-3xl font-black">Eltern-Modus</h1>
            <p className="text-sm text-gray-500">Familie Gunkel verwalten</p>
          </div>

          <a
            href="/"
            className="bg-white px-4 py-2 rounded-2xl shadow font-bold text-sm"
          >
            🧒 Kind
          </a>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-blue-700 rounded-[2rem] p-6 shadow-xl text-white mb-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/70">Heute im Blick</p>
              <h2 className="text-2xl font-black">3 Freigaben</h2>
            </div>
            <span className="text-5xl">👨‍👩‍👧</span>
          </div>

          <p className="mt-4 text-sm text-white/70">
            Missionen, Einkaufswünsche und Termine warten auf Entscheidung.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <a
            href="/missionen"
            className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-2">➕</span>
            <span className="text-[11px] font-black text-gray-700 text-center">
              Mission
            </span>
          </a>

          <a
            href="/kalender"
            className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-2">📅</span>
            <span className="text-[11px] font-black text-gray-700 text-center">
              Termin
            </span>
          </a>

          <a
            href="/einkaufsliste"
            className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-2">🛒</span>
            <span className="text-[11px] font-black text-gray-700 text-center">
              Einkauf
            </span>
          </a>

          <a
            href="/belohnungen"
            className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-2">🎁</span>
            <span className="text-[11px] font-black text-gray-700 text-center">
              Reward
            </span>
          </a>
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow mb-5">
          <h2 className="text-xl font-black mb-4">✅ Wartet auf Freigabe</h2>

          <div className="space-y-4">
            {freigaben.map((item) => (
              <div
                key={item.titel}
                className="border border-gray-100 rounded-3xl p-4"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>

                  <div className="flex-1">
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

                  <button className="bg-red-500 text-white font-black py-3 rounded-2xl">
                    Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">🔥</p>
            <p className="font-black">3 offen</p>
            <p className="text-sm text-gray-500">Missionen</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">🛒</p>
            <p className="font-black">1 Wunsch</p>
            <p className="text-sm text-gray-500">Einkauf</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">📅</p>
            <p className="font-black">1 Vorschlag</p>
            <p className="text-sm text-gray-500">Kalender</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">⭐</p>
            <p className="font-black">260 XP</p>
            <p className="text-sm text-gray-500">Familie</p>
          </div>
        </div>
      </div>

      <AppNav />
    </main>
  );
}