import AppNav from "@/components/AppNav";

export default function EinkaufslistePage() {
  const artikel = [
    {
      name: "Milch",
      menge: "2 Liter",
      kategorie: "Kühlung",
      status: "Offen",
      von: "Mama",
      icon: "🥛",
    },
    {
      name: "Brot",
      menge: "1 Stück",
      kategorie: "Bäckerei",
      status: "Offen",
      von: "Steven",
      icon: "🍞",
    },
    {
      name: "Schokolade",
      menge: "1 Tafel",
      kategorie: "Kinderwunsch",
      status: "Wartet",
      von: "Kind 1",
      icon: "🍫",
    },
    {
      name: "Eier",
      menge: "10 Stück",
      kategorie: "Kühlung",
      status: "Gekauft",
      von: "Mama",
      icon: "🥚",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 font-medium">Familie Gunkel</p>
            <h1 className="text-3xl font-black">Einkauf</h1>
            <p className="text-sm text-gray-500">
              Gemeinsame Liste für alle.
            </p>
          </div>

          <button className="bg-white px-4 py-2 rounded-2xl shadow font-bold text-sm">
            ➕ Artikel
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2rem] p-6 shadow-xl text-white mb-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80">Heute offen</p>
              <h2 className="text-2xl font-black">3 Artikel</h2>
            </div>
            <span className="text-4xl">🛒</span>
          </div>

          <p className="mt-4 text-sm text-white/80">
            1 Kinderwunsch wartet auf Freigabe.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow mb-5">
          <input
            placeholder="Artikel hinzufügen..."
            className="w-full bg-gray-100 rounded-2xl p-4 outline-none font-bold"
          />
        </div>

        <div className="space-y-4">
          {artikel.map((item) => {
            const gekauft = item.status === "Gekauft";
            const wartet = item.status === "Wartet";

            return (
              <div
                key={item.name}
                className={`bg-white rounded-[2rem] p-5 shadow ${
                  gekauft ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl">
                      {item.icon}
                    </div>

                    <div>
                      <h2
                        className={`text-xl font-black ${
                          gekauft ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {item.name}
                      </h2>

                      <p className="text-sm text-gray-500">
                        {item.menge} · {item.kategorie}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        hinzugefügt von {item.von}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      wartet
                        ? "bg-yellow-100 text-yellow-700"
                        : gekauft
                        ? "bg-gray-100 text-gray-500"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                {wartet ? (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="bg-green-500 text-white font-black py-3 rounded-2xl">
                      Genehmigen
                    </button>
                    <button className="bg-red-500 text-white font-black py-3 rounded-2xl">
                      Ablehnen
                    </button>
                  </div>
                ) : !gekauft ? (
                  <button className="mt-4 w-full bg-blue-600 text-white font-black py-3 rounded-2xl shadow">
                    Als gekauft markieren
                  </button>
                ) : (
                  <button className="mt-4 w-full bg-gray-200 text-gray-500 font-black py-3 rounded-2xl">
                    Erledigt
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AppNav />
    </main>
  );
}