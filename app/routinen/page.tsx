"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";
import {
  pruefeAchievements,
  type FreigeschaltetesAchievement,
} from "@/lib/achievements";

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
  const [achievementQueue, setAchievementQueue] = useState<
    FreigeschaltetesAchievement[]
  >([]);

  const achievementPopup = achievementQueue[0] || null;

  useEffect(() => {
    ladeDaten();
  }, []);

  async function ladeDaten() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) return;

    setMitgliedId(mitglied.id);

    const { data: staerkenData } = await supabase
      .from("staerken")
      .select("id, name")
      .order("name", { ascending: true });

    setStaerken(staerkenData || []);

    const { data: zieleData } = await supabase
      .from("ziele")
      .select("id, titel, ziel_wert, aktueller_wert, status")
      .eq("mitglied_id", mitglied.id)
      .eq("status", "aktiv")
      .order("created_at", { ascending: false });

    setZiele(zieleData || []);

    const { data: routinenData } = await supabase
      .from("routinen")
      .select("*")
      .eq("mitglied_id", mitglied.id)
      .eq("aktiv", true)
      .order("created_at", { ascending: false });

    setRoutinen(routinenData || []);

    const heute = new Date().toISOString().split("T")[0];

    const { data: logs } = await supabase
      .from("routine_logs")
      .select("routine_id")
      .eq("mitglied_id", mitglied.id)
      .eq("datum", heute);

    setHeuteLogs(logs?.map((log) => log.routine_id) || []);
  }

  function toggleStaerke(staerkeId: string) {
    setSelectedStaerken((current) =>
      current.includes(staerkeId)
        ? current.filter((id) => id !== staerkeId)
        : [...current, staerkeId]
    );
  }

  async function routineErstellen() {
    if (!mitgliedId || !titel.trim()) return;

    const { data: neueRoutine, error } = await supabase
      .from("routinen")
      .insert({
        mitglied_id: mitgliedId,
        titel,
        beschreibung,
        xp: Number(xp),
        aktiv: true,
      })
      .select("id")
      .single();

    if (error || !neueRoutine) {
      console.error(error);
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

    setTitel("");
    setBeschreibung("");
    setXp("5");
    setSelectedStaerken([]);
    setSelectedZiel("");

    ladeDaten();
  }

  async function routineErledigen(routine: Routine) {
    if (!mitgliedId) return;
    if (heuteLogs.includes(routine.id)) return;

    setLoadingRoutineId(routine.id);

    const heute = new Date().toISOString().split("T")[0];

    const { error: logError } = await supabase.from("routine_logs").insert({
      routine_id: routine.id,
      mitglied_id: mitgliedId,
      datum: heute,
    });

    if (logError) {
      console.error(logError);
      setLoadingRoutineId(null);
      return;
    }

    const { data: aktuellesMitglied } = await supabase
      .from("mitglieder")
      .select("xp, familie_id, name")
      .eq("id", mitgliedId)
      .single();

    await supabase
      .from("mitglieder")
      .update({
        xp: (aktuellesMitglied?.xp || 0) + routine.xp,
      })
      .eq("id", mitgliedId);

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
        }
      }
    }

    await supabase.from("feed").insert({
      familie_id: aktuellesMitglied?.familie_id,
      mitglied_id: mitgliedId,
      text: `${aktuellesMitglied?.name || "Jemand"} erledigte die Routine "${
        routine.titel
      }"`,
      xp: routine.xp,
    });

    const neueAchievements = await pruefeAchievements(mitgliedId);

    if (neueAchievements.length > 0) {
      setAchievementQueue(neueAchievements);

      for (const achievement of neueAchievements) {
        await supabase.from("feed").insert({
          familie_id: aktuellesMitglied?.familie_id,
          mitglied_id: mitgliedId,
          text: `${
            aktuellesMitglied?.name || "Jemand"
          } hat das Achievement "${achievement.titel}" freigeschaltet`,
          xp: achievement.xp_bonus,
        });
      }
    }

    setLoadingRoutineId(null);
    ladeDaten();
  }

  function closeAchievementPopup() {
    setAchievementQueue((aktuell) => aktuell.slice(1));
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-black">🔁 Routinen</h1>

        <p className="mb-6 text-gray-500">
          Kleine Gewohnheiten. Große Wirkung.
        </p>

        <div className="mb-6 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">Neue Routine</h2>

          <div className="space-y-3">
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. 10 Seiten lesen"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Beschreibung"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              placeholder="XP"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <div>
              <p className="mb-2 text-sm font-black text-gray-600">
                🌱 Trainierte Stärken
              </p>

              <div className="flex flex-wrap gap-2">
                {staerken.map((staerke) => {
                  const selected = selectedStaerken.includes(staerke.id);

                  return (
                    <button
                      key={staerke.id}
                      type="button"
                      onClick={() => toggleStaerke(staerke.id)}
                      className={`rounded-full px-3 py-2 text-xs font-black transition ${
                        selected
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {selected ? "✓ " : ""}
                      {staerke.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-black text-gray-600">
                🎯 Ziel verknüpfen
              </p>

              <select
                value={selectedZiel}
                onChange={(e) => setSelectedZiel(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
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
              onClick={routineErstellen}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 font-black text-white shadow"
            >
              🔁 Routine erstellen
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {routinen.map((routine) => {
            const erledigt = heuteLogs.includes(routine.id);
            const speichert = loadingRoutineId === routine.id;

            return (
              <div key={routine.id} className="rounded-3xl bg-white p-5 shadow">
                <h2 className="text-xl font-black">{routine.titel}</h2>

                {routine.beschreibung && (
                  <p className="mt-1 text-sm text-gray-500">
                    {routine.beschreibung}
                  </p>
                )}

                <p className="mt-3 font-bold text-blue-600">+{routine.xp} XP</p>

                <div className="mt-4">
                  {erledigt ? (
                    <div className="rounded-2xl bg-green-100 p-3 text-center font-black text-green-700">
                      ✅ Heute erledigt
                    </div>
                  ) : (
                    <button
                      onClick={() => routineErledigen(routine)}
                      disabled={speichert}
                      className="w-full rounded-2xl bg-gray-900 p-3 font-black text-white disabled:opacity-60"
                    >
                      {speichert ? "Speichert..." : "🔥 Erledigen"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {routinen.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
              Noch keine Routinen angelegt.
            </div>
          )}
        </div>
      </div>

      {achievementPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-center text-white shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white/15 text-5xl shadow-inner">
              {achievementPopup.icon || "🏅"}
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-emerald-200">
              Achievement freigeschaltet
            </p>

            <h2 className="mt-3 text-3xl font-black">
              {achievementPopup.titel}
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-white/70">
              {achievementPopup.beschreibung ||
                "Du hast einen neuen Meilenstein erreicht."}
            </p>

            {achievementPopup.xp_bonus > 0 && (
              <div className="mt-5 rounded-3xl bg-white/10 p-4">
                <p className="text-sm text-white/60">Bonus</p>
                <p className="text-3xl font-black text-emerald-200">
                  +{achievementPopup.xp_bonus} XP
                </p>
              </div>
            )}

            <button
              onClick={closeAchievementPopup}
              className="mt-6 w-full rounded-2xl bg-white p-4 font-black text-gray-900 active:scale-[0.98]"
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
