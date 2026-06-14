"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type WertStat = {
  id: string;
  titel: string;
  icon: string | null;
  punkte: number;
};

export default function WochenrueckblickPage() {
  const [werte, setWerte] = useState<WertStat[]>([]);
  const [missionen, setMissionen] = useState(0);
  const [routinen, setRoutinen] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ladeRueckblick();
  }, []);

  async function ladeRueckblick() {
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

    const sortiert = Object.values(gesammelt).sort(
      (a, b) => b.punkte - a.punkte
    );

    setWerte(sortiert);
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

          <h1 className="text-3xl font-black">Wochenrückblick</h1>

          <p className="mt-2 text-sm text-white/70">
            Was ihr in den letzten 7 Tagen gelebt habt.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
            Lade Wochenrückblick...
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white p-5 shadow">
                <p className="text-sm font-bold text-gray-500">
                  🔥 Missionen
                </p>
                <p className="mt-2 text-4xl font-black text-orange-600">
                  {missionen}
                </p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow">
                <p className="text-sm font-bold text-gray-500">
                  🔁 Routinen
                </p>
                <p className="mt-2 text-4xl font-black text-purple-600">
                  {routinen}
                </p>
              </div>
            </div>

            {staerksterWert && (
              <div className="mb-5 rounded-3xl bg-white p-5 shadow">
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
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-xl font-black">📊 Werte dieser Woche</h2>
              <p className="text-sm text-gray-500">
                Welche Familienwerte ihr sichtbar gelebt habt.
              </p>
            </div>

            <div className="space-y-4">
              {werte.map((wert) => (
                <div key={wert.id} className="rounded-3xl bg-white p-5 shadow">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                      {wert.icon || "❤️"}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-lg font-black">{wert.titel}</h2>

                      <div className="mt-3 h-3 w-full rounded-full bg-gray-200">
                        <div
                          className="h-3 rounded-full bg-emerald-700"
                          style={{
                            width: `${Math.min(100, wert.punkte * 20)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <p className="text-2xl font-black text-emerald-700">
                      +{wert.punkte}
                    </p>
                  </div>
                </div>
              ))}

              {werte.length === 0 && (
                <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
                  Diese Woche wurden noch keine Familienwerte gesammelt.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}