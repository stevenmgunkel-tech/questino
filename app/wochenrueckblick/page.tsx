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
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    ladeRueckblick();
  }, []);

  async function ladeRueckblick() {
    setLoading(true);
    setFehler("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setFehler("Du bist nicht eingeloggt.");
      setLoading(false);
      return;
    }

    const { data: mitglied, error: mitgliedError } = await supabase
      .from("mitglieder")
      .select("id, familie_id")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();

    if (mitgliedError) {
      setFehler(mitgliedError.message);
      setLoading(false);
      return;
    }

    if (!mitglied) {
      setFehler(
        "Dein Login ist noch mit keinem Familienmitglied verbunden. Bitte prüfe Familie/Login."
      );
      setLoading(false);
      return;
    }

    const heute = new Date();
    const start = new Date(heute);
    start.setDate(heute.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const startISO = start.toISOString();

    const { count: missionCount, error: missionError } = await supabase
      .from("missionen")
      .select("*", { count: "exact", head: true })
      .eq("familie_id", mitglied.familie_id)
      .eq("status", "erledigt")
      .gte("erstellt_am", startISO);

    if (missionError) {
      console.error("Missionen Fehler:", missionError);
    }

    setMissionen(missionCount || 0);

    const { count: routineCount, error: routineError } = await supabase
      .from("routine_logs")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitglied.id)
      .gte("created_at", startISO);

    if (routineError) {
      console.error("Routinen Fehler:", routineError);
    }

    setRoutinen(routineCount || 0);

    const { data: logs, error: logsError } = await supabase
      .from("familienwert_logs")
      .select(
        `
        punkte,
        familien_werte (
          id,
          titel,
          icon
        )
      `
      )
      .eq("familie_id", mitglied.familie_id)
      .gte("created_at", startISO);

    if (logsError) {
      console.error("Familienwert Logs Fehler:", logsError);
      setFehler(logsError.message);
      setLoading(false);
      return;
    }

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
  const gesamtWertePunkte = werte.reduce(
    (sum, wert) => sum + (wert.punkte || 0),
    0
  );
  const maxPunkte = Math.max(...werte.map((wert) => wert.punkte), 1);

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-4 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino Rückblick
                </p>

                <h1 className="mt-2 text-4xl font-black leading-none tracking-tight">
                  Woche
                </h1>

                <p className="mt-2 max-w-[15rem] text-sm leading-5 text-[#F3E8D5]/75">
                  Was ihr in den letzten 7 Tagen gelebt habt.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                📖
              </div>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F6EAD8] p-3 text-[#8A4D1F]">
                <p className="text-xl font-black">{missionen}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#B07437]">
                  Missionen
                </p>
              </div>

              <div className="rounded-2xl bg-[#E8E4F2] p-3 text-[#564485]">
                <p className="text-xl font-black">{routinen}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#6E5B9A]">
                  Routinen
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{gesamtWertePunkte}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Werte
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Wochenrückblick...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Wochenrückblick konnte nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            {staerksterWert && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Stärkster Wert diese Woche
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                    {staerksterWert.icon || "❤️"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-black">
                      {staerksterWert.titel}
                    </h2>

                    <p className="text-sm text-[#776B5B]">
                      {staerksterWert.punkte} Punkte in den letzten 7 Tagen
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#E7F0E4] px-3 py-2 text-sm font-black text-[#2F5D43]">
                    +{staerksterWert.punkte}
                  </div>
                </div>
              </section>
            )}

            <section className="mb-3 grid grid-cols-2 gap-3">
              <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6EAD8] text-xl">
                  🔥
                </div>

                <p className="text-3xl font-black text-[#8A4D1F]">
                  {missionen}
                </p>
                <p className="mt-1 text-sm font-black">Missionen</p>
                <p className="text-xs text-[#776B5B]">erledigt</p>
              </div>

              <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8E4F2] text-xl">
                  🔁
                </div>

                <p className="text-3xl font-black text-[#564485]">
                  {routinen}
                </p>
                <p className="mt-1 text-sm font-black">Routinen</p>
                <p className="text-xs text-[#776B5B]">abgehakt</p>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-black">Werte dieser Woche</h2>
                <p className="text-sm text-[#776B5B]">
                  Welche Familienwerte ihr sichtbar gelebt habt.
                </p>
              </div>

              <div className="space-y-3">
                {werte.map((wert) => {
                  const progress = Math.min(
                    100,
                    Math.round((wert.punkte / maxPunkte) * 100)
                  );

                  return (
                    <div
                      key={wert.id}
                      className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                          {wert.icon || "❤️"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="truncate text-base font-black">
                                {wert.titel}
                              </h2>

                              <p className="text-sm text-[#776B5B]">
                                diese Woche gelebt
                              </p>
                            </div>

                            <div className="shrink-0 rounded-2xl bg-[#E7F0E4] px-3 py-2 text-sm font-black text-[#2F5D43]">
                              +{wert.punkte}
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="mb-1 flex justify-between text-[11px] font-bold text-[#776B5B]">
                              <span>{wert.punkte} Punkte</span>
                              <span>{progress}%</span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#E8DECF]">
                              <div
                                className="h-2 rounded-full bg-[#4D8A5C] transition-all"
                                style={{
                                  width: `${progress}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {werte.length === 0 && (
                  <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                    <p className="text-3xl">❤️</p>
                    <p className="mt-2 font-black text-[#182019]">
                      Diese Woche wurden noch keine Familienwerte gesammelt.
                    </p>
                    <p className="mt-1 text-sm">
                      Erledigte Missionen mit Familienwerten füllen diesen Rückblick.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
