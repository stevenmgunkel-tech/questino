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
    },
    {
      icon: "🐶",
      titel: "Hund füttern",
      kategorie: "Tiere",
      schwierig: "Leicht",
      sterne: "⭐",
      xp: 5,
      status: "Erledigt",
      faellig: "Erledigt",
      farbe: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 font-medium">Heute</p>
            <h1 className="text-3xl font-black">Missionen</h1>
            <p className="text-sm text-gray-500">
              Erledige Quests und sammle XP.
            </p>
          </div>

          <a
            href="/eltern"
            className="bg-white px-4 py-2 rounded-2xl shadow font-bold text-sm"
          >
            👨 Eltern
          </a>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] p-6 shadow-xl text-white mb-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80">Tagesfortschritt</p>
              <h2 className="text-2xl font-black">2 von 3 Missionen</h2>
            </div>
            <span className="text-4xl">🔥</span>
          </div>

          <div className="mt-5">
            <div className="w-full bg-white/25 rounded-full h-3">
              <div className="bg-white h-3 rounded-full w-2/3"></div>
            </div>

            <p className="text-sm text-white/80 mt-3">
              Noch 1 Mission bis zum Tagesbonus.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow mb-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl">⭐</p>
              <p className="font-black">20 XP</p>
              <p className="text-xs text-gray-500">heute möglich</p>
            </div>

            <div>
              <p className="text-2xl">✅</p>
              <p className="font-black">1</p>
              <p className="text-xs text-gray-500">erledigt</p>
            </div>

            <div>
              <p className="text-2xl">🎁</p>
              <p className="font-black">Bonus</p>
              <p className="text-xs text-gray-500">bei 3/3</p>
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
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl">
                    {mission.icon}
                  </div>

                  <div>
                    <h2 className="text-xl font-black">{mission.titel}</h2>

                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold">
                        {mission.kategorie}
                      </span>

                      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">
                        {mission.sterne}
                      </span>

                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                        {mission.faellig}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-blue-600">+{mission.xp}</p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${mission.farbe}`}
                >
                  {mission.status}
                </span>

                <span className="text-xs text-gray-500">
                  Schwierigkeit: {mission.schwierig}
                </span>
              </div>

              {mission.status === "Erledigt" ? (
                <button className="w-full bg-gray-200 text-gray-500 font-black py-3 rounded-2xl">
                  Wartet auf Freigabe
                </button>
              ) : (
                <button className="w-full bg-blue-600 text-white font-black py-3 rounded-2xl shadow">
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