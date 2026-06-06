import AppNav from "@/components/AppNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 font-medium">Guten Tag 👋</p>
            <h1 className="text-3xl font-black">Questino</h1>
            <p className="text-sm text-gray-500">Familie Gunkel</p>
          </div>

          <a
            href="/eltern"
            className="bg-white px-4 py-2 rounded-2xl shadow font-bold text-sm"
          >
            👨 Eltern
          </a>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] p-6 shadow-xl text-white mb-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/80">Aktueller Rang</p>
              <h2 className="text-2xl font-black">Level 3 – Planer</h2>
            </div>
            <span className="text-4xl">⭐</span>
          </div>

          <div className="flex justify-center my-6">
            <div className="relative w-40 h-40">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(white 0deg 288deg, rgba(255,255,255,0.25) 288deg 360deg)",
                }}
              />

              <div className="absolute inset-[14px] rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-black">120</p>
                  <p className="text-white/80 font-bold">XP</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/80 mb-2">120 / 150 XP</p>
          <div className="w-full bg-white/25 rounded-full h-3">
            <div className="bg-white h-3 rounded-full w-4/5"></div>
          </div>

          <p className="mt-4 text-sm font-bold">
            Nächstes Level: Organisator 🌱
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
  <a
    href="/missionen"
    className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
  >
    <span className="text-2xl mb-2">➕</span>
    <span className="text-[11px] font-black text-gray-700">Mission</span>
  </a>

  <a
    href="/kalender"
    className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
  >
    <span className="text-2xl mb-2">📅</span>
    <span className="text-[11px] font-black text-gray-700">Termin</span>
  </a>

  <a
    href="/einkaufsliste"
    className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
  >
    <span className="text-2xl mb-2">🛒</span>
    <span className="text-[11px] font-black text-gray-700">Einkauf</span>
  </a>

  <a
    href="/belohnungen"
    className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center"
  >
    <span className="text-2xl mb-2">🎁</span>
    <span className="text-[11px] font-black text-gray-700">Reward</span>
  </a>
</div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">🎯</p>
            <h2 className="font-black">Wochenziel</h2>
            <p className="text-sm text-gray-500 mb-3">14 / 20 Missionen</p>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full w-[70%]"></div>
            </div>

            <p className="text-xs text-gray-500 mt-3">🍕 Pizzaabend</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl mb-2">🏕️</p>
            <h2 className="font-black">Familienziel</h2>
            <p className="text-sm text-gray-500 mb-3">620 / 1000 XP</p>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full w-3/5"></div>
            </div>

            <p className="text-xs text-gray-500 mt-3">🎢 Europa-Park</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow mb-5">
          <h2 className="text-xl font-black mb-3">🌱 Verantwortung</h2>

          <p className="font-bold">Level 3 – Planer</p>
          <p className="text-sm text-gray-500 mb-4">
            Du darfst schon mitplanen und eigene Vorschläge machen.
          </p>

          <div className="space-y-2">
            <div className="bg-green-50 text-green-700 rounded-2xl p-3 font-bold text-sm">
              ✅ Einkaufswünsche vorschlagen
            </div>

            <div className="bg-green-50 text-green-700 rounded-2xl p-3 font-bold text-sm">
              ✅ Termine vorschlagen
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow">
          <h2 className="text-xl font-black mb-4">📢 Aktivitäten</h2>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                ⭐
              </div>
              <div>
                <p className="font-bold">Kind 1 erhielt 10 XP</p>
                <p className="text-xs text-gray-400">Heute · 09:15</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
                🛒
              </div>
              <div>
                <p className="font-bold">Milch wurde hinzugefügt</p>
                <p className="text-xs text-gray-400">Heute · 08:40</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
                📅
              </div>
              <div>
                <p className="font-bold">Fußballtraining eingetragen</p>
                <p className="text-xs text-gray-400">Heute · 07:50</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AppNav />
    </main>
  );
}