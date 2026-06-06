import AppNav from "@/components/AppNav";

export default function EinkaufslistePage() {
  const artikel = [
    { name: "Milch", gekauft: false },
    { name: "Brot", gekauft: false },
    { name: "Eier", gekauft: true },
    { name: "Hundefutter", gekauft: false },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">🛒 Einkaufsliste</h1>
        <p className="text-gray-700 mb-6">
          Gemeinsame Liste für die ganze Familie.
        </p>

        <div className="bg-white rounded-3xl p-5 shadow mb-4">
          <input
            placeholder="Artikel hinzufügen..."
            className="w-full border rounded-xl p-3"
          />
        </div>

        <div className="space-y-3">
          {artikel.map((item) => (
            <div
              key={item.name}
              className="bg-white rounded-2xl p-4 shadow flex justify-between items-center"
            >
              <span
                className={
                  item.gekauft
                    ? "line-through text-gray-400"
                    : "font-semibold"
                }
              >
                {item.name}
              </span>

              <button className="bg-green-500 text-white px-4 py-2 rounded-xl">
                ✓
              </button>
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}