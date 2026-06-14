"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Achievement = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
};

type WertStat = {
  id: string;
  titel: string;
  icon: string | null;
  punkte: number;
};

export default function ErfolgePage() {
  const [missionen, setMissionen] = useState(0);
  const [routinen, setRoutinen] = useState(0);
  const [werte, setWerte] = useState<WertStat[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ladeErfolge();
  }, []);

  async function ladeErfolge() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("id, familie_id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) {
      setLoading(false);
      return;
    }

    const heute = new Date();
    const start = new Date(heute);
    start.setDate(heute.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const startISO = start.toISOString();

    const { count: missionCount } = await supabase
      .from("missionen")
      .select("*", { count: "exact", head: true })
      .eq("familie_id", mitglied.familie_id)
      .eq("status", "erledigt")
      .gte("erstellt_am", startISO);

    setMissionen(missionCount || 0);

    const { count: routineCount } = await supabase
      .from("routine_logs")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitglied.id)
      .gte("created_at", startISO);

    setRoutinen(routineCount || 0);

    const { data: logs } = await supabase
      .from("familienwert_logs")
      .select(`
        punkte,
        familien_werte (
          id,
          titel,
          icon
        )
      `)
      .eq("familie_id", mitglied.familie_id)
      .gte("created_at", startISO);

    const gesammelt: Record<string, WertStat> = {};

    for (const log of logs || []) {
      const wert = (log as any).familien_werte;
      if (!wert) continue;

      if (!gesammelt[wert.id]) {
        gesammelt[wert.id] = {
          id: wert.id,
          titel: wert.titel,
          icon: wert.icon,
          punkte: 0,
        };
      }

      gesammelt[wert.id].punkte += (log as any).punkte || 0;
    }

    const sortierteWerte = Object.values(gesammelt).sort(
      (a, b) => b.punkte - a.punkte
    );

    setWerte(sortierteWerte);

    const { data: alleAchievements } = await supabase
      .from("achievements")
      .select("id, titel, beschreibung, icon")
      .order("created_at", { ascending: true });

    setAchievements(alleAchievements || []);

    const { data: meineAchievements } = await supabase
      .from("mitglied_achievements")
      .select("achievement_id")
      .eq("mitglied_id", mitglied.id);

    setUnlockedIds(
      meineAchievements?.map((eintrag) => eintrag.achievement_id) || []
    );

    setLoading(false);
  }

  const staerksterWert = werte[0] || null;

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black">
            Q
          </div>

          <h1 className="text-3xl font-black">Erfolge</h1>

          <p className="mt-2 text-sm text-white/70">
            Schau, wie weit du bereits gekommen bist.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
            Lade Erfolge...
          </div>
        )}

        {!loading && (
          <>
            <section className="mb-5 rounded-3xl bg-white p-5 shadow">
              <h2 className="mb-4 text-xl font-black">📈 Wochenrückblick</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Missionen</p>
                  <p className="mt-2 text-4xl font-black text-orange-600">
                    {missionen}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Routinen</p>
                  <p className="mt-2 text-4xl font-black text-purple-600">
                    {routinen}
                  </p>
                </div>
              </div>
            </section>

            {staerksterWert && (
              <section className="mb-5 rounded-3xl bg-white p-5 shadow">
                <p className="text-sm font-bold text-gray-500">
                  🏆 Stärkster Wert diese Woche
                </p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                    {staerksterWert.icon || "❤️"}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-xl font-black">
                      {staerksterWert.titel}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {staerksterWert.punkte} Punkte in den letzten 7 Tagen
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="mb-5 rounded-3xl bg-white p-5 shadow">
              <h2 className="mb-4 text-xl font-black">❤️ Werte dieser Woche</h2>

              <div className="space-y-3">
                {werte.map((wert) => (
                  <div
                    key={wert.id}
                    className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">
                      {wert.icon || "❤️"}
                    </div>

                    <div className="flex-1">
                      <p className="font-black">{wert.titel}</p>
                      <p className="text-sm text-gray-500">
                        Diese Woche gelebt
                      </p>
                    </div>

                    <p className="text-2xl font-black text-emerald-700">
                      +{wert.punkte}
                    </p>
                  </div>
                ))}

                {werte.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 p-4 text-center text-gray-500">
                    Diese Woche wurden noch keine Familienwerte gesammelt.
                  </div>
                )}
              </div>
            </section>

            <section className="mb-5 rounded-3xl bg-white p-5 shadow">
              <h2 className="mb-4 text-xl font-black">🏅 Achievements</h2>

              <div className="space-y-3">
                {achievements.map((achievement) => {
                  const unlocked = unlockedIds.includes(achievement.id);

                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center gap-4 rounded-2xl p-4 ${
                        unlocked ? "bg-gray-50" : "bg-gray-50 opacity-50"
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl">
                        {unlocked ? achievement.icon || "🏆" : "🔒"}
                      </div>

                      <div className="flex-1">
                        <p className="font-black">{achievement.titel}</p>

                        <p className="text-sm text-gray-500">
                          {achievement.beschreibung ||
                            "Noch keine Beschreibung"}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {achievements.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 p-4 text-center text-gray-500">
                    Noch keine Achievements angelegt.
                  </div>
                )}
              </div>
            </section>

            <section className="mb-5 rounded-3xl bg-white p-5 shadow">
              <h2 className="mb-2 text-xl font-black">🚀 Levelreise</h2>
              <p className="text-sm text-gray-500">
                Bald siehst du hier deine wichtigsten Level-Meilensteine.
              </p>
            </section>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}