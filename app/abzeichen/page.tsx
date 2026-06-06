import AppNav from "@/components/AppNav";

export default function AbzeichenPage() {
  const badges = [
    {
      icon: "🧹",
      title: "Haushaltsheld",
      description: "10 Aufgaben erledigt",
    },
    {
      icon: "🔥",
      title: "Streak Meister",
      description: "7 Tage aktiv",
    },
    {
      icon: "📅",
      title: "Planungsprofi",
      description: "10 Termine erstellt",
    },
    {
      icon: "🛒",
      title: "Einkaufsmeister",
      description: "20 Artikel hinzugefügt",
    },
    {
      icon: "⭐",
      title: "XP Sammler",
      description: "500 XP erreicht",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          🏅 Abzeichen
        </h1>

        <p className="text-gray-700 mb-6">
          Sammle Erfolge und werde zum Familienhelden.
        </p>

        <div className="space-y-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="bg-white rounded-3xl p-5 shadow"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">
                  {badge.icon}
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {badge.title}
                  </h2>

                  <p className="text-gray-600">
                    {badge.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}