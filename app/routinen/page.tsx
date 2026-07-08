"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";
import {
  pruefeAchievements,
  type FreigeschaltetesAchievement,
} from "@/lib/achievements";
import { pruefeLevelUps, type LevelLog } from "@/lib/level";

type Routine = {
  id: string;
  titel: string;
  beschreibung: string | null;
  xp: number;
  aktiv: boolean;
};

type Staerke = {
  id: string;
  name: string;
};

type Ziel = {
  id: string;
  titel: string;
  ziel_wert: number;
  aktueller_wert: number;
  status: string;
};

type Mitglied = {
  id: string;
  familie_id: string;
  name: string;
  xp: number;
};

function heutigesDatum() {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = String(heute.getMonth() + 1).padStart(2, "0");
  const tag = String(heute.getDate()).padStart(2, "0");

  return `${jahr}-${monat}-${tag}`;
}

export default function RoutinenPage() {
  const [routinen, setRoutinen] = useState<Routine[]>([]);
  const [staerken, setStaerken] = useState<Staerke[]>([]);
  const [ziele, setZiele] = useState<Ziel[]>([]);
  const [mitgliedId, setMitgliedId] = useState<string | null>(null);

  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [xp, setXp] = useState("5");
  const [selectedStaerken, setSelectedStaerken] = useState<string[]>([]);
  const [selectedZiel, setSelectedZiel] = useState("");

  const [heuteLogs, setHeuteLogs] = useState<string[]>([]);
  const [loadingRoutineId, setLoadingRoutineId] = useState<string | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [seiteLaedt, setSeiteLaedt] = useState(true);
  const [fehler, setFehler] = useState("");
  const [formularOffen, setFormularOffen] = useState(false);

  const [achievementQueue, setAchievementQueue] = useState<
    FreigeschaltetesAchievement[]
  >([]);
  const [levelQueue, setLevelQueue] = useState<LevelLog[]>([]);

  const achievementPopup = achievementQueue[0] || null;
  const levelPopup = !achievementPopup ? levelQueue[0] || null : null;

  useEffect(() => {
    ladeDaten();
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

  async function ladeDaten() {
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

    const { data: staerkenData, error: staerkenError } = await supabase
      .from("staerken")
      .select("id, name")
      .order("name", { ascending: true });

    if (staerkenError) {
      console.error("Stärken laden Fehler:", staerkenError);
    }

    setStaerken((staerkenData || []) as Staerke[]);

    const { data: zieleData, error: zieleError } = await supabase
      .from("ziele")
      .select("id, titel, ziel_wert, aktueller_wert, status")
      .eq("mitglied_id", mitglied.id)
      .eq("status", "aktiv")
      .order("created_at", { ascending: false });

    if (zieleError) {
      console.error("Ziele laden Fehler:", zieleError);
    }

    setZiele((zieleData || []) as Ziel[]);

    const { data: routinenData, error: routinenError } = await supabase
      .from("routinen")
      .select("*")
      .eq("mitglied_id", mitglied.id)
      .eq("aktiv", true)
      .order("created_at", { ascending: false });

    if (routinenError) {
      setFehler(routinenError.message);
      setSeiteLaedt(false);
      return;
    }

    setRoutinen((routinenData || []) as Routine[]);

    const heute = heutigesDatum();

    const { data: logs, error: logsError } = await supabase
      .from("routine_logs")
      .select("routine_id")
      .eq("mitglied_id", mitglied.id)
      .eq("datum", heute);

    if (logsError) {
      console.error("Routine Logs laden Fehler:", logsError);
    }

    setHeuteLogs(logs?.map((log) => log.routine_id) || []);
    setSeiteLaedt(false);
  }

  function toggleStaerke(staerkeId: string) {
    setSelectedStaerken((current) =>
      current.includes(staerkeId)
        ? current.filter((id) => id !== staerkeId)
        : [...current, staerkeId]
    );
  }

  async function routineErstellen(e?: React.FormEvent) {
    e?.preventDefault();

    if (!mitgliedId) {
      alert("Mitglied nicht gefunden.");
      return;
    }

    if (!titel.trim()) {
      alert("Bitte einen Titel eingeben.");
      return;
    }

    const xpWert = Number(xp);

    if (!Number.isFinite(xpWert) || xpWert <= 0) {
      alert("Bitte gültige XP eingeben.");
      return;
    }

    setLoadingCreate(true);

    const { data: neueRoutine, error } = await supabase
      .from("routinen")
      .insert({
        mitglied_id: mitgliedId,
        titel: titel.trim(),
        beschreibung: beschreibung.trim() || null,
        xp: xpWert,
        aktiv: true,
      })
      .select("id")
      .single();

    if (error || !neueRoutine) {
      console.error(error);
      alert(error?.message || "Routine konnte nicht erstellt werden.");
      setLoadingCreate(false);
      return;
    }

    if (selectedStaerken.length > 0) {
      await supabase.from("routine_staerken").insert(
        selectedStaerken.map((staerkeId) => ({
          routine_id: neueRoutine.id,
          staerke_id: staerkeId,
        }))
      );
    }

    if (selectedZiel) {
      await supabase.from("ziel_routinen").insert({
        routine_id: neueRoutine.id,
        ziel_id: selectedZiel,
      });
    }

    const neueAchievements = await pruefeAchievements(mitgliedId);

    if (neueAchievements.length > 0) {
      setAchievementQueue(neueAchievements);
    }

    const neueLevel = await pruefeLevelUps(mitgliedId);

    if (neueLevel.length > 0) {
      setLevelQueue(neueLevel);
    }

    setTitel("");
    setBeschreibung("");
    setXp("5");
    setSelectedStaerken([]);
    setSelectedZiel("");
    setFormularOffen(false);
    setLoadingCreate(false);

    await ladeDaten();
  }

  async function updateFamilienXP(familieId: string, xpWert: number) {
    const { data: familienXP, error: familienXPError } = await supabase
      .from("familien_xp")
      .select("*")
      .eq("familie_id", familieId)
      .maybeSingle();

    if (familienXPError) {
      console.error("Familien XP Fehler:", familienXPError);
      return;
    }

    if (familienXP) {
      const { error } = await supabase
        .from("familien_xp")
        .update({
          xp: (familienXP.xp || 0) + xpWert,
        })
        .eq("id", familienXP.id);

      if (error) {
        console.error("Familien XP Update Fehler:", error);
      }

      return;
    }

    const { error } = await supabase.from("familien_xp").insert({
      familie_id: familieId,
      xp: xpWert,
    });

    if (error) {
      console.error("Familien XP Insert Fehler:", error);
    }
  }

  async function routineErledigen(routine: Routine) {
    if (!mitgliedId) return;
    if (heuteLogs.includes(routine.id)) return;
    if (loadingRoutineId) return;

    setLoadingRoutineId(routine.id);

    try {
      const heute = heutigesDatum();

      const { error: logError } = await supabase.from("routine_logs").insert({
        routine_id: routine.id,
        mitglied_id: mitgliedId,
        datum: heute,
      });

      if (logError) {
        console.error(logError);
        alert(logError.message);
        return;
      }

      const { data: aktuellesMitglied, error: mitgliedError } = await supabase
        .from("mitglieder")
        .select("xp, familie_id, name")
        .eq("id", mitgliedId)
        .single();

      if (mitgliedError || !aktuellesMitglied) {
        alert("Mitglied konnte nicht geladen werden.");
        return;
      }

      await supabase
        .from("mitglieder")
        .update({
          xp: (aktuellesMitglied.xp || 0) + routine.xp,
        })
        .eq("id", mitgliedId);

      await updateFamilienXP(aktuellesMitglied.familie_id, routine.xp);

      const { data: routineStaerken } = await supabase
        .from("routine_staerken")
        .select("staerke_id")
        .eq("routine_id", routine.id);

      if (routineStaerken && routineStaerken.length > 0) {
        for (const eintrag of routineStaerken) {
          const { data: vorhandeneStaerke } = await supabase
            .from("mitglied_staerken")
            .select("id, punkte")
            .eq("mitglied_id", mitgliedId)
            .eq("staerke_id", eintrag.staerke_id)
            .maybeSingle();

          if (vorhandeneStaerke) {
            await supabase
              .from("mitglied_staerken")
              .update({
                punkte: (vorhandeneStaerke.punkte || 0) + 1,
              })
              .eq("id", vorhandeneStaerke.id);
          } else {
            await supabase.from("mitglied_staerken").insert({
              mitglied_id: mitgliedId,
              staerke_id: eintrag.staerke_id,
              punkte: 1,
            });
          }
        }
      }

      const { data: verknuepfteZiele } = await supabase
        .from("ziel_routinen")
        .select("ziel_id")
        .eq("routine_id", routine.id);

      if (verknuepfteZiele && verknuepfteZiele.length > 0) {
        for (const eintrag of verknuepfteZiele) {
          const { data: ziel } = await supabase
            .from("ziele")
            .select("id, aktueller_wert, ziel_wert")
            .eq("id", eintrag.ziel_id)
            .single();

          if (ziel) {
            const neuerWert = Number(ziel.aktueller_wert) + 1;
            const erreicht = neuerWert >= Number(ziel.ziel_wert);

            await supabase
              .from("ziele")
              .update({
                aktueller_wert: neuerWert,
                status: erreicht ? "erreicht" : "aktiv",
              })
              .eq("id", ziel.id);

            if (erreicht) {
              await supabase.from("feed").insert({
                familie_id: aktuellesMitglied.familie_id,
                mitglied_id: mitgliedId,
                text: `${aktuellesMitglied.name || "Jemand"} hat ein Ziel erreicht`,
                xp: 0,
              });
            }
          }
        }
      }

      await supabase.from("feed").insert({
        familie_id: aktuellesMitglied.familie_id,
        mitglied_id: mitgliedId,
        text: `${aktuellesMitglied.name || "Jemand"} erledigte die Routine "${
          routine.titel
        }"`,
        xp: routine.xp,
      });

      const neueAchievements = await pruefeAchievements(mitgliedId);

      if (neueAchievements.length > 0) {
        setAchievementQueue(neueAchievements);

        for (const achievement of neueAchievements) {
          await supabase.from("feed").insert({
            familie_id: aktuellesMitglied.familie_id,
            mitglied_id: mitgliedId,
            text: `${
              aktuellesMitglied.name || "Jemand"
            } hat das Achievement "${achievement.titel}" freigeschaltet`,
            xp: achievement.xp_bonus,
          });
        }
      }

      const neueLevel = await pruefeLevelUps(mitgliedId);

      if (neueLevel.length > 0) {
        setLevelQueue(neueLevel);

        for (const level of neueLevel) {
          await supabase.from("feed").insert({
            familie_id: aktuellesMitglied.familie_id,
            mitglied_id: mitgliedId,
            text: `${
              aktuellesMitglied.name || "Jemand"
            } hat Level ${level.level} erreicht: ${level.titel}`,
            xp: 0,
          });
        }
      }

      await ladeDaten();
    } finally {
      setLoadingRoutineId(null);
    }
  }

  function closeAchievementPopup() {
    setAchievementQueue((aktuell) => aktuell.slice(1));
  }

  function closeLevelPopup() {
    setLevelQueue((aktuell) => aktuell.slice(1));
  }

  const heuteErledigt = routinen.filter((routine) =>
    heuteLogs.includes(routine.id)
  ).length;

  const heuteOffen = Math.max(0, routinen.length - heuteErledigt);

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
                  Routinen
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Kleine Gewohnheiten. Große Wirkung. Jeden Tag 1% besser.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner">
                🔁
              </div>
            </div>
          </div>

          {!seiteLaedt && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{routinen.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Aktiv
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{heuteErledigt}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Heute
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{heuteOffen}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Offen
                </p>
              </div>
            </div>
          )}
        </header>

        {fehler && (
          <div className="mb-4 rounded-3xl bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Routinen konnten nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        <button
          onClick={() => setFormularOffen((offen) => !offen)}
          className="mb-4 w-full rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center font-black shadow-[0_10px_30px_rgba(54,42,25,0.06)] active:scale-[0.99]"
        >
          {formularOffen ? "Routine schließen" : "+ Routine erstellen"}
        </button>

        {formularOffen && !fehler && (
          <form
            onSubmit={routineErstellen}
            className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
          >
            <div className="mb-4">
              <h2 className="text-xl font-black">Neue Routine</h2>
              <p className="mt-1 text-sm text-[#776B5B]">
                Baue eine kleine Gewohnheit, die dich täglich stärkt.
              </p>
            </div>

            <div className="space-y-3">
              <input
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                placeholder="z.B. 10 Seiten lesen"
                className="w-full rounded-2xl bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <textarea
                value={beschreibung}
                onChange={(e) => setBeschreibung(e.target.value)}
                placeholder="Beschreibung optional"
                className="min-h-24 w-full rounded-2xl bg-[#FBF4EA] p-4 outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <input
                type="number"
                min="1"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
                placeholder="XP"
                className="w-full rounded-2xl bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <div className="rounded-3xl bg-[#FBF4EA] p-4">
                <p className="mb-3 font-black">🌱 Trainierte Stärken</p>

                {staerken.length === 0 && (
                  <p className="rounded-2xl bg-[#FFF9EF] p-3 text-sm text-[#776B5B]">
                    Noch keine Stärken gefunden.
                  </p>
                )}

                {staerken.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {staerken.map((staerke) => {
                      const selected = selectedStaerken.includes(staerke.id);

                      return (
                        <button
                          key={staerke.id}
                          type="button"
                          onClick={() => toggleStaerke(staerke.id)}
                          className={`rounded-2xl p-3 text-sm font-bold transition active:scale-[0.98] ${
                            selected
                              ? "bg-[#2F5D43] text-[#FFF7EA]"
                              : "bg-[#FFF9EF] text-[#776B5B]"
                          }`}
                        >
                          {selected ? "✓ " : ""}
                          {staerke.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-3xl bg-[#FBF4EA] p-4">
                <p className="mb-3 font-black">🎯 Ziel verknüpfen</p>

                <select
                  value={selectedZiel}
                  onChange={(e) => setSelectedZiel(e.target.value)}
                  className="w-full rounded-2xl bg-[#FFF9EF] p-4 outline-none focus:ring-2 focus:ring-[#4D8A5C]"
                >
                  <option value="">Kein Ziel verknüpfen</option>

                  {ziele.map((ziel) => (
                    <option key={ziel.id} value={ziel.id}>
                      {ziel.titel} ({ziel.aktueller_wert}/{ziel.ziel_wert})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingCreate}
                className="w-full rounded-3xl bg-gradient-to-br from-[#20362B] to-[#4D8A5C] p-4 font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(54,42,25,0.08)] disabled:opacity-60"
              >
                {loadingCreate ? "Speichern..." : "Routine erstellen 🔁"}
              </button>
            </div>
          </form>
        )}

        <section>
          <div className="mb-3">
            <h2 className="text-xl font-black">Aktive Routinen</h2>
            <p className="text-sm text-[#776B5B]">
              Heute zählt, was du wirklich tust.
            </p>
          </div>

          {seiteLaedt && (
            <div className="rounded-3xl bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              Lade Routinen...
            </div>
          )}

          {!seiteLaedt && !fehler && routinen.length === 0 && (
            <div className="rounded-3xl bg-[#FFF9EF] p-5 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <p className="text-3xl">🌱</p>
              <p className="mt-2 font-black">Noch keine Routinen</p>
              <p className="text-sm text-[#776B5B]">
                Erstelle die erste kleine Gewohnheit.
              </p>
            </div>
          )}

          {!seiteLaedt && !fehler && routinen.length > 0 && (
            <div className="space-y-3">
              {routinen.map((routine) => {
                const erledigt = heuteLogs.includes(routine.id);
                const speichert = loadingRoutineId === routine.id;

                return (
                  <div
                    key={routine.id}
                    className={`rounded-[1.45rem] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)] ${
                      erledigt ? "bg-[#EAF5E9]" : "bg-[#FFF9EF]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                          erledigt ? "bg-[#FFF9EF]" : "bg-[#EFE6D8]"
                        }`}
                      >
                        {erledigt ? "✅" : "🔁"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-black">
                              {routine.titel}
                            </h3>

                            {routine.beschreibung && (
                              <p className="mt-1 text-sm leading-6 text-[#776B5B]">
                                {routine.beschreibung}
                              </p>
                            )}

                            <p className="mt-2 text-xs font-black text-[#2F5D43]">
                              +{routine.xp} XP
                            </p>
                          </div>

                          {erledigt ? (
                            <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-center text-sm font-black text-[#2F6A44]">
                              Heute
                            </div>
                          ) : (
                            <button
                              onClick={() => routineErledigen(routine)}
                              disabled={speichert || Boolean(loadingRoutineId)}
                              className="rounded-2xl bg-[#4D8A5C] px-4 py-2 text-sm font-black text-[#FFF7EA] shadow-[0_10px_30px_rgba(54,42,25,0.06)] disabled:opacity-60 active:scale-[0.97]"
                            >
                              {speichert ? "..." : "Erledigt"}
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
