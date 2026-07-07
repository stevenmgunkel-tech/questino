"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type FamilienWert = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
  punkte: number;
};

export default function FamilienwertePage() {
  const [werte, setWerte] = useState<FamilienWert[]>([]);
  const [familieId, setFamilieId] = useState<string | null>(null);

  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [icon, setIcon] = useState("❤️");

  const [loading, setLoading] = useState(true);
  const [speichern, setSpeichern] = useState(false);
  const [fehler, setFehler] = useState("");
  const [formularOffen, setFormularOffen] = useState(false);

  useEffect(() => {
    ladeWerte();
  }, []);

  async function ladeWerte() {
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
      .select("familie_id")
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

    setFamilieId(mitglied.familie_id);

    const { data: werteData, error } = await supabase
      .from("familien_werte")
      .select("*")
      .eq("familie_id", mitglied.familie_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setFehler(error.message);
      setLoading(false);
      return;
    }

    const { data: punkteData } = await supabase
      .from("familienwert_punkte")
      .select("familienwert_id, punkte")
      .eq("familie_id", mitglied.familie_id);

    const werteMitPunkten =
      werteData?.map((wert) => {
        const punkteEintrag = punkteData?.find(
          (p) => p.familienwert_id === wert.id
        );

        return {
          ...wert,
          punkte: punkteEintrag?.punkte || 0,
        };
      }) || [];

    const sortiert = werteMitPunkten.sort((a, b) => b.punkte - a.punkte);

    setWerte(sortiert as FamilienWert[]);
    setLoading(false);
  }

  async function wertErstellen(e?: React.FormEvent) {
    e?.preventDefault();

    if (!familieId) {
      alert("Familie nicht gefunden.");
      return;
    }

    if (!titel.trim()) {
      alert("Bitte einen Titel eingeben.");
      return;
    }

    setSpeichern(true);

    const { error } = await supabase.from("familien_werte").insert({
      familie_id: familieId,
      titel: titel.trim(),
      beschreibung: beschreibung.trim() || null,
      icon: icon.trim() || "❤️",
    });

    setSpeichern(false);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setTitel("");
    setBeschreibung("");
    setIcon("❤️");
    setFormularOffen(false);

    await ladeWerte();
  }

  const staerksterWert = werte.length > 0 ? werte[0] : null;
  const maxPunkte = Math.max(...werte.map((wert) => wert.punkte), 1);
  const gesamtPunkte = werte.reduce((sum, wert) => sum + (wert.punkte || 0), 0);
  const aktiveWerte = werte.filter((wert) => wert.punkte > 0).length;

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
                  Werte
                </h1>

                <p className="mt-2 max-w-[15rem] text-sm leading-5 text-[#F3E8D5]/75">
                  Das sind nicht nur Wörter. Das lebt ihr als Familie.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                ❤️
              </div>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{werte.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Werte
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{gesamtPunkte}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Punkte
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{aktiveWerte}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Aktiv
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Familienwerte...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Familienwerte konnten nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            {staerksterWert && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Stärkster Familienwert
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
                      {staerksterWert.punkte} Punkte gesammelt
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#E7F0E4] px-3 py-2 text-sm font-black text-[#2F5D43]">
                    #{werte.findIndex((wert) => wert.id === staerksterWert.id) + 1}
                  </div>
                </div>
              </section>
            )}

            <button
              onClick={() => setFormularOffen((offen) => !offen)}
              className="mb-3 w-full rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center font-black shadow-[0_10px_30px_rgba(54,42,25,0.06)] active:scale-[0.99]"
            >
              {formularOffen ? "Wert-Formular schließen" : "+ Neuen Wert erstellen"}
            </button>

            {formularOffen && (
              <form
                onSubmit={wertErstellen}
                className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-black">Neuer Familienwert</h2>
                  <p className="mt-1 text-sm text-[#776B5B]">
                    Definiert, was euch als Familie wichtig ist.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Icon z.B. ❤️"
                    className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 outline-none focus:ring-2 focus:ring-[#4D8A5C]"
                  />

                  <input
                    value={titel}
                    onChange={(e) => setTitel(e.target.value)}
                    placeholder="z.B. Hilfsbereitschaft"
                    className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
                  />

                  <textarea
                    value={beschreibung}
                    onChange={(e) => setBeschreibung(e.target.value)}
                    placeholder="Was bedeutet dieser Wert für euch?"
                    className="min-h-24 w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 outline-none focus:ring-2 focus:ring-[#4D8A5C]"
                  />

                  <button
                    disabled={speichern}
                    className="w-full rounded-2xl bg-[#20362B] p-4 font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(32,54,43,0.20)] disabled:opacity-60 active:scale-[0.98]"
                  >
                    {speichern ? "Speichere..." : "Wert speichern"}
                  </button>
                </div>
              </form>
            )}

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-black">Werte-Ranking</h2>
                <p className="text-sm text-[#776B5B]">
                  Welche Werte ihr durch Missionen lebt.
                </p>
              </div>

              {werte.length === 0 && (
                <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                  <p className="text-3xl">❤️</p>
                  <p className="mt-2 font-black text-[#182019]">
                    Noch keine Familienwerte angelegt.
                  </p>
                  <p className="mt-1 text-sm">
                    Erstellt eure ersten Werte, damit Missionen darauf einzahlen können.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {werte.map((wert, index) => {
                  const progress = Math.round((wert.punkte / maxPunkte) * 100);

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
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                                Rang #{index + 1}
                              </p>

                              <h2 className="truncate text-base font-black">
                                {wert.titel}
                              </h2>

                              <p className="mt-1 text-sm leading-5 text-[#776B5B]">
                                {wert.beschreibung ||
                                  "Noch keine Beschreibung"}
                              </p>
                            </div>

                            <div className="shrink-0 rounded-2xl bg-[#E7F0E4] px-3 py-2 text-sm font-black text-[#2F5D43]">
                              {wert.punkte}
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
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
