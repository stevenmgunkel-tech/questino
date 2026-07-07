"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Mitglied = {
  id: string;
  name: string;
  rolle: string;
  xp: number;
  level: number;
  familie_id: string;
};

type Familie = {
  id: string;
  name: string;
  familien_code: string;
};

type BesteStaerke = {
  name: string;
  punkte: number;
};

type NaechsteBelohnung = {
  titel: string;
  kosten: number;
};

type HauptZiel = {
  titel: string;
  ziel_wert: number;
  aktueller_wert: number;
};

type Impuls = {
  text: string;
  kategorie: string | null;
};

function berechneLevel(xp: number) {
  if (xp >= 1000)
    return {
      level: 5,
      name: "Meister",
      aktuellesLevelXP: 1000,
      naechstesLevelXP: 1000,
    };

  if (xp >= 500)
    return {
      level: 4,
      name: "Organisator",
      aktuellesLevelXP: 500,
      naechstesLevelXP: 1000,
    };

  if (xp >= 250)
    return {
      level: 3,
      name: "Planer",
      aktuellesLevelXP: 250,
      naechstesLevelXP: 500,
    };

  if (xp >= 100)
    return {
      level: 2,
      name: "Starter",
      aktuellesLevelXP: 100,
      naechstesLevelXP: 250,
    };

  return {
    level: 1,
    name: "Entdecker",
    aktuellesLevelXP: 0,
    naechstesLevelXP: 100,
  };
}

function heutigesDatum() {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, "0");
  const tag = String(heute.getDate()).padStart(2, "0");

  return `${jahr}-${monat}-${tag}`;
}

export default function Home() {
  const router = useRouter();

  const [mitglied, setMitglied] = useState<Mitglied | null>(null);
  const [familie, setFamilie] = useState<Familie | null>(null);
  const [offeneMissionen, setOffeneMissionen] = useState(0);
  const [offeneRoutinen, setOffeneRoutinen] = useState(0);
  const [letzteAktivitaet, setLetzteAktivitaet] = useState("");
  const [besteStaerke, setBesteStaerke] = useState<BesteStaerke | null>(null);
  const [hauptZiel, setHauptZiel] = useState<HauptZiel | null>(null);
  const [familienXP, setFamilienXP] = useState(0);
  const [naechsteBelohnung, setNaechsteBelohnung] =
    useState<NaechsteBelohnung | null>(null);
  const [staerksterFamilienwert, setStaerksterFamilienwert] =
    useState<any>(null);
  const [impuls, setImpuls] = useState<Impuls | null>(null);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setFehler("");

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.push("/login");
        return;
      }

      const { data: impulsData } = await supabase
        .from("impulse")
        .select("text, kategorie")
        .eq("aktiv", true);

      if (impulsData && impulsData.length > 0) {
        const zufall = Math.floor(Math.random() * impulsData.length);
        setImpuls(impulsData[zufall]);
      }

      const { data: mitgliedData, error: mitgliedError } = await supabase
        .from("mitglieder")
        .select("*")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();

      if (mitgliedError) {
        setFehler(mitgliedError.message);
        setLoading(false);
        return;
      }

      if (!mitgliedData) {
        setFehler(
          "Dein Login ist noch mit keinem Familienmitglied verbunden. Bitte prüfe Familie/Login."
        );
        setLoading(false);
        return;
      }

      setMitglied(mitgliedData);

      const { data: familieData, error: familieError } = await supabase
        .from("familien")
        .select("*")
        .eq("id", mitgliedData.familie_id)
        .maybeSingle();

      if (familieError) {
        setFehler(familieError.message);
        setLoading(false);
        return;
      }

      setFamilie(familieData || null);

      const { data: familienXPData } = await supabase
        .from("familien_xp")
        .select("*")
        .eq("familie_id", mitgliedData.familie_id)
        .maybeSingle();

      const aktuelleFamilienXP = familienXPData?.xp || 0;
      setFamilienXP(aktuelleFamilienXP);

      const { count: missionCount } = await supabase
        .from("missionen")
        .select("*", { count: "exact", head: true })
        .eq("familie_id", mitgliedData.familie_id)
        .eq("status", "offen");

      setOffeneMissionen(missionCount || 0);

      const { data: routinenData } = await supabase
        .from("routinen")
        .select("id")
        .eq("mitglied_id", mitgliedData.id)
        .eq("aktiv", true);

      const heute = heutigesDatum();

      const { data: logsHeute } = await supabase
        .from("routine_logs")
        .select("routine_id")
        .eq("mitglied_id", mitgliedData.id)
        .eq("datum", heute);

      const erledigteIds = logsHeute?.map((log) => log.routine_id) || [];
      const offeneRoutineCount =
        routinenData?.filter((routine) => !erledigteIds.includes(routine.id))
          .length || 0;

      setOffeneRoutinen(offeneRoutineCount);

      const { data: feedData } = await supabase
        .from("feed")
        .select("*")
        .eq("familie_id", mitgliedData.familie_id)
        .order("erstellt_am", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLetzteAktivitaet(feedData?.text || "");

      const { data: staerkenData } = await supabase
        .from("mitglied_staerken")
        .select(
          `
          punkte,
          staerken (
            name
          )
        `
        )
        .eq("mitglied_id", mitgliedData.id)
        .order("punkte", { ascending: false })
        .limit(1);

      const staerke = staerkenData?.[0] as any;

      if (staerke) {
        setBesteStaerke({
          name: staerke.staerken?.name || "Unbekannt",
          punkte: staerke.punkte || 0,
        });
      }

      const { data: zielData } = await supabase
        .from("ziele")
        .select("titel, ziel_wert, aktueller_wert")
        .eq("mitglied_id", mitgliedData.id)
        .eq("status", "aktiv")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (zielData) {
        setHauptZiel(zielData);
      }

      const { data: belohnungData } = await supabase
        .from("belohnungen")
        .select("*")
        .eq("familie_id", mitgliedData.familie_id)
        .gte("kosten", aktuelleFamilienXP)
        .order("kosten", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (belohnungData) {
        setNaechsteBelohnung({
          titel: belohnungData.titel,
          kosten: belohnungData.kosten,
        });
      }

      const { data: werteData } = await supabase
        .from("familien_werte")
        .select("*")
        .eq("familie_id", mitgliedData.familie_id);

      const { data: punkteData } = await supabase
        .from("familienwert_punkte")
        .select("familienwert_id, punkte")
        .eq("familie_id", mitgliedData.familie_id);

      const ranking =
        werteData?.map((wert) => {
          const punkteEintrag = punkteData?.find(
            (p) => p.familienwert_id === wert.id
          );

          return {
            ...wert,
            punkte: punkteEintrag?.punkte || 0,
          };
        }) || [];

      ranking.sort((a, b) => b.punkte - a.punkte);

      setStaerksterFamilienwert(ranking[0] || null);
      setLoading(false);
    }

    loadData();
  }, [router]);

  const xp = mitglied?.xp ?? 0;
  const levelInfo = berechneLevel(xp);

  const fortschritt =
    levelInfo.naechstesLevelXP === levelInfo.aktuellesLevelXP
      ? 100
      : Math.min(
          100,
          Math.round(
            ((xp - levelInfo.aktuellesLevelXP) /
              (levelInfo.naechstesLevelXP - levelInfo.aktuellesLevelXP)) *
              100
          )
        );

  const zielFortschritt = hauptZiel
    ? Math.min(
        100,
        Math.round(
          (Number(hauptZiel.aktueller_wert) / Number(hauptZiel.ziel_wert)) * 100
        )
      )
    : 0;

  const familienZielKosten = naechsteBelohnung?.kosten || 100;
  const familienFortschritt = Math.min(
    100,
    Math.round((familienXP / familienZielKosten) * 100)
  );

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-32 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-4 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  {familie?.name || "Questino Familie"}
                </p>

                <h1 className="mt-2 text-4xl font-black leading-none tracking-tight">
                  Hallo {mitglied?.name || ""}
                </h1>

                <p className="mt-2 max-w-[15rem] text-sm leading-5 text-[#F3E8D5]/75">
                  Denk nach. Wachse. Entwickle dich.
                </p>
              </div>

              <Link
                href="/familie"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner active:scale-95"
              >
                Q
              </Link>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">L{levelInfo.level}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Level
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{xp}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  XP
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{familienXP}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Familie
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Questino...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Dashboard konnte nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Impuls des Tages
                </p>

                <p className="rounded-full bg-[#F3EBDD] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  {impuls?.kategorie || "Questino"}
                </p>
              </div>

              <p className="text-lg font-black leading-snug">
                {impuls?.text || "Denk nach. Wachse. Entwickle dich."}
              </p>
            </section>

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                    Aktueller Rang
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Level {levelInfo.level} · {levelInfo.name}
                  </h2>

                  <p className="mt-1 text-sm text-[#776B5B]">
                    {levelInfo.level >= 5
                      ? "Maximales Level erreicht."
                      : `${levelInfo.naechstesLevelXP - xp} XP fehlen bis zum nächsten Level.`}
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E4] text-xl font-black text-[#2F5D43]">
                  {fortschritt}%
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs font-bold text-[#776B5B]">
                  <span>{xp} XP</span>
                  <span>
                    {levelInfo.level >= 5 ? "MAX" : `${levelInfo.naechstesLevelXP} XP`}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#E8DECF]">
                  <div
                    className="h-2 rounded-full bg-[#4D8A5C] transition-all"
                    style={{ width: `${fortschritt}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="mb-3 grid grid-cols-2 gap-3">
              <Link
                href="/missionen"
                className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)] active:scale-[0.99]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F6EAD8] text-xl">
                  🔥
                </div>

                <p className="text-3xl font-black text-[#8A4D1F]">
                  {offeneMissionen}
                </p>
                <p className="mt-1 text-sm font-black">Missionen</p>
                <p className="text-xs text-[#776B5B]">noch offen</p>
              </Link>

              <Link
                href="/routinen"
                className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)] active:scale-[0.99]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8E4F2] text-xl">
                  🔁
                </div>

                <p className="text-3xl font-black text-[#564485]">
                  {offeneRoutinen}
                </p>
                <p className="mt-1 text-sm font-black">Routinen</p>
                <p className="text-xs text-[#776B5B]">heute offen</p>
              </Link>
            </section>

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Letzte Aktivität</h2>
                  <p className="text-sm text-[#776B5B]">
                    Was zuletzt passiert ist.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F3EBDD] text-lg">
                  📖
                </div>
              </div>

              <p className="rounded-2xl bg-[#FBF4EA] p-3 text-sm leading-6 text-[#776B5B]">
                {letzteAktivitaet || "Noch keine Aktivität"}
              </p>
            </section>

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Deine stärkste Eigenschaft</h2>
                  <p className="text-sm text-[#776B5B]">
                    wächst durch Missionen und Routinen.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E7F0E4] text-xl">
                  🌱
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8DECF] bg-[#FBF4EA] p-3">
                <div className="min-w-0">
                  <p className="truncate font-black">
                    {besteStaerke?.name ?? "Noch keine Stärke"}
                  </p>
                  <p className="text-sm text-[#776B5B]">
                    persönliche Wachstumsrichtung
                  </p>
                </div>

                <p className="shrink-0 text-2xl font-black text-[#2F6A44]">
                  {besteStaerke?.punkte ?? 0}
                </p>
              </div>
            </section>

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Aktuelles Ziel</h2>
                  <p className="text-sm text-[#776B5B]">
                    dein nächster persönlicher Schritt.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                  🎯
                </div>
              </div>

              {hauptZiel ? (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-black">{hauptZiel.titel}</p>
                      <p className="text-sm text-[#776B5B]">
                        {hauptZiel.aktueller_wert} / {hauptZiel.ziel_wert}
                      </p>
                    </div>

                    <p className="text-xl font-black text-[#2F5D43]">
                      {zielFortschritt}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8DECF]">
                    <div
                      className="h-2 rounded-full bg-[#4D8A5C] transition-all"
                      style={{ width: `${zielFortschritt}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl bg-[#FBF4EA] p-3 text-sm text-[#776B5B]">
                  Noch kein aktives Ziel. Erstelle dein erstes Ziel.
                </div>
              )}
            </section>

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black">Familienmoment</h2>
                  <p className="text-sm text-[#776B5B]">
                    XP werden zu gemeinsamen Erlebnissen.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                  🎁
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black">
                    {naechsteBelohnung?.titel || "Nächste Belohnung"}
                  </p>
                  <p className="text-sm text-[#776B5B]">
                    {familienXP} / {familienZielKosten} XP
                  </p>
                </div>

                <p className="text-xl font-black text-[#2F6A44]">
                  {familienFortschritt}%
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E8DECF]">
                <div
                  className="h-2 rounded-full bg-[#4D8A5C] transition-all"
                  style={{ width: `${familienFortschritt}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-[#776B5B]">
                {naechsteBelohnung
                  ? `${Math.max(
                      naechsteBelohnung.kosten - familienXP,
                      0
                    )} XP fehlen noch`
                  : "Noch keine Belohnung angelegt"}
              </p>
            </section>

            {staerksterFamilienwert && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black">Aktueller Familienwert</h2>
                    <p className="text-sm text-[#776B5B]">
                      Das lebt ihr gerade am stärksten.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                    {staerksterFamilienwert.icon || "❤️"}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8DECF] bg-[#FBF4EA] p-3">
                  <div className="min-w-0">
                    <p className="truncate font-black">
                      {staerksterFamilienwert.titel}
                    </p>
                    <p className="text-sm text-[#776B5B]">
                      gemeinsamer Wert
                    </p>
                  </div>

                  <p className="text-2xl font-black text-[#2F6A44]">
                    {staerksterFamilienwert.punkte}
                  </p>
                </div>

                <Link
                  href="/familienwerte"
                  className="mt-4 block rounded-2xl bg-[#20362B] p-3 text-center text-sm font-black text-[#FFF7EA] active:scale-[0.98]"
                >
                  Alle Familienwerte ansehen
                </Link>
              </section>
            )}

            <Link
              href="/routinen"
              className="mt-4 block rounded-[1.45rem] bg-[#20362B] p-4 text-center font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(32,54,43,0.20)] active:scale-[0.98]"
            >
              Heute loslegen
            </Link>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
