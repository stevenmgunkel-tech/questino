"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Achievement = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
  typ: string | null;
  zielwert: number | null;
  xp_bonus: number | null;
};

type AchievementAnzeige = Achievement & {
  fortschritt: number;
  freigeschaltet: boolean;
};

type WertStat = {
  id: string;
  titel: string;
  icon: string | null;
  punkte: number;
};

type FortschrittStats = {
  missionen: number;
  xp: number;
  ziele: number;
  ziele_erreicht: number;
  routinen: number;
  familienwerte: number;
};

export default function ErfolgePage() {
  const [missionen, setMissionen] = useState(0);
  const [routinen, setRoutinen] = useState(0);
  const [werte, setWerte] = useState<WertStat[]>([]);
  const [achievements, setAchievements] = useState<AchievementAnzeige[]>([]);
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
      .select("id, familie_id, xp")
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

    const gesammelt: Record<string, WertStat> = {};

    for (const log of logs || []) {
      const wert = (log as any).familien_werte;
      const wertObj = Array.isArray(wert) ? wert[0] : wert;

      if (!wertObj) continue;

      if (!gesammelt[wertObj.id]) {
        gesammelt[wertObj.id] = {
          id: wertObj.id,
          titel: wertObj.titel,
          icon: wertObj.icon,
          punkte: 0,
        };
      }

      gesammelt[wertObj.id].punkte += (log as any).punkte || 0;
    }

    const sortierteWerte = Object.values(gesammelt).sort(
      (a, b) => b.punkte - a.punkte
    );

    setWerte(sortierteWerte);

    const stats = await ladeFortschrittStats(
      mitglied.id,
      mitglied.familie_id,
      mitglied.xp || 0
    );

    const { data: alleAchievements } = await supabase
      .from("achievements")
      .select("id, titel, beschreibung, icon, typ, zielwert, xp_bonus")
      .order("created_at", { ascending: true });

    const { data: meineAchievements } = await supabase
      .from("mitglied_achievements")
      .select("achievement_id")
      .eq("mitglied_id", mitglied.id);

    const unlockedIds = new Set(
      meineAchievements?.map((eintrag) => eintrag.achievement_id) || []
    );

    const achievementAnzeige = ((alleAchievements || []) as Achievement[])
      .map((achievement) => {
        const zielwert = achievement.zielwert || 1;
        const fortschritt = holeAchievementFortschritt(achievement, stats);

        return {
          ...achievement,
          zielwert,
          fortschritt,
          freigeschaltet: unlockedIds.has(achievement.id),
        };
      })
      .sort((a, b) => {
        if (a.freigeschaltet !== b.freigeschaltet) {
          return a.freigeschaltet ? -1 : 1;
        }

        return (a.zielwert || 1) - (b.zielwert || 1);
      });

    setAchievements(achievementAnzeige);
    setLoading(false);
  }

  async function ladeFortschrittStats(
    mitgliedId: string,
    familieId: string,
    xp: number
  ): Promise<FortschrittStats> {
    const { count: missionenCount } = await supabase
      .from("missionen")
      .select("*", { count: "exact", head: true })
      .eq("zugewiesen_an", mitgliedId)
      .eq("status", "erledigt");

    const { count: zieleCount } = await supabase
      .from("ziele")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitgliedId);

    const { count: zieleErreichtCount } = await supabase
      .from("ziele")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitgliedId)
      .eq("status", "erreicht");

    const { count: routinenCount } = await supabase
      .from("routine_logs")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitgliedId);

    const { count: familienwerteCount } = await supabase
      .from("familienwert_logs")
      .select("*", { count: "exact", head: true })
      .eq("familie_id", familieId);

    return {
      missionen: missionenCount || 0,
      xp,
      ziele: zieleCount || 0,
      ziele_erreicht: zieleErreichtCount || 0,
      routinen: routinenCount || 0,
      familienwerte: familienwerteCount || 0,
    };
  }

  function holeAchievementFortschritt(
    achievement: Achievement,
    stats: FortschrittStats
  ) {
    switch (achievement.typ) {
      case "missionen":
        return stats.missionen;

      case "xp":
        return stats.xp;

      case "ziele":
        return stats.ziele;

      case "ziele_erreicht":
        return stats.ziele_erreicht;

      case "routinen":
        return stats.routinen;

      case "familienwerte":
        return stats.familienwerte;

      default:
        return 0;
    }
  }

  function typLabel(typ: string | null) {
    switch (typ) {
      case "missionen":
        return "Missionen";

      case "xp":
        return "XP";

      case "ziele":
        return "Ziele";

      case "ziele_erreicht":
        return "Ziel erreicht";

      case "routinen":
        return "Routinen";

      case "familienwerte":
        return "Familienwerte";

      default:
        return "Questino";
    }
  }

  const staerksterWert = werte[0] || null;
  const freigeschalteteAchievements = achievements.filter(
    (achievement) => achievement.freigeschaltet
  );
  const offeneAchievements = achievements.filter(
    (achievement) => !achievement.freigeschaltet
  );

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

          {!loading && achievements.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-2 rounded-3xl bg-white/10 p-2 text-center">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-2xl font-black">
                  {freigeschalteteAchievements.length}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/55">
                  Frei
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-2xl font-black">{achievements.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/55">
                  Gesamt
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-2xl font-black">
                  {Math.round(
                    (freigeschalteteAchievements.length /
                      achievements.length) *
                      100
                  )}
                  %
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/55">
                  Reise
                </p>
              </div>
            </div>
          )}
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

              <Link
                href="/wochenrueckblick"
                className="mt-4 block rounded-2xl bg-gray-900 p-3 text-center font-black text-white"
              >
                Details ansehen
              </Link>
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
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">🏅 Achievements</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {freigeschalteteAchievements.length} von{" "}
                    {achievements.length} freigeschaltet
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                  {achievements.length > 0
                    ? Math.round(
                        (freigeschalteteAchievements.length /
                          achievements.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>

              <div className="mb-5 h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all"
                  style={{
                    width: `${
                      achievements.length > 0
                        ? Math.round(
                            (freigeschalteteAchievements.length /
                              achievements.length) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="space-y-3">
                {achievements.map((achievement) => {
                  const zielwert = achievement.zielwert || 1;
                  const progress = Math.min(
                    100,
                    Math.round((achievement.fortschritt / zielwert) * 100)
                  );

                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-2xl p-4 ${
                        achievement.freigeschaltet
                          ? "bg-emerald-50"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                            achievement.freigeschaltet
                              ? "bg-white"
                              : "bg-white opacity-70"
                          }`}
                        >
                          {achievement.freigeschaltet
                            ? achievement.icon || "🏆"
                            : "🔒"}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-black">
                                {achievement.titel}
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                {achievement.beschreibung ||
                                  "Noch keine Beschreibung"}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                                achievement.freigeschaltet
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {achievement.freigeschaltet ? "Frei" : typLabel(achievement.typ)}
                            </span>
                          </div>

                          <div className="mt-3">
                            <div className="mb-2 flex justify-between text-xs font-bold text-gray-500">
                              <span>
                                {Math.min(
                                  achievement.fortschritt,
                                  zielwert
                                )}{" "}
                                / {zielwert}
                              </span>
                              <span>{progress}%</span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  achievement.freigeschaltet
                                    ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                    : "bg-gradient-to-r from-slate-400 to-gray-500"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {(achievement.xp_bonus || 0) > 0 && (
                            <p className="mt-3 text-xs font-black text-emerald-700">
                              +{achievement.xp_bonus} Bonus XP
                            </p>
                          )}
                        </div>
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
