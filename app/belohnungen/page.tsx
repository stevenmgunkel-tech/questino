import AppNav from "@/components/AppNav";

export default function BelohnungenPage() {
  const rewards = [
    {
      icon: "🍦",
      titel: "Eis essen",
      beschreibung: "Kleine Belohnung nach starken Missionen.",
      xp: 150,
      vorhanden: 120,
      status: "Bald",
      level: "Level 2",
      farbe: "bg-pink-100",
    },
    {
      icon: "🎮",
      titel: "1 Stunde Gaming",
      beschreibung: "Extra Spielzeit am Wochenende.",
      xp: 250,
      vorhanden: 120,
      status: "Sparen",
      level: "Level 3",
      farbe: "bg-blue-100",
    },
    {
      icon: "🎬",
      titel: "Kinoabend",
      beschreibung: "Gemeinsamer Abend mit Popcorn.",
      xp: 500,
      vorhanden: 120,
      status: "Ziel",
      level: "Level 4",
      farbe: "bg-purple-100",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow">
              🎁
            </div>

            <div>
              <p className="text-gray-500 font-medium">
                Deine Belohnungen
              </p>

              <h1 className="text-3xl font-black leading-none">
                Rewards
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Tausche XP gegen Erlebnisse.
              </p>
            </div>
          </div>

          <button className="bg-white px-4 py-2 rounded-2xl shadow font-black text-sm">
            ➕ Neu
          </button>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-[2.2rem] p-6 shadow-2xl text-white mb-5">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/15 rounded-full"></div>
          <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-white/10 rounded-full"></div>

          <div className="relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-white/80 font-medium">
                  Aktuelles Guthaben
                </p>

                <h2 className="text-4xl font-black">
                  120 XP
                </h2>

                <p className="text-white/80 text-sm mt-1">
                  Noch 30 XP bis zur ersten Belohnung.
                </p>
              </div>

              <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center text-3xl">
                ⭐
              </div>
            </div>

            <div className="bg-white/15 rounded-3xl p-4">
              <p className="text-sm text-white/75">Nächstes Reward</p>
              <p className="font-black">🍦 Eis essen · 150 XP</p>

              <div className="w-full bg-white/25 rounded-full h-3 mt-3">
                <div className="bg-white h-3 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-3xl p-4 shadow text-center">
            <p className="text-2xl">⭐</p>
            <p className="font-black mt-1">120</p>
            <p className="text-xs text-gray-500">XP</p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow text-center">
            <p className="text-2xl">🎁</p>
            <p className="font-black mt-1">3</p>
            <p className="text-xs text-gray-500">Rewards</p>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow text-center">
            <p className="text-2xl">🔥</p>
            <p className="font-black mt-1">30</p>
            <p className="text-xs text-gray-500">fehlen</p>
          </div>
        </div>

        <div className="space-y-4">
          {rewards.map((reward) => {
            const percent = Math.min(
              100,
              Math.round((reward.vorhanden / reward.xp) * 100)
            );

            const missing = Math.max(0, reward.xp - reward.vorhanden);

            return (
              <div
                key={reward.titel}
                className="bg-white rounded-[2rem] p-5 shadow"
              >
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="flex gap-4 min-w-0">
                    <div
                      className={`w-14 h-14 rounded-3xl ${reward.farbe} flex items-center justify-center text-3xl shrink-0`}
                    >
                      {reward.icon}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xl font-black leading-tight">
                        {reward.titel}
                      </h2>

                      <p className="text-sm text-gray-500 mt-1">
                        {reward.beschreibung}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-black shrink-0 ${
                      missing === 0
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {reward.status}
                  </span>
                </div>

                <div className="flex justify-between text-sm mb-2">
                  <span className="font-black text-blue-600">
                    {reward.vorhanden} XP
                  </span>

                  <span className="text-gray-500">
                    {reward.xp} XP
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-gray-500 font-bold">
                    {missing > 0
                      ? `Noch ${missing} XP fehlen`
                      : "Bereit zum Einlösen"}
                  </p>

                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-black">
                    {reward.level}
                  </span>
                </div>

                <button
                  className={`mt-4 w-full font-black py-3 rounded-2xl shadow active:scale-[0.98] transition ${
                    missing === 0
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {missing === 0 ? "Belohnung einlösen" : "Weiter sammeln"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <AppNav />
    </main>
  );
}