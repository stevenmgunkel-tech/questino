import AppNav from "@/components/AppNav";

export default function BelohnungenPage() {
  const rewards = [
    {
      icon: "🍦",
      titel: "Eis essen",
      xp: 150,
      status: "Verfügbar",
    },
    {
      icon: "🎬",
      titel: "Kinoabend",
      xp: 500,
      status: "Sparen",
    },
    {
      icon: "🎮",
      titel: "1 Stunde Gaming",
      xp: 250,
      status: "Verfügbar",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 font-medium">
              Deine Belohnungen
            </p>

            <h1 className="text-3xl font-black">
              Rewards
            </h1>

            <p className="text-sm text-gray-500">
              Tausche XP gegen Erlebnisse.
            </p>
          </div>

          <button className="bg-white px-4 py-2 rounded-2xl shadow font-bold text-sm">
            ➕ Reward
          </button>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-[2rem] p-6 shadow-xl text-white mb-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80">
                Aktuelles Guthaben
              </p>

              <h2 className="text-3xl font-black">
                120 XP
              </h2>
            </div>

            <span className="text-5xl">
              🎁
            </span>
          </div>

          <p className="mt-4 text-sm text-white/80">
            Noch 30 XP bis zur nächsten Belohnung.
          </p>
        </div>

        <div className="space-y-4">
          {rewards.map((reward) => (
            <div
              key={reward.titel}
              className="bg-white rounded-[2rem] p-5 shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl">
                    {reward.icon}
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      {reward.titel}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Kostet {reward.xp} XP
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold ${
                    reward.status === "Verfügbar"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {reward.status}
                </span>
              </div>

              <button className="mt-4 w-full bg-blue-600 text-white font-black py-3 rounded-2xl shadow">
                Belohnung einlösen
              </button>
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}