import AppNav from "@/components/AppNav";

export default function BelohnungenPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-2">🎁 Belohnungen</h1>

        <div className="space-y-4">

          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="text-xl font-bold">🍦 Eis essen</h2>
            <p>50 XP</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="text-xl font-bold">🎬 Kino</h2>
            <p>200 XP</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <h2 className="text-xl font-bold">🎮 1 Stunde extra Gaming</h2>
            <p>150 XP</p>
          </div>

        </div>
      </div>

      <AppNav />
    </main>
  );
}