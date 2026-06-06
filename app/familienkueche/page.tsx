import AppNav from "@/components/AppNav";

export default function FamilienkuechePage() {
  const vorschlaege = [
    {
      icon: "🍕",
      gericht: "Pizza",
      von: "Kind 1",
      tag: "Freitag",
      status: "Wartet",
      farbe: "bg-yellow-100 text-yellow-700",
    },
    {
      icon: "🍝",
      gericht: "Spaghetti Bolognese",
      von: "Kind 2",
      tag: "Mittwoch",
      status: "Geplant",
      farbe: "bg-green-100 text-green-700",
    },
    {
      icon: "🌮",
      gericht: "Tacos",
      von: "Steven",
      tag: "Samstag",
      status: "Idee",
      farbe: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl shadow">
              🍽️
            </div>

            <div>
              <p className="text-gray-500 font-medium">Familienküche</p>
              <h1 className="text-3xl font-black leading-none">Abendessen</h1>
              <p className="text-sm text-gray-500 mt-1">
                Vorschläge machen und gemeinsam planen.
              </p>
            </div>
          </div>

          <button className="bg-white px-4 py-2 rounded-2xl shadow font-black text-sm">
            ➕ Idee
          </button>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-[2.2rem] p-6 shadow-2xl text-white mb-5">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/15 rounded-full"></div>
          <div className="absolute -bottom-20 -left-16 w-48 h-48 bg-white/10 rounded-full"></div>

          <div className="relative">
            <p className="text-white/80 font-medium">Heute</p>
            <h2 className="text-3xl font-black">Was essen wir?</h2>
            <p className="text-white/80 text-sm mt-2">
              Kinder dürfen Vorschläge machen. Eltern planen das Menü.
            </p>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">💡</p>
                <p className="font-black mt-1">3</p>
                <p className="text-xs text-white/70">Ideen</p>
              </div>

              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">✅</p>
                <p className="font-black mt-1">1</p>
                <p className="text-xs text-white/70">geplant</p>
              </div>

              <div className="bg-white/15 rounded-3xl p-3">
                <p className="text-2xl">🧒</p>
                <p className="font-black mt-1">2</p>
                <p className="text-xs text-white/70">Kinderideen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow mb-5">
          <h2 className="text-xl font-black mb-4">🍽️ Wochenmenü</h2>

          <div className="space-y-3">
            {["Mo", "Di", "Mi", "Do", "Fr"].map((tag, index) => (
              <div
                key={tag}
                className="flex justify-between items-center bg-gray-50 rounded-2xl p-3"
              >
                <span className="font-black">{tag}</span>
                <span className="text-sm text-gray-600">
                  {index === 2
                    ? "🍝 Spaghetti"
                    : index === 4
                    ? "🍕 Pizza?"
                    : "Noch offen"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {vorschlaege.map((item) => (
            <div key={item.gericht} className="bg-white rounded-[2rem] p-5 shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-orange-100 flex items-center justify-center text-3xl">
                    {item.icon}
                  </div>

                  <div>
                    <h2 className="text-xl font-black">{item.gericht}</h2>
                    <p className="text-sm text-gray-500">
                      vorgeschlagen von {item.von}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Wunsch für {item.tag}
                    </p>
                  </div>
                </div>

                <span className={`text-xs px-3 py-1 rounded-full font-black ${item.farbe}`}>
                  {item.status}
                </span>
              </div>

              {item.status === "Wartet" && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="bg-green-500 text-white font-black py-3 rounded-2xl">
                    Planen
                  </button>

                  <button className="bg-gray-200 text-gray-600 font-black py-3 rounded-2xl">
                    Ablehnen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}