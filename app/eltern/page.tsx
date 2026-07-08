"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Mitglied = {
  id: string;
  name: string;
  rolle: string | null;
  xp: number | null;
  level: number | null;
  familie_id: string;
};

type Familie = {
  id: string;
  name: string;
  familien_code: string | null;
};

type Mission = {
  id: string;
  titel: string;
  xp: number | null;
  status: string | null;
  zugewiesen_an: string | null;
};

type Belohnung = {
  id: string;
  titel: string;
  kosten: number;
};

type FamilienWert = {
  id: string;
  titel: string;
  icon: string | null;
  punkte: number;
};

export default function ElternPage() {
  const [familie, setFamilie] = useState<Familie | null>(null);
  const [eigenesMitglied, setEigenesMitglied] = useState<Mitglied | null>(null);
  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [offeneMissionen, setOffeneMissionen] = useState<Mission[]>([]);
  const [erledigteMissionen, setErledigteMissionen] = useState(0);
  const [familienXP, setFamilienXP] = useState(0);
  const [naechsteBelohnung, setNaechsteBelohnung] =
    useState<Belohnung | null>(null);
  const [staerksterWert, setStaerksterWert] =
    useState<FamilienWert | null>(null);

  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    ladeElternDashboard();
  }, []);

  async function ladeElternDashboard() {
    setLoading(true);
    setFehler("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setFehler("Du bist nicht eingeloggt.");
      setLoading(false);
      return;
    }

    const { data: mitgliedData, error: mitgliedError } = await supabase
      .from("mitglieder")
      .select("id, name, rolle, xp, level, familie_id")
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

    setEigenesMitglied(mitgliedData as Mitglied);

    const familieId = mitgliedData.familie_id;

    const { data: familieData, error: familieError } = await supabase
      .from("familien")
      .select("id, name, familien_code")
      .eq("id", familieId)
      .maybeSingle();

    if (familieError) {
      setFehler(familieError.message);
      setLoading(false);
      return;
    }

    setFamilie((familieData as Familie) || null);

    const { data: mitgliederData, error: mitgliederError } = await supabase
      .from("mitglieder")
      .select("id, name, rolle, xp, level, familie_id")
      .eq("familie_id", familieId)
      .order("xp", { ascending: false });

    if (mitgliederError) {
      setFehler(mitgliederError.message);
      setLoading(false);
      return;
    }

    setMitglieder((mitgliederData as Mitglied[]) || []);

    const { data: xpData, error: xpError } = await supabase
      .from("familien_xp")
      .select("xp")
      .eq("familie_id", familieId)
      .maybeSingle();

    if (xpError) {
      console.error("Familien XP Fehler:", xpError);
    }

    const aktuelleFamilienXP = xpData?.xp || 0;
    setFamilienXP(aktuelleFamilienXP);

    const { data: offeneMissionenData, error: offeneMissionenError } =
      await supabase
        .from("missionen")
        .select("id, titel, xp, status, zugewiesen_an")
        .eq("familie_id", familieId)
        .eq("status", "offen")
        .order("created_at", { ascending: false })
        .limit(6);

    if (offeneMissionenError) {
      console.error("Offene Missionen Fehler:", offeneMissionenError);
      setOffeneMissionen([]);
    } else {
      setOffeneMissionen((offeneMissionenData as Mission[]) || []);
    }

    const { count: erledigtCount, error: erledigtError } = await supabase
      .from("missionen")
      .select("*", { count: "exact", head: true })
      .eq("familie_id", familieId)
      .eq("status", "erledigt");

    if (erledigtError) {
      console.error("Erledigte Missionen Fehler:", erledigtError);
    }

    setErledigteMissionen(erledigtCount || 0);

    const { data: belohnungData, error: belohnungError } = await supabase
      .from("belohnungen")
      .select("id, titel, kosten")
      .eq("familie_id", familieId)
      .gte("kosten", aktuelleFamilienXP)
      .order("kosten", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (belohnungError) {
      console.error("Belohnung Fehler:", belohnungError);
    }

    setNaechsteBelohnung((belohnungData as Belohnung) || null);

    const { data: werteData, error: werteError } = await supabase
      .from("familien_werte")
      .select("id, titel, icon")
      .eq("familie_id", familieId);

    if (werteError) {
      console.error("Familienwerte Fehler:", werteError);
    }

    const { data: punkteData, error: punkteError } = await supabase
      .from("familienwert_punkte")
      .select("familienwert_id, punkte")
      .eq("familie_id", familieId);

    if (punkteError) {
      console.error("Familienwert Punkte Fehler:", punkteError);
    }

    const werteMitPunkten =
      werteData?.map((wert) => {
        const punkteEintrag = punkteData?.find(
          (p) => p.familienwert_id === wert.id
        );

        return {
          id: wert.id,
          titel: wert.titel,
          icon: wert.icon,
          punkte: punkteEintrag?.punkte || 0,
        };
      }) || [];

    const sortierteWerte = werteMitPunkten.sort((a, b) => b.punkte - a.punkte);
    setStaerksterWert((sortierteWerte[0] as FamilienWert) || null);

    setLoading(false);
  }

  const mitgliederMap = useMemo(() => {
    const map = new Map<string, Mitglied>();

    for (const mitglied of mitglieder) {
      map.set(mitglied.id, mitglied);
    }

    return map;
  }, [mitglieder]);

  const gesamtMitgliederXP = mitglieder.reduce(
    (sum, mitglied) => sum + (mitglied.xp || 0),
    0
  );

  const wochenzielIst = erledigteMissionen;
  const wochenzielSoll = 20;
  const wochenzielProzent = Math.min(
    100,
    Math.round((wochenzielIst / wochenzielSoll) * 100)
  );

  const naechsteBelohnungKosten = naechsteBelohnung?.kosten || 100;
  const familienzielProzent = Math.min(
    100,
    Math.round((familienXP / naechsteBelohnungKosten) * 100)
  );

  const actions = [
    { href: "/missionen", icon: "✦", label: "Mission" },
    { href: "/familienwerte", icon: "♡", label: "Werte" },
    { href: "/belohnungen", icon: "◈", label: "Reward" },
    { href: "/familie", icon: "☷", label: "Familie" },
  ];

  const kpis = [
    {
      icon: "⭐",
      wert: `${gesamtMitgliederXP} XP`,
      label: "Mitglieder XP",
      farbe: "bg-[#E7F0E4]",
      textFarbe: "text-[#2F5D43]",
    },
    {
      icon: "🎁",
      wert: `${familienzielProzent}%`,
      label: naechsteBelohnung?.titel || "Familienziel",
      farbe: "bg-[#F3EBDD]",
      textFarbe: "text-[#8C7655]",
    },
    {
      icon: "🎯",
      wert: `${wochenzielIst} / ${wochenzielSoll}`,
      label: "Missionen erledigt",
      farbe: "bg-[#F6EAD8]",
      textFarbe: "text-[#8A4D1F]",
    },
    {
      icon: "👨‍👩‍👧",
      wert: `${mitglieder.length}`,
      label: "Mitglieder",
      farbe: "bg-[#F3EBDD]",
      textFarbe: "text-[#8C7655]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-5 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  {familie?.name || "Kommandozentrale"}
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight">
                  Eltern
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Hallo {eigenesMitglied?.name || "Elternteil"}, hier steuerst
                  du eure Familienreise.
                </p>
              </div>

              <Link
                href="/"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner active:scale-95"
              >
                🧒
              </Link>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F8E8DD] p-3 text-[#9A3A28]">
                <p className="text-xl font-black">{offeneMissionen.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#B76B55]">
                  Offen
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{familienXP}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Fam. XP
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{mitglieder.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Team
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Eltern-Dashboard...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Eltern-Dashboard konnte nicht laden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                    Heute im Blick
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {offeneMissionen.length} offene Missionen
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-[#776B5B]">
                    Alles, was in der Familie gerade noch offen ist.
                  </p>
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E4] text-xl">
                  ✅
                </div>
              </div>
            </section>

            {staerksterWert && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Stärkster Familienwert
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                    {staerksterWert.icon || "♡"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-black">
                      {staerksterWert.titel}
                    </h2>

                    <p className="text-sm text-[#776B5B]">
                      {staerksterWert.punkte} Punkte gesammelt
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="mb-3 grid grid-cols-4 gap-2">
              {actions.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex min-h-[5.2rem] flex-col items-center justify-center rounded-[1.35rem] border border-[#E1D7C7] bg-[#FFF9EF] p-3 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)] transition active:scale-[0.98]"
                >
                  <span className="text-xl">{item.icon}</span>

                  <span className="mt-2 text-[10px] font-black text-[#776B5B]">
                    {item.label}
                  </span>
                </Link>
              ))}
            </section>

            <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Offene Missionen</h2>
                  <p className="text-sm text-[#776B5B]">
                    Überblick über alles, was noch ansteht.
                  </p>
                </div>

                <span className="rounded-full bg-[#F8E8DD] px-3 py-1 text-xs font-black text-[#9A3A28]">
                  {offeneMissionen.length} offen
                </span>
              </div>

              <div className="space-y-3">
                {offeneMissionen.map((item) => {
                  const kind = item.zugewiesen_an
                    ? mitgliederMap.get(item.zugewiesen_an)?.name
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="rounded-[1.25rem] border border-[#E8DECF] bg-[#FBF4EA] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E4] text-xl">
                          ✦
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-black">{item.titel}</h3>

                          <p className="text-sm text-[#776B5B]">
                            Mission
                            {kind ? ` · ${kind}` : " · Familie"}
                            {item.xp ? ` · +${item.xp} XP` : ""}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/missionen"
                        className="mt-3 block rounded-2xl bg-[#20362B] py-3 text-center text-sm font-black text-[#FFF7EA] active:scale-[0.98]"
                      >
                        In Missionen öffnen
                      </Link>
                    </div>
                  );
                })}

                {offeneMissionen.length === 0 && (
                  <div className="rounded-[1.25rem] border border-[#E8DECF] bg-[#FBF4EA] p-4 text-center text-sm text-[#776B5B]">
                    Keine offenen Missionen. Die Familie ist aktuell sauber.
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-black">Familienübersicht</h2>
                <p className="text-sm text-[#776B5B]">
                  Die wichtigsten Zahlen auf einen Blick.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {kpis.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
                  >
                    <div
                      className={`mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${item.farbe} text-xl`}
                    >
                      {item.icon}
                    </div>

                    <p className={`font-black ${item.textFarbe}`}>
                      {item.wert}
                    </p>

                    <p className="mt-1 truncate text-sm text-[#776B5B]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
