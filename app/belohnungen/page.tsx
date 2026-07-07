"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Belohnung = {
  id: string;
  titel: string;
  beschreibung: string | null;
  kosten: number;
};

type Einloesung = {
  id: string;
  xp_kosten: number;
  eingeloest_am: string;
  titel: string;
};

type RawEinloesung = {
  id: string;
  xp_kosten: number | null;
  eingeloest_am: string;
  belohnungen:
    | {
        titel: string | null;
      }
    | {
        titel: string | null;
      }[]
    | null;
};

export default function BelohnungenPage() {
  const [belohnungen, setBelohnungen] = useState<Belohnung[]>([]);
  const [einloesungen, setEinloesungen] = useState<Einloesung[]>([]);
  const [familienXP, setFamilienXP] = useState(0);
  const [familieId, setFamilieId] = useState<string | null>(null);
  const [mitgliedId, setMitgliedId] = useState<string | null>(null);
  const [mitgliedName, setMitgliedName] = useState("Jemand");
  const [meldung, setMeldung] = useState("");
  const [fehler, setFehler] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    ladeBelohnungen();
  }, []);

  async function ladeBelohnungen() {
    setLoading(true);
    setMeldung("");
    setFehler("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setFehler("Du bist nicht eingeloggt.");
      setLoading(false);
      return;
    }

    const { data: mitglied, error: mitgliedError } = await supabase
      .from("mitglieder")
      .select("id, familie_id, name")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();

    if (mitgliedError) {
      console.error(mitgliedError);
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

    setFamilieId(mitglied.familie_id);
    setMitgliedId(mitglied.id);
    setMitgliedName(mitglied.name || "Jemand");

    const { data: xpData, error: xpError } = await supabase
      .from("familien_xp")
      .select("xp")
      .eq("familie_id", mitglied.familie_id)
      .maybeSingle();

    if (xpError) {
      console.error(xpError);
    }

    setFamilienXP(xpData?.xp || 0);

    const { data: belohnungsDaten, error: belohnungsError } = await supabase
      .from("belohnungen")
      .select("id, titel, beschreibung, kosten")
      .eq("familie_id", mitglied.familie_id)
      .order("kosten", { ascending: true });

    if (belohnungsError) {
      console.error(belohnungsError);
      setFehler(belohnungsError.message);
      setLoading(false);
      return;
    }

    setBelohnungen((belohnungsDaten as Belohnung[]) || []);

    const { data: historie, error: historieError } = await supabase
      .from("belohnung_einloesungen")
      .select(
        `
        id,
        xp_kosten,
        eingeloest_am,
        belohnungen (
          titel
        )
      `
      )
      .eq("familie_id", mitglied.familie_id)
      .order("eingeloest_am", { ascending: false })
      .limit(10);

    if (historieError) {
      console.error(historieError);
      setEinloesungen([]);
      setLoading(false);
      return;
    }

    const normalisierteHistorie = ((historie || []) as RawEinloesung[]).map(
      (einloesung) => {
        const relation = Array.isArray(einloesung.belohnungen)
          ? einloesung.belohnungen[0]
          : einloesung.belohnungen;

        return {
          id: einloesung.id,
          xp_kosten: einloesung.xp_kosten || 0,
          eingeloest_am: einloesung.eingeloest_am,
          titel: relation?.titel || "Belohnung",
        };
      }
    );

    setEinloesungen(normalisierteHistorie);
    setLoading(false);
  }

  async function belohnungEinloesen(belohnung: Belohnung) {
    if (!familieId || !mitgliedId) return;
    if (loadingId) return;

    if (familienXP < belohnung.kosten) {
      setMeldung("Noch nicht genug Familien XP für diese Belohnung.");
      return;
    }

    const sicher = window.confirm(
      `${belohnung.titel} für ${belohnung.kosten} Familien XP einlösen?`
    );

    if (!sicher) return;

    setLoadingId(belohnung.id);
    setMeldung("");

    const neueXP = familienXP - belohnung.kosten;

    const { error: xpError } = await supabase
      .from("familien_xp")
      .update({ xp: neueXP })
      .eq("familie_id", familieId);

    if (xpError) {
      console.error(xpError);
      setMeldung("XP konnten nicht abgezogen werden.");
      setLoadingId(null);
      return;
    }

    const { error: logError } = await supabase
      .from("belohnung_einloesungen")
      .insert({
        familie_id: familieId,
        belohnung_id: belohnung.id,
        mitglied_id: mitgliedId,
        xp_kosten: belohnung.kosten,
      });

    if (logError) {
      console.error(logError);
      setMeldung(
        "Belohnung wurde abgezogen, aber die Historie konnte nicht gespeichert werden."
      );
      setLoadingId(null);
      await ladeBelohnungen();
      return;
    }

    await supabase.from("feed").insert({
      familie_id: familieId,
      mitglied_id: mitgliedId,
      text: `${mitgliedName} hat die Belohnung "${belohnung.titel}" eingelöst`,
      xp: 0,
    });

    setFamilienXP(neueXP);
    setMeldung(`${belohnung.titel} wurde eingelöst.`);
    setLoadingId(null);
    await ladeBelohnungen();
  }

  function datumFormatieren(datum: string) {
    return new Date(datum).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const naechsteBelohnung = belohnungen.find(
    (belohnung) => familienXP < belohnung.kosten
  );

  const freigeschaltet = belohnungen.filter(
    (belohnung) => familienXP >= belohnung.kosten
  ).length;

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-4 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino Familie
                </p>

                <h1 className="mt-2 text-4xl font-black leading-none tracking-tight">
                  Belohnungen
                </h1>

                <p className="mt-2 max-w-[15rem] text-sm leading-5 text-[#F3E8D5]/75">
                  Verdiente XP werden zu gemeinsamen Erlebnissen.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                🎁
              </div>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{familienXP}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  XP
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{freigeschaltet}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Bereit
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{einloesungen.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Erlebt
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Belohnungen...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Belohnungen konnten nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            {naechsteBelohnung && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Nächster Familienmoment
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                    🎁
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-black">
                      {naechsteBelohnung.titel}
                    </h2>

                    <p className="text-sm text-[#776B5B]">
                      Noch {Math.max(0, naechsteBelohnung.kosten - familienXP)} XP bis dahin
                    </p>
                  </div>
                </div>
              </section>
            )}

            {meldung && (
              <div className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#EAF5E9] p-4 text-center text-sm font-black text-[#2F6A44] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                {meldung}
              </div>
            )}

            <section className="space-y-3">
              {belohnungen.map((belohnung) => {
                const bereit = familienXP >= belohnung.kosten;
                const progress =
                  belohnung.kosten > 0
                    ? Math.min(
                        100,
                        Math.round((familienXP / belohnung.kosten) * 100)
                      )
                    : 100;

                return (
                  <div
                    key={belohnung.id}
                    className={`rounded-[1.45rem] border p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)] ${
                      bereit
                        ? "border-[#CFE4D0] bg-[#EAF5E9]"
                        : "border-[#E1D7C7] bg-[#FFF9EF]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                          bereit ? "bg-[#FFF9EF]" : "bg-[#F3EBDD]"
                        }`}
                      >
                        {bereit ? "🎁" : "🔒"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-black">
                              {belohnung.titel}
                            </h2>

                            {belohnung.beschreibung && (
                              <p className="mt-1 text-sm leading-5 text-[#776B5B]">
                                {belohnung.beschreibung}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 rounded-2xl bg-[#F3EBDD] px-3 py-2 text-sm font-black text-[#2F5D43]">
                            {belohnung.kosten} XP
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="mb-1 flex justify-between text-[11px] font-bold text-[#776B5B]">
                            <span>
                              {familienXP} / {belohnung.kosten} XP
                            </span>
                            <span>{progress}%</span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-[#E8DECF]">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                bereit ? "bg-[#4D8A5C]" : "bg-[#C58A43]"
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => belohnungEinloesen(belohnung)}
                          disabled={!bereit || loadingId === belohnung.id}
                          className={`mt-4 w-full rounded-2xl p-3 text-sm font-black transition active:scale-[0.98] disabled:opacity-60 ${
                            bereit
                              ? "bg-[#20362B] text-[#FFF7EA]"
                              : "bg-[#EFE6D8] text-[#8C7655]"
                          }`}
                        >
                          {loadingId === belohnung.id
                            ? "Wird eingelöst..."
                            : bereit
                            ? "Einlösen"
                            : `Noch ${Math.max(
                                0,
                                belohnung.kosten - familienXP
                              )} XP`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {belohnungen.length === 0 && (
                <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                  <p className="text-3xl">🎁</p>
                  <p className="mt-2 font-black text-[#182019]">
                    Noch keine Belohnungen angelegt.
                  </p>
                  <p className="mt-1 text-sm">
                    Lege später gemeinsame Erlebnisse als Belohnungen an.
                  </p>
                </div>
              )}
            </section>

            <section className="mt-4 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Bereits erlebt</h2>
                  <p className="text-sm text-[#776B5B]">
                    Eure eingelösten Familienmomente.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F3EBDD] text-lg">
                  📜
                </div>
              </div>

              <div className="space-y-2">
                {einloesungen.map((einloesung) => (
                  <div
                    key={einloesung.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8DECF] bg-[#FBF4EA] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {einloesung.titel}
                      </p>
                      <p className="text-xs text-[#776B5B]">
                        {datumFormatieren(einloesung.eingeloest_am)}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-black text-[#2F6A44]">
                      -{einloesung.xp_kosten} XP
                    </p>
                  </div>
                ))}

                {einloesungen.length === 0 && (
                  <div className="rounded-2xl bg-[#FBF4EA] p-4 text-center text-sm text-[#776B5B]">
                    Noch keine Belohnung eingelöst.
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
