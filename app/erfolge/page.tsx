"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";
import {
  LEVEL_MEILENSTEINE,
  LevelLog,
  berechneLevelreise,
  pruefeLevelUps,
} from "@/lib/level";

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
  const [levelLogs, setLevelLogs] = useState<LevelLog[]>([]);
  const [aktuellesXp, setAktuellesXp] = useState(0);
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

    setAktuellesXp(mitglied.xp || 0);

    // Sicherheitscheck:
    // Speichert erreichte Level auch dann, wenn ein Level-Up direkt nach einer XP-Aktion
    // aus irgendeinem Grund nicht getriggert wurde.
    await pruefeLevelUps(mitglied.id);

    const { data: gespeicherteLevelLogs } = await supabase
      .from("level_logs")
      .select("id, mitglied_id, familie_id, level, xp_erreicht, titel, icon, erreicht_am")
      .eq("mitglied_id", mitglied.id)
      .order("level", { ascending: true });

    setLevelLogs((gespeicherteLevelLogs || []) as LevelLog[]);

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

  function formatiereDatum(datum: string) {
    return new Intl.DateTimeFormat("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(datum));
  }

  const staerksterWert = werte[0] || null;
  const freigeschalteteAchievements = achievements.filter(
    (achievement) => achievement.freigeschaltet
  );
  const levelreise = berechneLevelreise(aktuellesXp);
  const erreichteLevel = new Set(levelLogs.map((log) => log.level));

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="border-b border-[#E8DECF] bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-4 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino Reise
                </p>

                <h1 className="mt-2 text-4xl font-black leading-none tracking-tight">
                  Erfolge
                </h1>

                <p className="mt-2 max-w-[15rem] text-sm leading-5 text-[#F3E8D5]/75">
                  Deine kleinen Schritte werden zu sichtbarem Wachstum.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                Q
              </div>
            </div>
          </div>

          {!loading && achievements.length > 0 && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">
                  {freigeschalteteAchievements.length}
                </p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Frei
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{achievements.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Gesamt
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">
                  {Math.round(
                    (freigeschalteteAchievements.length /
                      achievements.length) *
                      100
                  )}
                  %
                </p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Reise
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Erfolge...
          </div>
        )}

        {!loading && (
          <>
            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Wochenrückblick</h2>
                  <p className="text-sm text-[#776B5B]">Was diese Woche gewachsen ist.</p>
                </div>

                <Link
                  href="/wochenrueckblick"
                  className="rounded-2xl bg-[#20362B] px-3 py-2 text-xs font-black text-[#FFF7EA]"
                >
                  Öffnen
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-[#F6EAD8] p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#B07437]">
                    Missionen
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#8A4D1F]">
                    {missionen}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#E8E4F2] p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6E5B9A]">
                    Routinen
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#564485]">
                    {routinen}
                  </p>
                </div>
              </div>
            </section>

            {staerksterWert && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Stärkster Wert
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
                </div>
              </section>
            )}

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Werte dieser Woche</h2>
                  <p className="text-sm text-[#776B5B]">
                    Was ihr gemeinsam gelebt habt.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F6EAD8] text-lg">
                  ❤️
                </div>
              </div>

              <div className="space-y-2">
                {werte.map((wert) => (
                  <div
                    key={wert.id}
                    className="flex items-center gap-3 rounded-2xl border border-[#E8DECF] bg-[#FBF4EA] p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF9EF] text-lg">
                      {wert.icon || "❤️"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">
                        {wert.titel}
                      </p>
                      <p className="text-xs text-[#776B5B]">
                        Diese Woche gelebt
                      </p>
                    </div>

                    <p className="text-base font-black text-[#3B714E]">
                      +{wert.punkte}
                    </p>
                  </div>
                ))}

                {werte.length === 0 && (
                  <div className="rounded-2xl bg-[#FBF4EA] p-4 text-center text-sm leading-6 text-[#776B5B]">
                    Noch keine Familienwerte gesammelt.
                  </div>
                )}
              </div>
            </section>

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Achievements</h2>
                  <p className="text-sm text-[#776B5B]">
                    {freigeschalteteAchievements.length} von{" "}
                    {achievements.length} freigeschaltet
                  </p>
                </div>

                <div className="rounded-2xl bg-[#E7F0E4] px-3 py-2 text-sm font-black text-[#2F5D43]">
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

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#E8DECF]">
                <div
                  className="h-2 rounded-full bg-[#4D8A5C] transition-all"
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

              <div className="space-y-2">
                {achievements.map((achievement) => {
                  const zielwert = achievement.zielwert || 1;
                  const progress = Math.min(
                    100,
                    Math.round((achievement.fortschritt / zielwert) * 100)
                  );

                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-2xl border p-3 ${
                        achievement.freigeschaltet
                          ? "border-[#CFE4D0] bg-[#EAF5E9]"
                          : "border-[#E8DECF] bg-[#FBF4EA]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                            achievement.freigeschaltet
                              ? "bg-[#FFF9EF]"
                              : "bg-[#EFE6D8] text-[#8C7655]"
                          }`}
                        >
                          {achievement.freigeschaltet
                            ? achievement.icon || "🏆"
                            : "🔒"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black">
                                {achievement.titel}
                              </p>

                              <p className="mt-0.5 text-xs leading-5 text-[#776B5B]">
                                {achievement.beschreibung ||
                                  "Noch keine Beschreibung"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                                achievement.freigeschaltet
                                  ? "bg-[#CFEAD3] text-[#2F6A44]"
                                  : "bg-[#E8DECF] text-[#7A6A54]"
                              }`}
                            >
                              {achievement.freigeschaltet
                                ? "Frei"
                                : typLabel(achievement.typ)}
                            </span>
                          </div>

                          <div className="mt-2">
                            <div className="mb-1 flex justify-between text-[11px] font-bold text-[#776B5B]">
                              <span>
                                {Math.min(
                                  achievement.fortschritt,
                                  zielwert
                                )}{" "}
                                / {zielwert}
                              </span>
                              <span>{progress}%</span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-[#E8DECF]">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  achievement.freigeschaltet
                                    ? "bg-[#4D8A5C]"
                                    : "bg-[#B7A98F]"
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {(achievement.xp_bonus || 0) > 0 && (
                            <p className="mt-2 text-[11px] font-black text-[#2F6A44]">
                              +{achievement.xp_bonus} Bonus XP
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {achievements.length === 0 && (
                  <div className="rounded-2xl bg-[#FBF4EA] p-4 text-center text-sm text-[#776B5B]">
                    Noch keine Achievements angelegt.
                  </div>
                )}
              </div>
            </section>

            <section className="mb-3">
              <Link
                href="/chronik"
                className="mb-3 flex items-center gap-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)] active:scale-[0.99]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#20362B] text-xl text-[#FFF7EA]">
                  📖
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-black">Chronik</h2>
                  <p className="text-sm text-[#776B5B]">
                    Deine Reise als Verlauf.
                  </p>
                </div>

                <div className="text-xl font-black text-[#B7A98F]">›</div>
              </Link>

              <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                      Levelreise
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Level {levelreise.aktuellerMeilenstein.level}
                    </h2>

                    <p className="mt-1 text-sm text-[#776B5B]">
                      {levelreise.aktuellerMeilenstein.titel}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F0E4] text-2xl">
                    {levelreise.aktuellerMeilenstein.icon}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[#FBF4EA] p-3">
                    <p className="text-lg font-black">{aktuellesXp}</p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#8C7655]">
                      XP
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FBF4EA] p-3">
                    <p className="text-lg font-black">
                      {levelreise.naechsterMeilenstein
                        ? levelreise.naechsterMeilenstein.level
                        : "Max"}
                    </p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#8C7655]">
                      Nächstes
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FBF4EA] p-3">
                    <p className="text-lg font-black">
                      {levelreise.naechsterMeilenstein
                        ? levelreise.xpBisNaechstesLevel
                        : 0}
                    </p>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#8C7655]">
                      Bis Level
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-bold text-[#776B5B]">
                    <span>{levelreise.progress}% geschafft</span>
                    <span>
                      {levelreise.naechsterMeilenstein
                        ? `${levelreise.naechsterMeilenstein.xp} XP`
                        : "Max Level"}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#E8DECF]">
                    <div
                      className="h-2 rounded-full bg-[#4D8A5C] transition-all"
                      style={{ width: `${levelreise.progress}%` }}
                    />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#776B5B]">
                  {levelreise.naechsterMeilenstein
                    ? `Noch ${levelreise.xpBisNaechstesLevel} XP bis „${levelreise.naechsterMeilenstein.titel}“.`
                    : "Du hast die aktuelle Levelreise komplett gemeistert."}
                </p>

                <div className="mt-4 space-y-2">
                  {LEVEL_MEILENSTEINE.map((meilenstein) => {
                    const log = levelLogs.find(
                      (eintrag) => eintrag.level === meilenstein.level
                    );
                    const erreicht = erreichteLevel.has(meilenstein.level);
                    const aktuell =
                      levelreise.aktuellerMeilenstein.level ===
                      meilenstein.level;

                    return (
                      <div
                        key={meilenstein.level}
                        className={`rounded-2xl border p-3 ${
                          erreicht
                            ? "border-[#CFE4D0] bg-[#EAF5E9]"
                            : aktuell
                            ? "border-[#D8C8AA] bg-[#FBF4EA]"
                            : "border-[#E8DECF] bg-[#FFF9EF]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                              erreicht ? "bg-[#FFF9EF]" : "bg-[#EFE6D8]"
                            }`}
                          >
                            {erreicht ? meilenstein.icon : "🔒"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-black">
                                Level {meilenstein.level} ·{" "}
                                {meilenstein.titel}
                              </p>

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                                  erreicht
                                    ? "bg-[#CFEAD3] text-[#2F6A44]"
                                    : "bg-[#E8DECF] text-[#7A6A54]"
                                }`}
                              >
                                {erreicht
                                  ? "OK"
                                  : `${meilenstein.xp} XP`}
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-5 text-[#776B5B]">
                              {meilenstein.text}
                            </p>

                            {log && (
                              <p className="mt-1 text-[11px] font-black text-[#2F6A44]">
                                Erreicht am {formatiereDatum(log.erreicht_am)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
