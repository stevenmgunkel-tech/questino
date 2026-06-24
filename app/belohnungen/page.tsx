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
  const [meldung, setMeldung] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    ladeBelohnungen();
  }, []);

  async function ladeBelohnungen() {
    setLoading(true);
    setMeldung("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: mitglied, error: mitgliedError } = await supabase
      .from("mitglieder")
      .select("id, familie_id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (mitgliedError || !mitglied) {
      console.error(mitgliedError);
      setLoading(false);
      return;
    }

    setFamilieId(mitglied.familie_id);
    setMitgliedId(mitglied.id);

    const { data: xpData, error: xpError } = await supabase
      .from("familien_xp")
      .select("xp")
      .eq("familie_id", mitglied.familie_id)
      .single();

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

    setFamilienXP(neueXP);
    setMeldung(`🎁 ${belohnung.titel} wurde eingelöst.`);
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

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black">
            Q
          </div>

          <h1 className="text-3xl font-black">Belohnungen</h1>

          <p className="mt-2 text-sm text-white/70">
            Verdiente XP werden zu gemeinsamen Erlebnissen.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
            Lade Belohnungen...
          </div>
        )}

        {!loading && (
          <>
            <div className="mb-5 rounded-3xl bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Familien XP</p>
              <p className="text-4xl font-black text-emerald-700">
                {familienXP}
              </p>
            </div>

            {meldung && (
              <div className="mb-5 rounded-3xl bg-white p-4 text-center font-bold text-gray-700 shadow">
                {meldung}
              </div>
            )}

            <div className="space-y-4">
              {belohnungen.map((belohnung) => {
                const freigeschaltet = familienXP >= belohnung.kosten;
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
                    className="rounded-3xl bg-white p-5 shadow"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black">
                          {belohnung.titel}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                          {belohnung.beschreibung}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-700">
                          {belohnung.kosten}
                        </p>
                        <p className="text-xs text-gray-400">XP</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-xs text-gray-500">
                        <span>
                          {familienXP} / {belohnung.kosten} XP
                        </span>
                        <span>{progress}%</span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            freigeschaltet
                              ? "bg-gradient-to-r from-green-400 to-emerald-500"
                              : "bg-gradient-to-r from-orange-400 to-yellow-400"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => belohnungEinloesen(belohnung)}
                      disabled={!freigeschaltet || loadingId === belohnung.id}
                      className={`mt-4 w-full rounded-2xl p-3 font-black transition ${
                        freigeschaltet
                          ? "bg-gray-900 text-white active:scale-[0.98]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {loadingId === belohnung.id
                        ? "Wird eingelöst..."
                        : freigeschaltet
                        ? "🎁 Einlösen"
                        : "🔒 Noch gesperrt"}
                    </button>
                  </div>
                );
              })}

              {belohnungen.length === 0 && (
                <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
                  Noch keine Belohnungen angelegt.
                </div>
              )}
            </div>

            <section className="mt-5 rounded-3xl bg-white p-5 shadow">
              <h2 className="mb-4 text-xl font-black">📜 Bereits erlebt</h2>

              <div className="space-y-3">
                {einloesungen.map((einloesung) => (
                  <div
                    key={einloesung.id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-black">{einloesung.titel}</p>
                      <p className="text-sm text-gray-500">
                        {datumFormatieren(einloesung.eingeloest_am)}
                      </p>
                    </div>

                    <p className="font-black text-emerald-700">
                      -{einloesung.xp_kosten} XP
                    </p>
                  </div>
                ))}

                {einloesungen.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 p-4 text-center text-gray-500">
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
