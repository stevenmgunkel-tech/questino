import AppNav from "@/components/AppNav";

export default function ElternPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">👨‍👩‍👧 Eltern-Modus</h1>
        <div className="flex gap-3 mb-6">
  <a
    href="/"
    className="bg-blue-600 text-white px-4 py-2 rounded-2xl font-bold"
  >
    🧒 Kind-Modus
  </a>

  <a
    href="/eltern"
    className="bg-purple-600 text-white px-4 py-2 rounded-2xl font-bold"
  >
    👨 Eltern-Modus
  </a>
</div>
        <p className="text-gray-700 mb-6">
          Verwalte Missionen, Termine, Einkauf und Belohnungen.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl">🔥</p>
            <p className="font-bold text-gray-900">3 offen</p>
            <p className="text-sm text-gray-600">Missionen</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl">✅</p>
            <p className="font-bold text-gray-900">1 wartet</p>
            <p className="text-sm text-gray-600">Freigabe</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl">🛒</p>
            <p className="font-bold text-gray-900">4 Artikel</p>
            <p className="text-sm text-gray-600">Einkauf</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl">📅</p>
            <p className="font-bold text-gray-900">2 Termine</p>
            <p className="text-sm text-gray-600">Heute</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow mb-4">
  <h2 className="text-xl font-bold mb-4">✅ Wartet auf Freigabe</h2>

  <div className="border rounded-2xl p-4">
    <p className="text-3xl mb-2">🛏️</p>
    <h3 className="text-lg font-bold text-gray-900">
      Zimmer aufräumen
    </h3>
    <p className="text-sm text-gray-600 mb-3">
      Erledigt von Kind 1 · +10 XP
    </p>

    <div className="bg-gray-100 rounded-2xl p-4 mb-3 text-center text-gray-500">
      📸 Foto-Nachweis
    </div>

    <div className="grid grid-cols-2 gap-3">
      <button className="bg-green-500 text-white font-bold py-3 rounded-2xl">
        Genehmigen
      </button>

      <button className="bg-red-500 text-white font-bold py-3 rounded-2xl">
        Ablehnen
      </button>
    </div>
  </div>
</div>

        <div className="bg-white rounded-3xl p-5 shadow mb-4">
          <h2 className="text-xl font-bold mb-4">➕ Schnell erstellen</h2>

          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl">
              Neue Mission
            </button>

            <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl">
              Neuer Termin
            </button>

            <button className="w-full bg-green-600 text-white font-bold py-3 rounded-2xl">
              Einkauf hinzufügen
            </button>

            <button className="w-full bg-yellow-500 text-white font-bold py-3 rounded-2xl">
              Belohnung erstellen
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow">
          <h2 className="text-xl font-bold mb-3">🧒 Kinderübersicht</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Kind 1</span>
              <span className="font-bold text-blue-600">120 XP</span>
            </div>

            <div className="flex justify-between">
              <span>Kind 2</span>
              <span className="font-bold text-blue-600">80 XP</span>
            </div>
          </div>
        </div>
      </div>

      <AppNav />
    </main>
  );
}