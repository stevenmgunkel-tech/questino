import AppNav from "@/components/AppNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow">
              🚀
            </div>

            <div>
              <p className="text-gray-500 font-medium">Guten Tag 👋</p>
              <h1 className="text-3xl font-black leading-none">Questino</h1>
              <p className="text-sm text-gray-500 mt-1">Familie Gunkel</p>
            </div>
          </div>

          <a
            href="/eltern"
            className="bg-white px-4 py-2 rounded-2xl shadow font-black text-sm"
          >
            👨 Eltern
          </a>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[2.2rem] p-6 shadow-2xl text-white mb-5">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-white/10 rounded-full"></div>

          <div className="relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/75 font-medium">Aktueller Rang</p>
                <h2 className="text-2xl font-black">Level 3 – Planer</h2>
                <p className="text-white/70 text-sm mt-1">
                  Du bist auf dem Weg zum Organisator.
                </p>
              </div>

              <div className="w-12 h-12 rounded-3xl bg-white/20 flex items-center justify-center text-3xl">
                ⭐
              </div>
            </div>

            <div className="flex justify-center my-6">
              <div className="relative w-44 h-44">
                <div
                  className="absolute inset-0 rounded-full shadow-inner"
                  style={{
                    background:
                      "conic-gradient(white 0deg 288deg, rgba(255,255,255,0.22) 288deg 360deg)",
                  }}
                />

                <div className="absolute inset-[15px] rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <p className="text-5xl font-black leading-none">120</p>
                    <p className="text-white/75 font-black mt-1">XP</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>120 XP</span>
              <span>150 XP</span>
            </div>

            <div className="w-full bg-white/25 rounded-full h-3">
              <div className="bg-white h-3 rounded-full w-4/5"></div>
            </div>

            <div className="mt-5 bg-white/15 rounded-3xl p-4">
              <p className="text-sm text-white/75">Nächstes Level</p>
              <p className="font-black">Organisator 🌱</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { href: "/missionen", icon: "➕", label: "Mission" },
            { href: "/kalender", icon: "📅", label: "Termin" },
            { href: "/einkaufsliste", icon: "🛒", label: "Einkauf" },
            { href: "/belohnungen", icon: "🎁", label: "Reward" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="bg-white rounded-3xl p-4 shadow flex flex-col items-center justify-center active:scale-95 transition"
            >
              <span className="text-2xl mb-2">{item.icon}</span>
              <span className="text-[11px] font-black text-gray-700">
                {item.label}
              </span>
            </a>
          ))}
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
            <div className="bg-green-50 text-green-700 rounded-2xl p-3 font-black text-sm">
              ✅ Einkaufswünsche vorschlagen
            </div>

            <div className="bg-green-50 text-green-700 rounded-2xl p-3 font-black text-sm">
              ✅ Termine vorschlagen
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow">
          <h2 className="text-xl font-black mb-4">📢 Aktivitäten</h2>

          <div className="space-y-4">
            {[
              {
                icon: "⭐",
                text: "Kind 1 erhielt 10 XP",
                time: "Heute · 09:15",
                color: "bg-blue-100",
              },
              {
                icon: "🛒",
                text: "Milch wurde hinzugefügt",
                time: "Heute · 08:40",
                color: "bg-green-100",
              },
              {
                icon: "📅",
                text: "Fußballtraining eingetragen",
                time: "Heute · 07:50",
                color: "bg-purple-100",
              },
            ].map((item) => (
              <div key={item.text} className="flex gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center`}
                >
                  {item.icon}
                </div>

                <div>
                  <p className="font-bold">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AppNav />
    </main>
  );
}