"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";
import { pruefeLevelUps } from "@/lib/level";

type ChronikEintrag = {
  id: string;
  datum: string;
  icon: string;
  titel: string;
  text: string;
  typ: "mission" | "routine" | "ziel" | "achievement" | "wert" | "level";
};

type Mitglied = {
  id: string;
  familie_id: string;
  name: string | null;
};

export default function ChronikPage() {
  const [mitglied, setMitglied] = useState<Mitglied | null>(null);
  const [eintraege, setEintraege] = useState<ChronikEintrag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ladeChronik();
  }, []);

  async function ladeChronik() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: aktuellesMitglied } = await supabase
      .from("mitglieder")
      .select("id, familie_id, name")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!aktuellesMitglied) {
      setLoading(false);
      return;
    }

    setMitglied(aktuellesMitglied);

    // Sicherheitscheck:
    // Speichert erreichte Level, bevor die Chronik geladen wird.
    await pruefeLevelUps(aktuellesMitglied.id);

    const gesammelt: ChronikEintrag[] = [];

    const { data: levelLogs } = await supabase
      .from("level_logs")
      .select("id, level, xp_erreicht, titel, icon, erreicht_am")
      .eq("mitglied_id", aktuellesMitglied.id)
      .order("erreicht_am", { ascending: false })
      .limit(40);

    for (const log of levelLogs || []) {
      gesammelt.push({
        id: `level-${log.id}`,
        datum: log.erreicht_am,
        icon: log.icon || "🌱",
        titel: `Level ${log.level} erreicht`,
        text: `${log.titel} · bei ${log.xp_erreicht} XP gespeichert`,
        typ: "level",
      });
    }

    const { data: missionen } = await supabase
      .from("missionen")
      .select("id, titel, status, erstellt_am")
      .eq("familie_id", aktuellesMitglied.familie_id)
      .eq("status", "erledigt")
      .order("erstellt_am", { ascending: false })
      .limit(40);

    for (const mission of missionen || []) {
      gesammelt.push({
        id: `mission-${mission.id}`,
        datum: mission.erstellt_am,
        icon: "🚀",
        titel: "Mission abgeschlossen",
        text: mission.titel || "Eine Mission wurde abgeschlossen.",
        typ: "mission",
      });
    }

    const { data: routineLogs } = await supabase
      .from("routine_logs")
      .select("id, created_at")
      .eq("mitglied_id", aktuellesMitglied.id)
      .order("created_at", { ascending: false })
      .limit(40);

    for (const log of routineLogs || []) {
      gesammelt.push({
        id: `routine-${log.id}`,
        datum: log.created_at,
        icon: "🔁",
        titel: "Routine erledigt",
        text: "Du bist deiner Routine treu geblieben.",
        typ: "routine",
      });
    }

    const { data: ziele } = await supabase
      .from("ziele")
      .select("id, titel, status, created_at")
      .eq("mitglied_id", aktuellesMitglied.id)
      .order("created_at", { ascending: false })
      .limit(40);

    for (const ziel of ziele || []) {
      gesammelt.push({
        id: `ziel-${ziel.id}`,
        datum: ziel.created_at,
        icon: ziel.status === "erreicht" ? "🏁" : "🎯",
        titel: ziel.status === "erreicht" ? "Ziel erreicht" : "Ziel gestartet",
        text: ziel.titel || "Ein Ziel wurde bewegt.",
        typ: "ziel",
      });
    }

    const { data: achievementRows, error: achievementError } = await supabase
      .from("mitglied_achievements")
      .select(
        `
        id,
        freigeschaltet_am,
        achievements (
          titel,
          icon,
          xp_bonus
        )
      `
      )
      .eq("mitglied_id", aktuellesMitglied.id)
      .order("freigeschaltet_am", { ascending: false })
      .limit(40);

    if (!achievementError) {
      for (const row of achievementRows || []) {
        const achievement = (row as any).achievements;
        const achievementObj = Array.isArray(achievement)
          ? achievement[0]
          : achievement;

        gesammelt.push({
          id: `achievement-${row.id}`,
          datum: row.freigeschaltet_am || new Date().toISOString(),
          icon: achievementObj?.icon || "🏅",
          titel: "Achievement freigeschaltet",
          text: achievementObj?.titel
            ? `${achievementObj.titel}${
                achievementObj.xp_bonus ? ` · +${achievementObj.xp_bonus} XP` : ""
              }`
            : "Ein neues Achievement wurde freigeschaltet.",
          typ: "achievement",
        });
      }
    }

    const { data: wertLogs } = await supabase
      .from("familienwert_logs")
      .select(
        `
        id,
        created_at,
        punkte,
        familien_werte (
          titel,
          icon
        )
      `
      )
      .eq("familie_id", aktuellesMitglied.familie_id)
      .order("created_at", { ascending: false })
      .limit(40);

    for (const log of wertLogs || []) {
      const wert = (log as any).familien_werte;
      const wertObj = Array.isArray(wert) ? wert[0] : wert;

      gesammelt.push({
        id: `wert-${log.id}`,
        datum: log.created_at,
        icon: wertObj?.icon || "❤️",
        titel: "Familienwert gelebt",
        text: `${wertObj?.titel || "Wert"} · +${log.punkte || 1} Punkte`,
        typ: "wert",
      });
    }

    const sortiert = gesammelt
      .filter((eintrag) => Boolean(eintrag.datum))
      .sort(
        (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
      )
      .slice(0, 100);

    setEintraege(sortiert);
    setLoading(false);
  }

  const ersterEintrag = useMemo(() => {
    if (eintraege.length === 0) return null;

    return [...eintraege].sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    )[0];
  }, [eintraege]);

  function formatiereDatum(datum: string) {
    return new Intl.DateTimeFormat("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(datum));
  }

  function formatiereZeit(datum: string) {
    return new Intl.DateTimeFormat("de-CH", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(datum));
  }

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-5 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino Reise
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight">
                  Chronik
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Deine Reise durch Missionen, Ziele, Routinen und Level-Ups.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner">
                📖
              </div>
            </div>
          </div>

          {!loading && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="col-span-2 rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-sm font-black">
                  {ersterEintrag ? formatiereDatum(ersterEintrag.datum) : "Heute"}
                </p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Start
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{eintraege.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Einträge
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Chronik...
          </div>
        )}

        {!loading && eintraege.length === 0 && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EFE6D8] text-3xl">
              🌱
            </div>

            <h2 className="text-xl font-black">Noch keine Reise sichtbar</h2>

            <p className="mt-2 text-sm text-[#776B5B]">
              Sobald Missionen, Routinen, Ziele, Familienwerte, Achievements
              oder Level-Ups entstehen, erscheint hier deine Chronik.
            </p>

            <Link
              href="/missionen"
              className="mt-5 block rounded-2xl bg-gray-900 p-3 text-center font-black text-[#FFF7EA]"
            >
              Erste Mission starten
            </Link>
          </div>
        )}

        {!loading && eintraege.length > 0 && (
          <section className="space-y-3">
            {eintraege.map((eintrag) => (
              <div
                key={eintrag.id}
                className={`rounded-3xl p-5 shadow-[0_10px_30px_rgba(54,42,25,0.06)] ${
                  eintrag.typ === "level"
                    ? "bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] text-[#FFF7EA]"
                    : "bg-[#FFF9EF]"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                      eintrag.typ === "level" ? "bg-[#FFF7EA]/15" : "bg-[#EFE6D8]"
                    }`}
                  >
                    {eintrag.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-black">{eintrag.titel}</h2>
                        <p
                          className={`mt-1 text-sm ${
                            eintrag.typ === "level"
                              ? "text-[#FFF7EA]/65"
                              : "text-[#776B5B]"
                          }`}
                        >
                          {eintrag.text}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`text-xs font-black ${
                            eintrag.typ === "level"
                              ? "text-[#FFF7EA]/45"
                              : "text-[#8C7655]"
                          }`}
                        >
                          {formatiereDatum(eintrag.datum)}
                        </p>
                        <p
                          className={`mt-1 text-[10px] font-bold ${
                            eintrag.typ === "level"
                              ? "text-[#FFF7EA]/35"
                              : "text-[#8C7655]"
                          }`}
                        >
                          {formatiereZeit(eintrag.datum)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      <AppNav />
    </main>
  );
}
