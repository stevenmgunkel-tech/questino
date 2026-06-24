"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";
import {
  pruefeAchievements,
  type FreigeschaltetesAchievement,
} from "@/lib/achievements";

type Ziel = {
  id: string;
  titel: string;
  beschreibung: string | null;
  ziel_wert: number;
  aktueller_wert: number;
  belohnung: string | null;
  status: string;
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
  const [loadingZielId, setLoadingZielId] = useState<string | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<
    FreigeschaltetesAchievement[]
  >([]);

  const achievementPopup = achievementQueue[0] || null;

  useEffect(() => {
    ladeZiele();
  }, []);

  async function ladeZiele() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("id, familie_id, name")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) return;

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
      return;
    }

    setZiele(data || []);
  }

  async function achievementFeedEintraege(
    neueAchievements: FreigeschaltetesAchievement[]
  ) {
    if (!familieId || !mitgliedId) return;

    for (const achievement of neueAchievements) {
      await supabase.from("feed").insert({
        familie_id: familieId,
        mitglied_id: mitgliedId,
        text: `${mitgliedName} hat das Achievement "${achievement.titel}" freigeschaltet`,
        xp: achievement.xp_bonus,
      });
    }
  }

  async function zielErstellen() {
    if (!mitgliedId || !titel.trim() || !zielWert) return;

    setLoading(true);

    const { error } = await supabase.from("ziele").insert({
      mitglied_id: mitgliedId,
      titel,
      beschreibung,
      ziel_wert: Number(zielWert),
      aktueller_wert: 0,
      belohnung,
      status: "aktiv",
    });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const neueAchievements = await pruefeAchievements(mitgliedId);

    if (neueAchievements.length > 0) {
      setAchievementQueue(neueAchievements);
      await achievementFeedEintraege(neueAchievements);
    }

    setTitel("");
    setBeschreibung("");
    setZielWert("");
    setBelohnung("");
    setLoading(false);
    ladeZiele();
  }

  async function fortschrittPlus(ziel: Ziel) {
    if (!mitgliedId) return;

    setLoadingZielId(ziel.id);

    const neuerWert = Number(ziel.aktueller_wert) + 1;
    const erreicht = neuerWert >= Number(ziel.ziel_wert);

    const { error } = await supabase
      .from("ziele")
      .update({
        aktueller_wert: neuerWert,
        status: erreicht ? "erreicht" : "aktiv",
      })
      .eq("id", ziel.id);

    if (error) {
      console.error(error);
      setLoadingZielId(null);
      return;
    }

    if (erreicht && familieId) {
      await supabase.from("feed").insert({
        familie_id: familieId,
        mitglied_id: mitgliedId,
        text: `${mitgliedName} hat das Ziel "${ziel.titel}" erreicht`,
        xp: 0,
      });
    }

    const neueAchievements = await pruefeAchievements(mitgliedId);

    if (neueAchievements.length > 0) {
      setAchievementQueue(neueAchievements);
      await achievementFeedEintraege(neueAchievements);
    }

    setLoadingZielId(null);
    ladeZiele();
  }

  function closeAchievementPopup() {
    setAchievementQueue((aktuell) => aktuell.slice(1));
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-black">🎯 Persönliche Ziele</h1>
        <p className="mb-6 text-gray-500">
          Wer möchtest du werden? Setze dir Ziele und wachse Schritt für Schritt.
        </p>

        <div className="mb-6 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">Neues Ziel</h2>

          <div className="space-y-3">
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. 30 Tage Lesen"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Beschreibung"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <input
              value={zielWert}
              onChange={(e) => setZielWert(e.target.value)}
              placeholder="Zielwert z.B. 30"
              type="number"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <input
              value={belohnung}
              onChange={(e) => setBelohnung(e.target.value)}
              placeholder="Belohnung z.B. 1h Gaming"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <button
              onClick={zielErstellen}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 font-black text-white shadow disabled:opacity-60"
            >
              {loading ? "Speichere..." : "🎯 Ziel erstellen"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {ziele.map((ziel) => {
            const progress = Math.min(
              100,
              Math.round(
                (Number(ziel.aktueller_wert) / Number(ziel.ziel_wert)) * 100
              )
            );

            const erreicht = ziel.status === "erreicht";
            const speichert = loadingZielId === ziel.id;

            return (
              <div key={ziel.id} className="rounded-3xl bg-white p-5 shadow">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">{ziel.titel}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {ziel.beschreibung}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">
                      {ziel.aktueller_wert}/{ziel.ziel_wert}
                    </p>
                    <p className="text-xs text-gray-400">Fortschritt</p>
                  </div>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      erreicht
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {ziel.belohnung && (
                  <p className="mt-3 text-sm font-bold text-gray-600">
                    🎁 Belohnung: {ziel.belohnung}
                  </p>
                )}

                <div className="mt-4">
                  {erreicht ? (
                    <div className="rounded-2xl bg-green-100 p-3 text-center font-black text-green-700">
                      🏆 Ziel erreicht
                    </div>
                  ) : (
                    <button
                      onClick={() => fortschrittPlus(ziel)}
                      disabled={speichert}
                      className="w-full rounded-2xl bg-gray-900 p-3 font-black text-white disabled:opacity-60"
                    >
                      {speichert ? "Speichert..." : "+1 Fortschritt"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {ziele.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
              Noch keine Ziele angelegt.
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
