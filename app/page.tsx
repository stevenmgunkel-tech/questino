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

function berechneLevel(xp: number) {
  if (xp >= 1000)
    return { level: 5, name: "Meister", aktuellesLevelXP: 1000, naechstesLevelXP: 1000 };
  if (xp >= 500)
    return { level: 4, name: "Organisator", aktuellesLevelXP: 500, naechstesLevelXP: 1000 };
  if (xp >= 250)
    return { level: 3, name: "Planer", aktuellesLevelXP: 250, naechstesLevelXP: 500 };
  if (xp >= 100)
    return { level: 2, name: "Starter", aktuellesLevelXP: 100, naechstesLevelXP: 250 };

  return { level: 1, name: "Entdecker", aktuellesLevelXP: 0, naechstesLevelXP: 100 };
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
  const [staerksterFamilienwert, setStaerksterFamilienwert] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: mitgliedData, error: mitgliedError } = await supabase
        .from("mitglieder")
        .select("*")
        .eq("auth_user_id", userData.user.id)
        .single();

      if (mitgliedError || !mitgliedData) return;

      setMitglied(mitgliedData);

      const { data: familieData } = await supabase
        .from("familien")
        .select("*")
        .eq("id", mitgliedData.familie_id)
        .single();

      if (!familieData) return;

      setFamilie(familieData);

      const { data: familienXPData } = await supabase
        .from("familien_xp")
        .select("*")
        .eq("familie_id", familieData.id)
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

      const heute = new Date().toISOString().split("T")[0];

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
        .select(`
          punkte,
          staerken (
            name
          )
        `)
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
    <main className="min-h-screen bg-[#F6F7FB] px-5 pt-6 pb-32 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gray-900 text-2xl font-black text-white shadow-lg">
              Q
            </div>

            <div>
              <p className="font-medium text-gray-500">
                Guten Tag {mitglied?.name ?? ""} 👋
              </p>
              <h1 className="text-3xl font-black leading-none">Questino</h1>
              <p className="mt-1 text-sm text-gray-500">
                {familie?.name ?? "Familie wird geladen..."}
              </p>
            </div>
          </div>

          <Link
            href="/familie"
            className="rounded-2xl bg-white px-4 py-2 text-sm font-black shadow"
          >
            Familie
          </Link>
        </div>

        <section className="relative mb-5 overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="font-medium text-white/70">Aktueller Rang</p>
                <h2 className="text-2xl font-black">
                  Level {levelInfo.level} – {levelInfo.name}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Denk nach. Wachse. Entwickle dich.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black">
                Q
              </div>
            </div>

            <div className="my-6 flex justify-center">
              <div className="relative h-44 w-44">
                <div
                  className="absolute inset-0 rounded-full shadow-inner"
                  style={{
                    background: `conic-gradient(white 0deg ${
                      fortschritt * 3.6
                    }deg, rgba(255,255,255,0.22) ${
                      fortschritt * 3.6
                    }deg 360deg)`,
                  }}
                />

                <div className="absolute inset-[15px] flex items-center justify-center rounded-full bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 shadow-inner">
                  <div className="text-center">
                    <p className="text-5xl font-black leading-none">{xp}</p>
                    <p className="mt-1 font-black text-white/70">XP</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-2 flex justify-between text-sm text-white/80">
              <span>{xp} XP</span>
              <span>
                {levelInfo.level >= 5
                  ? "MAX"
                  : `${levelInfo.naechstesLevelXP} XP`}
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-white/25">
              <div
                className="h-3 rounded-full bg-white transition-all"
                style={{ width: `${fortschritt}%` }}
              />
            </div>

            <div className="mt-5 rounded-3xl bg-white/15 p-4">
              <p className="text-sm text-white/70">Nächstes Level</p>
              <p className="font-black">
                {levelInfo.level >= 5
                  ? "Maximales Level erreicht"
                  : `${levelInfo.naechstesLevelXP - xp} XP fehlen noch`}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">🌱 Deine stärkste Eigenschaft</h2>

          <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
            <div>
              <p className="font-black">
                {besteStaerke?.name ?? "Noch keine Stärke"}
              </p>
              <p className="text-sm text-gray-500">
                wächst durch Missionen und Routinen
              </p>
            </div>

            <p className="text-3xl font-black text-emerald-700">
              {besteStaerke?.punkte ?? 0}
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">🔥 Heute</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <div>
                <p className="font-black">Offene Missionen</p>
                <p className="text-sm text-gray-500">Was noch ansteht</p>
              </div>

              <p className="text-3xl font-black text-orange-600">
                {offeneMissionen}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <div>
                <p className="font-black">Offene Routinen</p>
                <p className="text-sm text-gray-500">Was heute noch zählt</p>
              </div>

              <p className="text-3xl font-black text-purple-600">
                {offeneRoutinen}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="font-black">Letzte Aktivität</p>
              <p className="mt-1 text-sm text-gray-500">
                {letzteAktivitaet || "Noch keine Aktivität"}
              </p>
            </div>
          </div>

          <Link
            href="/routinen"
            className="mt-4 block rounded-2xl bg-gray-900 p-3 text-center font-black text-white"
          >
            Heute loslegen
          </Link>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">🎯 Aktuelles Ziel</h2>

          {hauptZiel ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black">{hauptZiel.titel}</p>
                  <p className="text-sm text-gray-500">
                    {hauptZiel.aktueller_wert} / {hauptZiel.ziel_wert}
                  </p>
                </div>

                <p className="text-2xl font-black text-blue-600">
                  {zielFortschritt}%
                </p>
              </div>

              <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
                <div
                  className="h-3 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${zielFortschritt}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">
              Noch kein aktives Ziel. Erstelle dein erstes Ziel.
            </p>
          )}
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">🏆 Familienziel</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-black">
                {naechsteBelohnung?.titel || "Nächste Belohnung"}
              </p>
              <p className="text-sm text-gray-500">
                {familienXP} / {familienZielKosten} XP
              </p>
            </div>

            <p className="text-2xl font-black text-green-600">
              {familienFortschritt}%
            </p>
          </div>

          <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-green-600 transition-all"
              style={{ width: `${familienFortschritt}%` }}
            />
          </div>

          <p className="mt-3 text-sm text-gray-500">
            {naechsteBelohnung
              ? `${Math.max(
                  naechsteBelohnung.kosten - familienXP,
                  0
                )} XP fehlen noch`
              : "Noch keine Belohnung angelegt"}
          </p>
        </section>

        {staerksterFamilienwert && (
  <section className="mb-5 rounded-3xl bg-white p-5 shadow">
    <h2 className="mb-4 text-xl font-black">
      ❤️ Aktueller Familienwert
    </h2>

    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
        {staerksterFamilienwert.icon || "❤️"}
      </div>

      <div className="flex-1">
        <p className="font-black text-lg">
          {staerksterFamilienwert.titel}
        </p>

        <p className="text-sm text-gray-500">
          Das lebt ihr gerade am stärksten.
        </p>
      </div>

      <p className="text-2xl font-black text-emerald-700">
        {staerksterFamilienwert.punkte}
      </p>
    </div>

    <Link
      href="/familienwerte"
      className="mt-4 block rounded-2xl bg-gray-900 p-3 text-center font-black text-white"
    >
      Alle Familienwerte ansehen
    </Link>
  </section>
)}

        <section className="mb-5 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-2 text-xl font-black">💡 Impuls des Tages</h2>
          <p className="text-gray-600">
            Denk nach. Wachse. Entwickle dich.
          </p>
        </section>
      </div>

      <AppNav />
    </main>
  );
}