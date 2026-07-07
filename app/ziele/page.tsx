"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";
import {
  pruefeAchievements,
  type FreigeschaltetesAchievement,
} from "@/lib/achievements";
import { pruefeLevelUps, type LevelLog } from "@/lib/level";

type Ziel = {
  id: string;
  titel: string;
  beschreibung: string | null;
  ziel_wert: number;
  aktueller_wert: number;
  belohnung: string | null;
  status: string;
};

type Mitglied = {
  id: string;
  familie_id: string;
  name: string;
  xp: number;
};

export default function ZielePage() {
  const [ziele, setZiele] = useState<Ziel[]>([]);
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [zielWert, setZielWert] = useState("");
  const [belohnung, setBelohnung] = useState("");

  const [mitgliedId, setMitgliedId] = useState<string | null>(null);
  const [familieId, setFamilieId] = useState<string | null>(null);
  const [mitgliedName, setMitgliedName] = useState("Jemand");

  const [loading, setLoading] = useState(false);
  const [seiteLaedt, setSeiteLaedt] = useState(true);
  const [fehler, setFehler] = useState("");
  const [formularOffen, setFormularOffen] = useState(true);
  const [loadingZielId, setLoadingZielId] = useState<string | null>(null);

  const [achievementQueue, setAchievementQueue] = useState<
    FreigeschaltetesAchievement[]
  >([]);
  const [levelQueue, setLevelQueue] = useState<LevelLog[]>([]);

  const achievementPopup = achievementQueue[0] || null;
  const levelPopup = !achievementPopup ? levelQueue[0] || null : null;

  useEffect(() => {
    ladeZiele();
  }, []);

  async function getMitglied(): Promise<Mitglied | null> {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) return null;

    const { data, error } = await supabase
      .from("mitglieder")
      .select("id, familie_id, name, xp")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();

    if (error) {
      console.error("Mitglied laden Fehler:", error);
      return null;
    }

    return (data as Mitglied) || null;
  }

  async function ladeZiele() {
    setSeiteLaedt(true);
    setFehler("");

    const mitglied = await getMitglied();

    if (!mitglied) {
      setFehler(
        "Dein Login ist noch mit keinem Familienmitglied verbunden. Bitte prüfe Familie/Login."
      );
      setSeiteLaedt(false);
      return;
    }

    setMitgliedId(mitglied.id);
    setFamilieId(mitglied.familie_id);
    setMitgliedName(mitglied.name || "Jemand");

    const { data, error } = await supabase
      .from("ziele")
      .select("*")
      .eq("mitglied_id", mitglied.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setFehler(error.message);
      setSeiteLaedt(false);
      return;
    }

    setZiele((data || []) as Ziel[]);
    setSeiteLaedt(false);
  }

  async function achievementFeedEintraege(
    neueAchievements: FreigeschaltetesAchievement[],
    zielFamilieId: string,
    zielMitgliedId: string,
    name: string
  ) {
    for (const achievement of neueAchievements) {
      await supabase.from("feed").insert({
        familie_id: zielFamilieId,
        mitglied_id: zielMitgliedId,
        text: `${name} hat das Achievement "${achievement.titel}" freigeschaltet`,
        xp: achievement.xp_bonus,
      });
    }
  }

  async function levelFeedEintraege(
    neueLevel: LevelLog[],
    zielFamilieId: string,
    zielMitgliedId: string,
    name: string
  ) {
    for (const level of neueLevel) {
      await supabase.from("feed").insert({
        familie_id: zielFamilieId,
        mitglied_id: zielMitgliedId,
        text: `${name} hat Level ${level.level} erreicht: ${level.titel}`,
        xp: 0,
      });
    }
  }

  async function zielErstellen(e?: React.FormEvent) {
    e?.preventDefault();

    if (!mitgliedId || !familieId) {
      alert("Mitglied oder Familie nicht gefunden.");
      return;
    }

    if (!titel.trim()) {
      alert("Bitte einen Ziel-Titel eingeben.");
      return;
    }

    const zielWertZahl = Number(zielWert);

    if (!Number.isFinite(zielWertZahl) || zielWertZahl <= 0) {
      alert("Bitte einen gültigen Zielwert eingeben.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("ziele").insert({
      mitglied_id: mitgliedId,
      titel: titel.trim(),
      beschreibung: beschreibung.trim() || null,
      ziel_wert: zielWertZahl,
      aktueller_wert: 0,
      belohnung: belohnung.trim() || null,
      status: "aktiv",
    });

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    await supabase.from("feed").insert({
      familie_id: familieId,
      mitglied_id: mitgliedId,
      text: `${mitgliedName} hat ein neues Ziel gestartet: "${titel.trim()}"`,
      xp: 0,
    });

    const neueAchievements = await pruefeAchievements(mitgliedId);

    if (neueAchievements.length > 0) {
      setAchievementQueue(neueAchievements);
      await achievementFeedEintraege(
        neueAchievements,
        familieId,
        mitgliedId,
        mitgliedName
      );
    }

    const neueLevel = await pruefeLevelUps(mitgliedId);

    if (neueLevel.length > 0) {
      setLevelQueue(neueLevel);
      await levelFeedEintraege(neueLevel, familieId, mitgliedId, mitgliedName);
    }

    setTitel("");
    setBeschreibung("");
    setZielWert("");
    setBelohnung("");
    setFormularOffen(false);
    setLoading(false);

    await ladeZiele();
  }

  async function fortschrittPlus(ziel: Ziel) {
    if (!mitgliedId || !familieId) return;
    if (ziel.status === "erreicht") return;
    if (loadingZielId) return;

    setLoadingZielId(ziel.id);

    try {
      const neuerWert = Number(ziel.aktueller_wert) + 1;
      const erreicht = neuerWert >= Number(ziel.ziel_wert);

      const { error } = await supabase
        .from("ziele")
        .update({
          aktueller_wert: neuerWert,
          status: erreicht ? "erreicht" : "aktiv",
        })
        .eq("id", ziel.id)
        .neq("status", "erreicht");

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      await supabase.from("feed").insert({
        familie_id: familieId,
        mitglied_id: mitgliedId,
        text: erreicht
          ? `${mitgliedName} hat das Ziel "${ziel.titel}" erreicht`
          : `${mitgliedName} machte Fortschritt beim Ziel "${ziel.titel}"`,
        xp: 0,
      });

      const neueAchievements = await pruefeAchievements(mitgliedId);

      if (neueAchievements.length > 0) {
        setAchievementQueue(neueAchievements);
        await achievementFeedEintraege(
          neueAchievements,
          familieId,
          mitgliedId,
          mitgliedName
        );
      }

      const neueLevel = await pruefeLevelUps(mitgliedId);

      if (neueLevel.length > 0) {
        setLevelQueue(neueLevel);
        await levelFeedEintraege(neueLevel, familieId, mitgliedId, mitgliedName);
      }

      await ladeZiele();
    } finally {
      setLoadingZielId(null);
    }
  }

  function closeAchievementPopup() {
    setAchievementQueue((aktuell) => aktuell.slice(1));
  }

  function closeLevelPopup() {
    setLevelQueue((aktuell) => aktuell.slice(1));
  }

  const aktiveZiele = ziele.filter((ziel) => ziel.status !== "erreicht");
  const erreichteZiele = ziele.filter((ziel) => ziel.status === "erreicht");

  const durchschnittFortschritt =
    ziele.length > 0
      ? Math.round(
          ziele.reduce((sum, ziel) => {
            const wert = Number(ziel.ziel_wert) || 1;
            const aktuell = Number(ziel.aktueller_wert) || 0;
            return sum + Math.min(100, Math.round((aktuell / wert) * 100));
          }, 0) / ziele.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-32 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-5 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight">
                  Ziele
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Wer möchtest du werden? Setze dir Ziele und wachse Schritt für Schritt.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner">
                🎯
              </div>
            </div>
          </div>

          {!seiteLaedt && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{aktiveZiele.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Aktiv
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{erreichteZiele.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Erreicht
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{durchschnittFortschritt}%</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Reise
                </p>
              </div>
            </div>
          )}
        </header>

        {fehler && (
          <div className="mb-4 rounded-3xl bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Ziele konnten nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        <button
          onClick={() => setFormularOffen((offen) => !offen)}
          className="mb-4 w-full rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center font-black shadow-[0_10px_30px_rgba(54,42,25,0.06)] active:scale-[0.99]"
        >
          {formularOffen ? "Ziel-Formular schließen" : "+ Neues Ziel"}
        </button>

        {formularOffen && !fehler && (
          <form
            onSubmit={zielErstellen}
            className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
          >
            <div className="mb-4">
              <h2 className="text-xl font-black">Neues Ziel</h2>
              <p className="mt-1 text-sm text-[#776B5B]">
                Ein Ziel ist ein Versprechen an dein zukünftiges Ich.
              </p>
            </div>

            <div className="space-y-3">
              <input
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                placeholder="z.B. 30 Tage Lesen"
                className="w-full rounded-2xl bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <textarea
                value={beschreibung}
                onChange={(e) => setBeschreibung(e.target.value)}
                placeholder="Beschreibung optional"
                className="min-h-24 w-full rounded-2xl bg-[#FBF4EA] p-4 outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <input
                value={zielWert}
                onChange={(e) => setZielWert(e.target.value)}
                placeholder="Zielwert z.B. 30"
                type="number"
                min="1"
                className="w-full rounded-2xl bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <input
                value={belohnung}
                onChange={(e) => setBelohnung(e.target.value)}
                placeholder="Belohnung z.B. Kinoabend"
                className="w-full rounded-2xl bg-[#FBF4EA] p-4 outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-gradient-to-br from-[#20362B] to-[#4D8A5C] p-4 font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(54,42,25,0.08)] disabled:opacity-60"
              >
                {loading ? "Speichere..." : "Ziel erstellen 🎯"}
              </button>
            </div>
          </form>
        )}

        <section>
          <div className="mb-3">
            <h2 className="text-xl font-black">Persönliche Ziele</h2>
            <p className="text-sm text-[#776B5B]">
              Fortschritt entsteht durch Wiederholung.
            </p>
          </div>

          {seiteLaedt && (
            <div className="rounded-3xl bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              Lade Ziele...
            </div>
          )}

          {!seiteLaedt && !fehler && ziele.length === 0 && (
            <div className="rounded-3xl bg-[#FFF9EF] p-5 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <p className="text-3xl">🌱</p>
              <p className="mt-2 font-black">Noch keine Ziele</p>
              <p className="text-sm text-[#776B5B]">
                Erstelle dein erstes persönliches Ziel.
              </p>
            </div>
          )}

          {!seiteLaedt && !fehler && ziele.length > 0 && (
            <div className="space-y-3">
              {ziele.map((ziel) => {
                const zielWertSafe = Number(ziel.ziel_wert) || 1;
                const aktuellerWertSafe = Number(ziel.aktueller_wert) || 0;
                const progress = Math.min(
                  100,
                  Math.round((aktuellerWertSafe / zielWertSafe) * 100)
                );

                const erreicht = ziel.status === "erreicht";
                const speichert = loadingZielId === ziel.id;

                return (
                  <div
                    key={ziel.id}
                    className={`rounded-[1.45rem] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)] ${
                      erreicht ? "bg-[#EAF5E9]" : "bg-[#FFF9EF]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                          erreicht ? "bg-[#FFF9EF]" : "bg-[#EFE6D8]"
                        }`}
                      >
                        {erreicht ? "🏆" : "🎯"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-black">
                              {ziel.titel}
                            </h3>

                            {ziel.beschreibung && (
                              <p className="mt-1 text-sm leading-6 text-[#776B5B]">
                                {ziel.beschreibung}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-xl font-black text-[#2F5D43]">
                              {aktuellerWertSafe}/{zielWertSafe}
                            </p>
                            <p className="text-[10px] font-bold text-[#8C7655]">
                              {progress}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#E8DECF]">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              erreicht
                                ? "bg-gradient-to-r from-[#76A56F] to-[#4D8A5C]"
                                : "bg-gradient-to-r from-[#20362B] to-[#4D8A5C]"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {ziel.belohnung && (
                          <p className="mt-3 rounded-2xl bg-[#FBF4EA] p-3 text-sm font-bold text-[#776B5B]">
                            🎁 {ziel.belohnung}
                          </p>
                        )}

                        <div className="mt-4">
                          {erreicht ? (
                            <div className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-[#2F6A44]">
                              Ziel erreicht
                            </div>
                          ) : (
                            <button
                              onClick={() => fortschrittPlus(ziel)}
                              disabled={speichert || Boolean(loadingZielId)}
                              className="w-full rounded-2xl bg-gray-900 p-3 font-black text-[#FFF7EA] disabled:opacity-60 active:scale-[0.98]"
                            >
                              {speichert ? "Speichert..." : "+1 Fortschritt"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {achievementPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182019]/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.55rem] bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-6 text-center text-[#FFF7EA] shadow-[0_20px_55px_rgba(32,54,43,0.28)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.45rem] bg-[#FFF7EA]/15 text-5xl shadow-[0_10px_30px_rgba(54,42,25,0.06)]-inner">
              {achievementPopup.icon || "🏅"}
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[#DCEED8]">
              Achievement freigeschaltet
            </p>

            <h2 className="mt-3 text-3xl font-black">
              {achievementPopup.titel}
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-[#FFF7EA]/70">
              {achievementPopup.beschreibung ||
                "Du hast einen neuen Meilenstein erreicht."}
            </p>

            {achievementPopup.xp_bonus > 0 && (
              <div className="mt-5 rounded-3xl bg-[#FFF7EA]/10 p-4">
                <p className="text-sm text-[#FFF7EA]/60">Bonus</p>
                <p className="text-3xl font-black text-[#DCEED8]">
                  +{achievementPopup.xp_bonus} XP
                </p>
              </div>
            )}

            <button
              onClick={closeAchievementPopup}
              className="mt-6 w-full rounded-2xl bg-[#FFF9EF] p-4 font-black text-[#182019] active:scale-[0.98]"
            >
              Weiter
            </button>
          </div>
        </div>
      )}

      {levelPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#182019]/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.55rem] bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-6 text-center text-[#FFF7EA] shadow-[0_20px_55px_rgba(32,54,43,0.28)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.45rem] bg-[#FFF7EA]/15 text-5xl shadow-[0_10px_30px_rgba(54,42,25,0.06)]-inner">
              {levelPopup.icon || "🌱"}
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[#DCEED8]">
              Level erreicht
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Level {levelPopup.level}
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-[#FFF7EA]/70">
              {levelPopup.titel}
            </p>

            <div className="mt-5 rounded-3xl bg-[#FFF7EA]/10 p-4">
              <p className="text-sm text-[#FFF7EA]/60">Meilenstein</p>
              <p className="text-3xl font-black text-[#DCEED8]">
                {levelPopup.xp_erreicht} XP
              </p>
            </div>

            <button
              onClick={closeLevelPopup}
              className="mt-6 w-full rounded-2xl bg-[#FFF9EF] p-4 font-black text-[#182019] active:scale-[0.98]"
            >
              Weiter
            </button>
          </div>
        </div>
      )}

      <AppNav />
    </main>
  );
}
