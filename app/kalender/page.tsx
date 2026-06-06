import AppNav from "@/components/AppNav";

export default function KalenderPage() {
  const termine = [
    {
      icon: "🦷",
      titel: "Zahnarzt",
      zeit: "15:30",
      person: "Kind 1",
      ort: "Frauenfeld",
      status: "Heute",
      farbe: "bg-blue-100 text-blue-700",
    },
    {
      icon: "⚽",
      titel: "Fußballtraining",
      zeit: "18:00",
      person: "Kind 2",
      ort: "Sportplatz",
      status: "Heute",
      farbe: "bg-green-100 text-green-700",
    },
    {
      icon: "🎂",
      titel: "Geburtstag Max",
      zeit: "Samstag",
      person: "Kind 1",
      ort: "Bei Max",
      status: "Vorschlag",
      farbe: "bg-yellow-100 text-yellow-700",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 font-medium">Diese Woche</p>
            <h1 className="text-3xl font-black">Kalender</h1>
            <p className="text-sm text-gray-500">
              Termine für die ganze Familie.
            </p>
          </div>

          <button className="bg-white px-4 py-2 rounded-2xl shadow font-bold text-sm">
            ➕ Termin
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-[2rem] p-6 shadow-xl text-white mb-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/80">Heute geplant</p>
              <h2 className="text-2xl font-black">2 Termine</h2>
            </div>
            <span className="text-4xl">📅</span>
          </div>

          <p className="mt-4 text-sm text-white/80">
            1 Termin-Vorschlag wartet auf Freigabe.
          </p>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-5">
          {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((tag, index) => (
            <div
              key={tag}
              className={`rounded-2xl p-3 text-center shadow font-black ${
                index === 2
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              <p className="text-xs">{tag}</p>
              <p>{index + 8}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {termine.map((termin) => {
            const vorschlag = termin.status === "Vorschlag";

            return (
              <div
                key={termin.titel}
                className="bg-white rounded-[2rem] p-5 shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl">
                      {termin.icon}
                    </div>

                    <div>
                      <h2 className="text-xl font-black">{termin.titel}</h2>
                      <p className="text-sm text-gray-500">
                        {termin.zeit} · {termin.person}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        📍 {termin.ort}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${termin.farbe}`}
                  >
                    {termin.status}
                  </span>
                </div>

                {vorschlag && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="bg-green-500 text-white font-black py-3 rounded-2xl">
                      Genehmigen
                    </button>
                    <button className="bg-red-500 text-white font-black py-3 rounded-2xl">
                      Ablehnen
                    </button>
                  </div>
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