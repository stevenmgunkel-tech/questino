"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";
import {
  pruefeAchievements,
  type FreigeschaltetesAchievement,
} from "@/lib/achievements";
import { pruefeLevelUps, type LevelLog } from "@/lib/level";

type Mission = {
  id: string;
  titel: string;
  beschreibung: string | null;
  xp: number;
  status: string;
  zugewiesen_an: string;
};

type Mitglied = {
  id: string;
  familie_id: string;
  name: string;
  xp: number;
};

type Familienwert = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
};

const staerken = [
  "Verantwortung",
  "Disziplin",
  "Fitness",
  "Mindset",
  "Hilfsbereitschaft",
  "Teamwork",
  "Kreativität",
  "Dankbarkeit",
];

export default function MissionenPage() {
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [missionen, setMissionen] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [seiteLaedt, setSeiteLaedt] = useState(true);
  const [fehler, setFehler] = useState("");

  const [formularOffen, setFormularOffen] = useState(false);
  const [selectedStaerken, setSelectedStaerken] = useState<string[]>([]);
  const [familienwerte, setFamilienwerte] = useState<Familienwert[]>([]);
  const [selectedFamilienwerte, setSelectedFamilienwerte] = useState<string[]>(
    []
  );

  const [completingIds, setCompletingIds] = useState<string[]>([]);
  const [achievementQueue, setAchievementQueue] = useState<
    FreigeschaltetesAchievement[]
  >([]);
  const [levelQueue, setLevelQueue] = useState<LevelLog[]>([]);

  const achievementPopup = achievementQueue[0] || null;
  const levelPopup = !achievementPopup ? levelQueue[0] || null : null;

  useEffect(() => {
    loadMissionen();
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

  async function loadMissionen() {
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

    const { data, error } = await supabase
      .from("missionen")
      .select("*")
      .eq("familie_id", mitglied.familie_id)
      .order("erstellt_am", { ascending: false });

    if (error) {
      setFehler(error.message);
      setSeiteLaedt(false);
      return;
    }

    setMissionen((data || []) as Mission[]);

    const { data: werte, error: werteError } = await supabase
      .from("familien_werte")
      .select("id, titel, beschreibung, icon")
      .eq("familie_id", mitglied.familie_id)
      .order("titel", { ascending: true });

    if (werteError) {
      console.error("Familienwerte laden Fehler:", werteError);
    }

    setFamilienwerte((werte || []) as Familienwert[]);
    setSeiteLaedt(false);
  }

  async function createMission(e?: React.FormEvent) {
    e?.preventDefault();

    if (!titel.trim()) {
      alert("Bitte einen Missionstitel eingeben.");
      return;
    }

    setLoading(true);

    const mitglied = await getMitglied();

    if (!mitglied) {
      alert("Mitglied nicht gefunden.");
      setLoading(false);
      return;
    }

    const { data: missionData, error } = await supabase
      .from("missionen")
      .insert({
        familie_id: mitglied.familie_id,
        titel: titel.trim(),
        beschreibung: beschreibung.trim() || null,
        xp: 10,
        status: "offen",
        erstellt_von: mitglied.id,
        zugewiesen_an: mitglied.id,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    if (missionData && selectedStaerken.length > 0) {
      const { data: dbStaerken } = await supabase.from("staerken").select("*");

      for (const selected of selectedStaerken) {
        const found = dbStaerken?.find((s) => s.name === selected);

        if (!found) continue;

        await supabase.from("mission_staerken").insert({
          mission_id: missionData.id,
          staerke_id: found.id,
          punkte: 1,
        });
      }
    }

    if (missionData && selectedFamilienwerte.length > 0) {
      for (const wertId of selectedFamilienwerte) {
        await supabase.from("mission_familienwerte").insert({
          mission_id: missionData.id,
          familienwert_id: wertId,
        });
      }
    }

    setTitel("");
    setBeschreibung("");
    setSelectedStaerken([]);
    setSelectedFamilienwerte([]);
    setFormularOffen(false);
    setLoading(false);

    await loadMissionen();
  }

  async function completeMission(mission: Mission) {
    if (mission.status !== "offen") return;
    if (completingIds.includes(mission.id)) return;

    setCompletingIds((ids) => [...ids, mission.id]);

    try {
      const mitglied = await getMitglied();

      if (!mitglied) {
        alert("Mitglied nicht gefunden.");
        return;
      }

      const { error } = await supabase
        .from("missionen")
        .update({ status: "erledigt" })
        .eq("id", mission.id)
        .eq("status", "offen");

      if (error) {
        alert(error.message);
        return;
      }

      await supabase.from("feed").insert({
        familie_id: mitglied.familie_id,
        mitglied_id: mitglied.id,
        text: `${mitglied.name} erledigte "${mission.titel}"`,
        xp: mission.xp,
      });

      await supabase
        .from("mitglieder")
        .update({
          xp: (mitglied.xp || 0) + mission.xp,
        })
        .eq("id", mitglied.id);

      const { data: familienXP, error: familienXPError } = await supabase
        .from("familien_xp")
        .select("*")
        .eq("familie_id", mitglied.familie_id)
        .maybeSingle();

      if (familienXPError) {
        console.error("Familien XP Fehler:", familienXPError);
      }

      if (familienXP) {
        const { error: updateFamilienXPError } = await supabase
          .from("familien_xp")
          .update({
            xp: (familienXP.xp || 0) + mission.xp,
          })
          .eq("id", familienXP.id);

        if (updateFamilienXPError) {
          console.error("Familien XP Update Fehler:", updateFamilienXPError);
        }
      } else {
        const { error: insertFamilienXPError } = await supabase
          .from("familien_xp")
          .insert({
            familie_id: mitglied.familie_id,
            xp: mission.xp,
          });

        if (insertFamilienXPError) {
          console.error("Familien XP Insert Fehler:", insertFamilienXPError);
        }
      }

      const { data: missionWerte } = await supabase
        .from("mission_familienwerte")
        .select("*")
        .eq("mission_id", mission.id);

      for (const wert of missionWerte || []) {
        const { data: vorhandeneWertPunkte } = await supabase
          .from("familienwert_punkte")
          .select("*")
          .eq("familie_id", mitglied.familie_id)
          .eq("familienwert_id", wert.familienwert_id)
          .maybeSingle();

        if (vorhandeneWertPunkte) {
          await supabase
            .from("familienwert_punkte")
            .update({
              punkte: (vorhandeneWertPunkte.punkte || 0) + 1,
            })
            .eq("id", vorhandeneWertPunkte.id);
        } else {
          await supabase.from("familienwert_punkte").insert({
            familie_id: mitglied.familie_id,
            familienwert_id: wert.familienwert_id,
            punkte: 1,
          });
        }

        await supabase.from("familienwert_logs").insert({
          familie_id: mitglied.familie_id,
          familienwert_id: wert.familienwert_id,
          mission_id: mission.id,
          punkte: 1,
        });
      }

      const { data: missionStaerken } = await supabase
        .from("mission_staerken")
        .select("*")
        .eq("mission_id", mission.id);

      for (const item of missionStaerken || []) {
        const { data: vorhandeneStaerke } = await supabase
          .from("mitglied_staerken")
          .select("*")
          .eq("mitglied_id", mitglied.id)
          .eq("staerke_id", item.staerke_id)
          .maybeSingle();

        if (vorhandeneStaerke) {
          await supabase
            .from("mitglied_staerken")
            .update({
              punkte: (vorhandeneStaerke.punkte || 0) + item.punkte,
            })
            .eq("id", vorhandeneStaerke.id);
        } else {
          await supabase.from("mitglied_staerken").insert({
            mitglied_id: mitglied.id,
            staerke_id: item.staerke_id,
            punkte: item.punkte,
          });
        }
      }

      const neueAchievements = await pruefeAchievements(mitglied.id);

      if (neueAchievements.length > 0) {
        setAchievementQueue(neueAchievements);

        for (const achievement of neueAchievements) {
          await supabase.from("feed").insert({
            familie_id: mitglied.familie_id,
            mitglied_id: mitglied.id,
            text: `${mitglied.name} hat das Achievement "${achievement.titel}" freigeschaltet`,
            xp: achievement.xp_bonus,
          });
        }
      }

      const neueLevel = await pruefeLevelUps(mitglied.id);

      if (neueLevel.length > 0) {
        setLevelQueue(neueLevel);

        for (const level of neueLevel) {
          await supabase.from("feed").insert({
            familie_id: mitglied.familie_id,
            mitglied_id: mitglied.id,
            text: `${mitglied.name} hat Level ${level.level} erreicht: ${level.titel}`,
            xp: 0,
          });
        }
      }

      await loadMissionen();
    } finally {
      setCompletingIds((ids) => ids.filter((id) => id !== mission.id));
    }
  }

  function toggleStaerke(staerke: string) {
    if (selectedStaerken.includes(staerke)) {
      setSelectedStaerken(selectedStaerken.filter((s) => s !== staerke));
    } else {
      setSelectedStaerken([...selectedStaerken, staerke]);
    }
  }

  function toggleFamilienwert(wertId: string) {
    if (selectedFamilienwerte.includes(wertId)) {
      setSelectedFamilienwerte(
        selectedFamilienwerte.filter((id) => id !== wertId)
      );
    } else {
      setSelectedFamilienwerte([...selectedFamilienwerte, wertId]);
    }
  }

  function closeAchievementPopup() {
    setAchievementQueue((aktuell) => aktuell.slice(1));
  }

  function closeLevelPopup() {
    setLevelQueue((aktuell) => aktuell.slice(1));
  }

  const offeneMissionen = missionen.filter(
    (mission) => mission.status === "offen"
  );
  const erledigteMissionen = missionen.filter(
    (mission) => mission.status === "erledigt"
  );

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
                  Missionen
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Kleine Schritte. Große Wirkung. Jeden Tag 1% besser.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-black shadow-inner">
                Q
              </div>
            </div>
          </div>

          {!seiteLaedt && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F6EAD8] p-3 text-[#8A4D1F]">
                <p className="text-xl font-black">{offeneMissionen.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#B07437]">
                  Offen
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{erledigteMissionen.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Erledigt
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">
                  {erledigteMissionen.reduce(
                    (sum, mission) => sum + (mission.xp || 0),
                    0
                  )}
                </p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  XP
                </p>
              </div>
            </div>
          )}
        </header>

        {fehler && (
          <div className="mb-4 rounded-3xl bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Missionen konnten nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        <button
          onClick={() => setFormularOffen((offen) => !offen)}
          className="mb-4 w-full rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center font-black shadow-[0_10px_30px_rgba(54,42,25,0.06)] active:scale-[0.99]"
        >
          {formularOffen ? "Mission schließen" : "+ Mission erstellen"}
        </button>

        {formularOffen && !fehler && (
          <form
            onSubmit={createMission}
            className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
          >
            <div className="mb-4">
              <h2 className="text-xl font-black">Neue Mission</h2>
              <p className="mt-1 text-sm text-[#776B5B]">
                Wähle eine kleine Aufgabe, die Wachstum auslöst.
              </p>
            </div>

            <div className="space-y-3">
              <input
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                placeholder="z.B. Zimmer aufräumen"
                className="w-full rounded-2xl bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <textarea
                value={beschreibung}
                onChange={(e) => setBeschreibung(e.target.value)}
                placeholder="Beschreibung optional"
                className="min-h-24 w-full rounded-2xl bg-[#FBF4EA] p-4 outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              />

              <div className="rounded-3xl bg-[#FBF4EA] p-4">
                <p className="mb-3 font-black">
                  🌱 Welche Stärken trainiert diese Mission?
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {staerken.map((staerke) => (
                    <button
                      key={staerke}
                      type="button"
                      onClick={() => toggleStaerke(staerke)}
                      className={`rounded-2xl p-3 text-sm font-bold transition active:scale-[0.98] ${
                        selectedStaerken.includes(staerke)
                          ? "bg-[#2F5D43] text-[#FFF7EA]"
                          : "bg-[#FFF9EF] text-[#776B5B]"
                      }`}
                    >
                      {staerke}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#FBF4EA] p-4">
                <p className="mb-3 font-black">
                  ❤️ Welche Familienwerte trainiert diese Mission?
                </p>

                {familienwerte.length === 0 && (
                  <p className="rounded-2xl bg-[#FFF9EF] p-3 text-sm text-[#776B5B]">
                    Noch keine Familienwerte angelegt.
                  </p>
                )}

                {familienwerte.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {familienwerte.map((wert) => (
                      <button
                        key={wert.id}
                        type="button"
                        onClick={() => toggleFamilienwert(wert.id)}
                        className={`rounded-2xl p-3 text-sm font-bold transition active:scale-[0.98] ${
                          selectedFamilienwerte.includes(wert.id)
                            ? "bg-[#8A4D6A] text-[#FFF7EA]"
                            : "bg-[#FFF9EF] text-[#776B5B]"
                        }`}
                      >
                        {wert.icon || "❤️"} {wert.titel}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-gradient-to-br from-[#20362B] to-[#4D8A5C] p-4 font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(54,42,25,0.08)] disabled:opacity-60"
              >
                {loading ? "Speichern..." : "Mission erstellen 🚀"}
              </button>
            </div>
          </form>
        )}

        <section>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-black">Aktuelle Missionen</h2>
              <p className="text-sm text-[#776B5B]">
                Heute zählt der nächste kleine Schritt.
              </p>
            </div>
          </div>

          {seiteLaedt && (
            <div className="rounded-3xl bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              Lade Missionen...
            </div>
          )}

          {!seiteLaedt && !fehler && missionen.length === 0 && (
            <div className="rounded-3xl bg-[#FFF9EF] p-5 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
              <p className="text-3xl">🌱</p>
              <p className="mt-2 font-black">Noch keine Missionen</p>
              <p className="text-sm text-[#776B5B]">
                Erstelle die erste kleine Aufgabe.
              </p>
            </div>
          )}

          {!seiteLaedt && !fehler && missionen.length > 0 && (
            <div className="space-y-3">
              {missionen.map((mission) => {
                const completing = completingIds.includes(mission.id);
                const erledigt = mission.status === "erledigt";

                return (
                  <div
                    key={mission.id}
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
                        {erledigt ? "✅" : "🔥"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-black">
                              {mission.titel}
                            </h3>

                            {mission.beschreibung && (
                              <p className="mt-1 text-sm leading-6 text-[#776B5B]">
                                {mission.beschreibung}
                              </p>
                            )}

                            <p className="mt-2 text-xs font-black text-[#2F5D43]">
                              {mission.xp} XP ·{" "}
                              {erledigt ? "erledigt" : "offen"}
                            </p>
                          </div>

                          {erledigt ? (
                            <div className="rounded-2xl bg-emerald-100 px-3 py-2 text-center text-sm font-black text-[#2F6A44]">
                              Fertig
                            </div>
                          ) : (
                            <button
                              onClick={() => completeMission(mission)}
                              disabled={completing}
                              className="rounded-2xl bg-[#4D8A5C] px-4 py-2 text-sm font-black text-[#FFF7EA] shadow-[0_10px_30px_rgba(54,42,25,0.06)] disabled:opacity-60 active:scale-[0.97]"
                            >
                              {completing ? "..." : "Erledigt"}
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
