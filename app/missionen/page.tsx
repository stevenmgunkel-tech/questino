import AppNav from "@/components/AppNav";

export default function MissionenPage() {
  const missionen = [
    {
      icon: "🛏️",
      titel: "Zimmer aufräumen",
      kategorie: "Haushalt",
      schwierig: "Mittel",
      sterne: "⭐⭐",
      xp: 10,
      status: "Offen",
      faellig: "Heute",
      farbe: "bg-blue-100 text-blue-700",
      bg: "bg-blue-100",
    },
    {
      icon: "🗑️",
      titel: "Müll rausbringen",
      kategorie: "Haushalt",
      schwierig: "Leicht",
      sterne: "⭐",
      xp: 5,
      status: "Offen",
      faellig: "Heute",
      farbe: "bg-green-100 text-green-700",
      bg: "bg-green-100",
    },
    {
      icon: "🐶",
      titel: "Hund füttern",
      kategorie: "Tiere",
      schwierig: "Leicht",
      sterne: "⭐",
      xp: 5,
      status: "Wartet",
      faellig: "Freigabe",
      farbe: "bg-yellow-100 text-yellow-700",
      bg: "bg-purple-100",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow">
              🔥
            </div>

            <div>
              <p className="text-gray-500 font-medium">Heute</p>
              <h1 className="text-3xl font-black leading-none">
                Missionen
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Erledige Quests und sammle XP.
              </p>
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
                <p className="text-white/75 font-medium">Tagesfortschritt</p>
                <h2 className="text-3xl font-black">2 von 3</h2>
                <p className="text-white/70 text-sm mt-1">
                  Noch 1 Mission bis zum Tagesbonus.
                </p>
              </div>

              <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center text-3xl">
                🎯
              </div>
            </div>

            <div className="w-full bg-white/25 rounded-full h-3">
              <div className="bg-white h-3 rounded-full w-2/3"></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">⭐</p>
                <p className="font-black mt-1">20 XP</p>
                <p className="text-xs text-white/70">möglich</p>
              </div>

              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">✅</p>
                <p className="font-black mt-1">1</p>
                <p className="text-xs text-white/70">erledigt</p>
              </div>

              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">🎁</p>
                <p className="font-black mt-1">Bonus</p>
                <p className="text-xs text-white/70">bei 3/3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {missionen.map((mission) => (
            <div
              key={mission.titel}
              className="bg-white rounded-[2rem] p-5 shadow"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="flex gap-4 min-w-0">
                  <div
                    className={`w-14 h-14 rounded-3xl ${mission.bg} flex items-center justify-center text-3xl shrink-0`}
                  >
                    {mission.icon}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl font-black leading-tight">
                      {mission.titel}
                    </h2>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-black">
                        {mission.kategorie}
                      </span>

                      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-black">
                        {mission.sterne}
                      </span>

                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-black">
                        {mission.faellig}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-black text-blue-600 text-lg">
                    +{mission.xp}
                  </p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-black ${mission.farbe}`}
                >
                  {mission.status}
                </span>

                <span className="text-xs text-gray-500">
                  Schwierigkeit: {mission.schwierig}
                </span>
              </div>

              {mission.status === "Wartet" ? (
                <button className="w-full bg-gray-200 text-gray-500 font-black py-3 rounded-2xl">
                  Wartet auf Freigabe
                </button>
              ) : (
                <button className="w-full bg-blue-600 text-white font-black py-3 rounded-2xl shadow active:scale-[0.98] transition">
                  Quest erledigen
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}