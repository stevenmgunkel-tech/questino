import AppNav from "@/components/AppNav";

export default function KalenderPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">📅 Kalender</h1>
        <p className="text-gray-700 mb-6">
          Termine, Schule, Familie und wichtige Tage.
        </p>

        <div className="bg-white rounded-3xl p-6 shadow mb-4">
          <h2 className="text-xl font-bold mb-4">Heute</h2>

          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="font-bold">15:30 Zahnarzt</p>
              <p className="text-sm text-gray-600">Kind 1</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <p className="font-bold">18:00 Fußballtraining</p>
              <p className="text-sm text-gray-600">Kind 2</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Diese Woche</h2>

          <div className="space-y-3">
            <div className="border-l-4 border-green-500 pl-4">
              <p className="font-bold">Mi · Elternabend</p>
              <p className="text-sm text-gray-600">Schule</p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="font-bold">Sa · Familienausflug</p>
              <p className="text-sm text-gray-600">10:00 Uhr</p>
            </div>
          </div>
        </div>
      </div>

      <AppNav />
    </main>
  );
}