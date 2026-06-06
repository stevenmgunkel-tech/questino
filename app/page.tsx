import Link from "next/link";
import AppNav from "@/components/AppNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F6F7FB] px-5 pt-6 pb-32 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl text-white shadow-lg">
              🚀
            </div>

            <div>
              <p className="font-medium text-gray-500">Guten Tag 👋</p>
              <h1 className="text-3xl font-black leading-none">Questino</h1>
              <p className="mt-1 text-sm text-gray-500">Familie Gunkel</p>
            </div>
          </div>

          <Link
            href="/eltern"
            className="rounded-2xl bg-white px-4 py-2 text-sm font-black shadow"
          >
            👨 Eltern
          </Link>
        </div>

        <section className="relative mb-5 overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="font-medium text-white/75">Aktueller Rang</p>
                <h2 className="text-2xl font-black">Level 3 – Planer</h2>
                <p className="mt-1 text-sm text-white/70">
                  Du bist auf dem Weg zum Organisator.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/20 text-3xl">
                ⭐
              </div>
            </div>

            <div className="my-6 flex justify-center">
              <div className="relative h-44 w-44">
                <div
                  className="absolute inset-0 rounded-full shadow-inner"
                  style={{
                    background:
                      "conic-gradient(white 0deg 288deg, rgba(255,255,255,0.22) 288deg 360deg)",
                  }}
                />

                <div className="absolute inset-[15px] flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-inner">
                  <div className="text-center">
                    <p className="text-5xl font-black leading-none">120</p>
                    <p className="mt-1 font-black text-white/75">XP</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-2 flex justify-between text-sm text-white/80">
              <span>120 XP</span>
              <span>150 XP</span>
            </div>

            <div className="h-3 w-full rounded-full bg-white/25">
              <div className="h-3 w-4/5 rounded-full bg-white" />
            </div>

            <div className="mt-5 rounded-3xl bg-white/15 p-4">
              <p className="text-sm text-white/75">Nächstes Level</p>
              <p className="font-black">Organisator 🌱</p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-4 gap-3">
          {[
            { href: "/missionen", icon: "➕", label: "Mission" },
            { href: "/kalender", icon: "📅", label: "Termin" },
            { href: "/einkaufsliste", icon: "🛒", label: "Einkauf" },
            { href: "/belohnungen", icon: "🎁", label: "Reward" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center rounded-3xl bg-white p-4 shadow transition active:scale-95"
            >
              <span className="mb-2 text-2xl">{item.icon}</span>
              <span className="text-[11px] font-black text-gray-700">
                {item.label}
              </span>
            </Link>
          ))}
        </section>

        <section className="mb-5 grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="mb-2 text-3xl">🎯</p>
            <h2 className="font-black">Wochenziel</h2>
            <p className="mb-3 text-sm text-gray-500">14 / 20 Missionen</p>

            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-[70%] rounded-full bg-orange-500" />
            </div>

            <p className="mt-3 text-xs text-gray-500">🍕 Pizzaabend</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow">
            <p className="mb-2 text-3xl">🏕️</p>
            <h2 className="font-black">Familienziel</h2>
            <p className="mb-3 text-sm text-gray-500">620 / 1000 XP</p>

            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 w-3/5 rounded-full bg-green-500" />
            </div>

            <p className="mt-3 text-xs text-gray-500">🎢 Europa-Park</p>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-3 text-xl font-black">🌱 Verantwortung</h2>

          <p className="font-bold">Level 3 – Planer</p>
          <p className="mb-4 text-sm text-gray-500">
            Du darfst schon mitplanen und eigene Vorschläge machen.
          </p>

          <div className="space-y-2">
            <div className="rounded-2xl bg-green-50 p-3 text-sm font-black text-green-700">
              ✅ Einkaufswünsche vorschlagen
            </div>

            <div className="rounded-2xl bg-green-50 p-3 text-sm font-black text-green-700">
              ✅ Termine vorschlagen
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">📢 Aktivitäten</h2>

          <div className="space-y-4">
            {[
              {
                icon: "⭐",
                text: "Kind 1 erhielt 10 XP",
                time: "Heute · 09:15",
                color: "bg-blue-100",
              },
              {
                icon: "🛒",
                text: "Milch wurde hinzugefügt",
                time: "Heute · 08:40",
                color: "bg-green-100",
              },
              {
                icon: "📅",
                text: "Fußballtraining eingetragen",
                time: "Heute · 07:50",
                color: "bg-purple-100",
              },
            ].map((item) => (
              <div key={item.text} className="flex gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${item.color}`}
                >
                  {item.icon}
                </div>

                <div>
                  <p className="font-bold">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AppNav />
    </main>
  );
}