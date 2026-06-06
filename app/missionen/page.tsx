import AppNav from "@/components/AppNav";

export default function MissionenPage() {
  const missionen = [
    { icon: "🛏️", titel: "Zimmer aufräumen", xp: 10, status: "Offen" },
    { icon: "🗑️", titel: "Müll rausbringen", xp: 5, status: "Offen" },
    { icon: "🐶", titel: "Hund füttern", xp: 5, status: "Erledigt" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">🔥 Missionen</h1>
        <p className="text-gray-700 mb-6">
          Erledige deine Aufgaben und sammle XP.
        </p>
        
<div className="bg-white rounded-3xl p-5 shadow mb-6">
  <h2 className="text-xl font-bold mb-4">
    ➕ Neue Mission
  </h2>

  <div className="space-y-3">

    <input
      placeholder="Mission Titel"
      className="w-full border rounded-xl p-3"
    />

    <input
      placeholder="XP"
      className="w-full border rounded-xl p-3"
    />

    <select className="w-full border rounded-xl p-3">
      <option>Kind 1</option>
      <option>Kind 2</option>
    </select>

    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl">
      Mission erstellen
    </button>

  </div>
</div>        

        <div className="space-y-4">
          {missionen.map((mission) => (
            <div
              key={mission.titel}
              className="bg-white rounded-3xl p-5 shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-3xl mb-2">{mission.icon}</p>
                  <h2 className="text-xl font-bold text-gray-900">
                    {mission.titel}
                  </h2>
                  <p className="text-blue-600 font-bold">
                    +{mission.xp} XP
                  </p>
                </div>

                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {mission.status}
                </span>
              </div>

              <button className="mt-4 w-full bg-green-500 text-white font-bold py-3 rounded-2xl">
                Quest erledigt
              </button>
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}