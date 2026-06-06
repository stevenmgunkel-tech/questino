import AppNav from "@/components/AppNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-bold text-center mb-2">🚀 Questino</h1>
        <p className="text-center text-gray-600 mb-8">
          Aufgaben werden Abenteuer
        </p>

        <div className="bg-white rounded-3xl p-6 shadow mb-4">
          <p className="text-gray-800">Willkommen zurück</p>
          <h2 className="text-2xl font-bold">Steven Familie</h2>

          <div className="mt-4">
            <p className="font-bold mb-2">⭐ Level 3 Held</p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-blue-600 h-4 rounded-full w-4/5"></div>
            </div>
            <p className="text-sm text-gray-800 mt-1">120 / 150 XP</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl">🔥</p>
            <p className="font-bold">3 Missionen</p>
            <p className="text-sm text-gray-800">heute offen</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-3xl">🛒</p>
            <p className="font-bold">4 Artikel</p>
            <p className="text-sm text-gray-800">auf Liste</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-xl font-bold mb-3">🎁 Nächste Belohnung</h2>
          <p className="text-lg">🍦 Eis essen</p>
          <p className="text-sm text-gray-800">noch 30 XP fehlen</p>
        </div>
      </div>

      <AppNav />
    </main>
  );
}