"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Mitglied = {
  id: string;
  name: string;
  rolle: string;
  xp: number;
  level: number;
  auth_user_id?: string | null;
};

type Familie = {
  id: string;
  name: string;
  familien_code: string | null;
};

type FamilienWert = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
  punkte: number;
};

export default function FamiliePage() {
  const [familie, setFamilie] = useState<Familie | null>(null);
  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [staerksterWert, setStaerksterWert] = useState<FamilienWert | null>(
    null
  );
  const [gesamtXP, setGesamtXP] = useState(0);

  const [loading, setLoading] = useState(true);
  const [speichern, setSpeichern] = useState(false);
  const [fehler, setFehler] = useState("");

  const [formularOffen, setFormularOffen] = useState(false);
  const [neuerName, setNeuerName] = useState("");
  const [neueRolle, setNeueRolle] = useState("Kind");
  const [kopiert, setKopiert] = useState(false);

  useEffect(() => {
    ladeFamilie();
  }, []);

  async function ladeFamilie() {
    setLoading(true);
    setFehler("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setFehler("Du bist nicht eingeloggt.");
      setLoading(false);
      return;
    }

    const { data: eigenesMitglied, error: eigenesMitgliedError } =
      await supabase
        .from("mitglieder")
        .select("id, familie_id")
        .eq("auth_user_id", userData.user.id)
        .maybeSingle();

    if (eigenesMitgliedError) {
      setFehler(eigenesMitgliedError.message);
      setLoading(false);
      return;
    }

    if (!eigenesMitglied) {
      setFehler(
        "Dein Login ist noch mit keinem Familienmitglied verbunden. Bitte prüfe Familie/Login."
      );
      setLoading(false);
      return;
    }

    const { data: familieData, error: familieError } = await supabase
      .from("familien")
      .select("id, name, familien_code")
      .eq("id", eigenesMitglied.familie_id)
      .maybeSingle();

    if (familieError) {
      setFehler(familieError.message);
      setLoading(false);
      return;
    }

    setFamilie(familieData || null);

    const { data: mitgliederData, error: mitgliederError } = await supabase
      .from("mitglieder")
      .select("id, name, rolle, xp, level, auth_user_id")
      .eq("familie_id", eigenesMitglied.familie_id)
      .order("xp", { ascending: false })
      .order("name", { ascending: true });

    if (mitgliederError) {
      setFehler(mitgliederError.message);
      setLoading(false);
      return;
    }

    const geladeneMitglieder = (mitgliederData || []) as Mitglied[];
    setMitglieder(geladeneMitglieder);

    const xpSumme = geladeneMitglieder.reduce(
      (sum, mitglied) => sum + (mitglied.xp || 0),
      0
    );

    setGesamtXP(xpSumme);

    const { data: werteData } = await supabase
      .from("familien_werte")
      .select("id, titel, beschreibung, icon")
      .eq("familie_id", eigenesMitglied.familie_id);

    const { data: punkteData } = await supabase
      .from("familienwert_punkte")
      .select("familienwert_id, punkte")
      .eq("familie_id", eigenesMitglied.familie_id);

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

    setStaerksterWert((sortiert[0] as FamilienWert) || null);
    setLoading(false);
  }

  async function mitgliedHinzufuegen(e: React.FormEvent) {
    e.preventDefault();

    if (!familie) {
      alert("Keine Familie gefunden.");
      return;
    }

    if (!neuerName.trim()) {
      alert("Bitte Namen eingeben.");
      return;
    }

    setSpeichern(true);

    const { error } = await supabase.from("mitglieder").insert({
      familie_id: familie.id,
      auth_user_id: null,
      name: neuerName.trim(),
      rolle: neueRolle,
      xp: 0,
      level: 1,
    });

    setSpeichern(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNeuerName("");
    setNeueRolle("Kind");
    setFormularOffen(false);
    await ladeFamilie();
  }

  async function familiencodeKopieren() {
    if (!familie?.familien_code) return;

    try {
      await navigator.clipboard.writeText(familie.familien_code);
      setKopiert(true);

      setTimeout(() => {
        setKopiert(false);
      }, 1800);
    } catch {
      alert(`Familiencode: ${familie.familien_code}`);
    }
  }

  function iconFuerRolle(rolle: string) {
    const clean = rolle?.toLowerCase();

    if (clean === "kind") return "🧒";
    if (clean === "teenager") return "🧑";
    if (clean === "mama") return "👩";
    if (clean === "papa") return "👨";
    if (clean === "eltern") return "👨‍👩‍👧";
    if (clean === "erwachsener") return "👤";

    return "👤";
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
                  {familie?.name || "Questino Familie"}
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight">
                  Familie
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Eure gemeinsame Entwicklung auf einen Blick.
                </p>
              </div>

              <button
                onClick={() => setFormularOffen((offen) => !offen)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{mitglieder.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Mitglieder
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{gesamtXP}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  XP
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">
                  {familie?.familien_code ? "OK" : "—"}
                </p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Code
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Familie...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Familie konnte nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            {familie?.familien_code && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Familiencode
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-3xl font-black tracking-wider">
                    {familie.familien_code}
                  </p>

                  <button
                    onClick={familiencodeKopieren}
                    className="rounded-2xl bg-[#20362B] px-4 py-3 text-sm font-black text-[#FFF7EA] active:scale-[0.98]"
                  >
                    {kopiert ? "Kopiert" : "Kopieren"}
                  </button>
                </div>

                <p className="mt-2 text-xs leading-5 text-[#776B5B]">
                  Für echte Logins: Registrieren → Beitreten → Code eingeben.
                </p>
              </section>
            )}

            {formularOffen && (
              <form
                onSubmit={mitgliedHinzufuegen}
                className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-black">Mitglied hinzufügen</h2>
                  <p className="mt-1 text-sm text-[#776B5B]">
                    Für Kinder oder lokale Familienmitglieder ohne eigene E-Mail.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none placeholder:text-[#9C8B74] focus:ring-2 focus:ring-[#4D8A5C]"
                    placeholder="Name z.B. Kind, Mama, Papa"
                    value={neuerName}
                    onChange={(e) => setNeuerName(e.target.value)}
                  />

                  <select
                    className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
                    value={neueRolle}
                    onChange={(e) => setNeueRolle(e.target.value)}
                  >
                    <option>Kind</option>
                    <option>Teenager</option>
                    <option>Erwachsener</option>
                    <option>Mama</option>
                    <option>Papa</option>
                    <option>Eltern</option>
                  </select>

                  <button
                    disabled={speichern}
                    className="w-full rounded-2xl bg-[#20362B] p-4 font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(32,54,43,0.20)] disabled:opacity-60 active:scale-[0.98]"
                  >
                    {speichern ? "Speichere..." : "Mitglied speichern"}
                  </button>
                </div>
              </form>
            )}

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
                </div>
              </section>
            )}

            <section>
              <div className="mb-3">
                <h2 className="text-lg font-black">Mitglieder</h2>
                <p className="text-sm text-[#776B5B]">
                  Eure Familie in Questino.
                </p>
              </div>

              <div className="space-y-3">
                {mitglieder.map((mitglied) => (
                  <div
                    key={mitglied.id}
                    className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                        {iconFuerRolle(mitglied.rolle)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-black">
                          {mitglied.name}
                        </h2>

                        <p className="text-sm text-[#776B5B]">
                          {mitglied.rolle}
                        </p>

                        {!mitglied.auth_user_id && (
                          <p className="mt-0.5 text-[11px] font-bold text-[#8C7655]">
                            Lokales Mitglied
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="font-black text-[#2F5D43]">
                          {mitglied.xp || 0} XP
                        </p>

                        <p className="text-xs text-[#776B5B]">
                          Level {mitglied.level || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {mitglieder.length === 0 && (
                  <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                    Noch keine Mitglieder gefunden.
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
