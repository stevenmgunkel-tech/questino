import AppNav from "@/components/AppNav";

export default function FamiliePage() {
  const familie = [
    {
      name: "Steven",
      rolle: "Eltern",
      level: 5,
      xp: 420,
      icon: "👨",
    },
    {
      name: "Kind 1",
      rolle: "Kind",
      level: 3,
      xp: 120,
      icon: "🧒",
    },
    {
      name: "Kind 2",
      rolle: "Kind",
      level: 2,
      xp: 80,
      icon: "👧",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">👨‍👩‍👧 Familie</h1>
        <p className="text-gray-700 mb-6">
          Deine Familienhelden auf einen Blick.
        </p>

        <div className="space-y-4">
          {familie.map((person) => (
            <div
              key={person.name}
              className="bg-white rounded-3xl p-5 shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{person.icon}</div>

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {person.name}
                  </h2>
                  <p className="text-sm text-gray-600">{person.rolle}</p>
                  <p className="text-sm font-bold text-blue-600">
                    Level {person.level} · {person.xp} XP
                  </p>
                </div>
              </div>

              <span className="text-2xl">🏅</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow mt-6">
          <h2 className="text-xl font-bold mb-3">🏆 Heldenhalle</h2>

          <ol className="space-y-2">
            <li>🥇 Steven - 420 XP</li>
            <li>🥈 Kind 1 - 120 XP</li>
            <li>🥉 Kind 2 - 80 XP</li>
          </ol>
        </div>
      </div>

      <AppNav />
    </main>
  );
}