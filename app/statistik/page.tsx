"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type StatistikKarte = {
  titel: string;
  wert: number | string;
  text: string;
  icon: string;
  farbe: string;
};

export default function StatistikPage() {
  const [xp, setXp] = useState(0);
  const [besteStaerke, setBesteStaerke] = useState("Keine");
  const [besteStaerkePunkte, setBesteStaerkePunkte] = useState(0);
  const [zieleErreicht, setZieleErreicht] = useState(0);
  const [routinenErledigt, setRoutinenErledigt] = useState(0);
  const [missionenErledigt, setMissionenErledigt] = useState(0);

  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    ladeStatistik();
  }, []);

  async function ladeStatistik() {
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
      .select("id, xp")
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

    setXp(mitglied.xp || 0);

    const { data: staerken, error: staerkenError } = await supabase
      .from("mitglied_staerken")
      .select(
        `
        punkte,
        staerken (
          name
        )
      `
      )
      .eq("mitglied_id", mitglied.id);

    if (staerkenError) {
      console.error("Stärken Fehler:", staerkenError);
    }

    if (staerken && staerken.length > 0) {
      const sortiert = [...staerken].sort(
        (a: any, b: any) => b.punkte - a.punkte
      );

      const beste = sortiert[0] as any;

      setBesteStaerke(beste?.staerken?.name || "Keine");
      setBesteStaerkePunkte(beste?.punkte || 0);
    }

    const { count: zielCount, error: zielError } = await supabase
      .from("ziele")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitglied.id)
      .eq("status", "erreicht");

    if (zielError) {
      console.error("Ziele Fehler:", zielError);
    }

    setZieleErreicht(zielCount || 0);

    const { count: routineCount, error: routineError } = await supabase
      .from("routine_logs")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitglied.id);

    if (routineError) {
      console.error("Routinen Fehler:", routineError);
    }

    setRoutinenErledigt(routineCount || 0);

    const { count: missionCount, error: missionError } = await supabase
      .from("missionen")
      .select("*", { count: "exact", head: true })
      .eq("zugewiesen_an", mitglied.id)
      .eq("status", "erledigt");

    if (missionError) {
      console.error("Missionen Fehler:", missionError);
    }

    setMissionenErledigt(missionCount || 0);
    setLoading(false);
  }

  const gesamtAktionen =
    zieleErreicht + routinenErledigt + missionenErledigt;

  const karten: StatistikKarte[] = [
    {
      titel: "XP gesamt",
      wert: xp,
      text: "gesammelte persönliche Erfahrung",
      icon: "⚡",
      farbe: "bg-[#E7F0E4] text-[#2F5D43]",
    },
    {
      titel: "Ziele erreicht",
      wert: zieleErreicht,
      text: "abgeschlossene persönliche Ziele",
      icon: "🎯",
      farbe: "bg-[#F3EBDD] text-[#8A4D1F]",
    },
    {
      titel: "Routinen erledigt",
      wert: routinenErledigt,
      text: "kleine Gewohnheiten abgehakt",
      icon: "🔁",
      farbe: "bg-[#E8E4F2] text-[#564485]",
    },
    {
      titel: "Missionen erledigt",
      wert: missionenErledigt,
      text: "kleine Aufgaben abgeschlossen",
      icon: "🔥",
      farbe: "bg-[#F6EAD8] text-[#8A4D1F]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-4 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino Reise
                </p>

                <h1 className="mt-2 text-4xl font-black leading-none tracking-tight">
                  Statistik
                </h1>

                <p className="mt-2 max-w-[15rem] text-sm leading-5 text-[#F3E8D5]/75">
                  Deine Entwicklung als ruhiger Blick auf deine Reise.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                📊
              </div>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{xp}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  XP
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{gesamtAktionen}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Aktionen
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{besteStaerkePunkte}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Stärke
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Statistiken...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Statistik konnte nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                Stärkste Eigenschaft
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F0E4] text-xl">
                  🌱
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base font-black">
                    {besteStaerke}
                  </h2>

                  <p className="text-sm text-[#776B5B]">
                    wächst durch Missionen und Routinen
                  </p>
                </div>

                <div className="rounded-2xl bg-[#E7F0E4] px-3 py-2 text-sm font-black text-[#2F5D43]">
                  {besteStaerkePunkte}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-black">Reise in Zahlen</h2>
                <p className="text-sm text-[#776B5B]">
                  Was du bisher aufgebaut hast.
                </p>
              </div>

              <div className="space-y-3">
                {karten.map((karte) => (
                  <div
                    key={karte.titel}
                    className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${karte.farbe}`}
                      >
                        {karte.icon}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-black">
                          {karte.titel}
                        </p>
                        <p className="text-sm text-[#776B5B]">{karte.text}</p>
                      </div>

                      <p className="shrink-0 text-2xl font-black text-[#2F5D43]">
                        {karte.wert}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {gesamtAktionen === 0 && xp === 0 && (
              <div className="mt-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-3xl">🌱</p>
                <p className="mt-2 font-black text-[#182019]">
                  Deine Reise beginnt gerade.
                </p>
                <p className="mt-1 text-sm">
                  Erledige Missionen, Routinen oder Ziele, damit diese Seite
                  lebendig wird.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
