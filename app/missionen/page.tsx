"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Mission = {
  id: string;
  titel: string;
  beschreibung: string | null;
  xp: number;
  status: string;
  zugewiesen_an: string;
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
  const [selectedStaerken, setSelectedStaerken] = useState<string[]>([]);

  useEffect(() => {
    loadMissionen();
  }, []);

  async function getMitglied() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return null;

    const { data } = await supabase
      .from("mitglieder")
      .select("*")
      .eq("auth_user_id", userData.user.id)
      .single();

    return data;
  }

  async function loadMissionen() {
    const mitglied = await getMitglied();
    if (!mitglied) return;

    const { data, error } = await supabase
      .from("missionen")
      .select("*")
      .eq("familie_id", mitglied.familie_id)
      .order("erstellt_am", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setMissionen(data || []);
  }

  async function createMission() {
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
        titel,
        beschreibung,
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

    setTitel("");
    setBeschreibung("");
    setSelectedStaerken([]);
    setLoading(false);
    loadMissionen();
  }

  async function completeMission(mission: Mission) {
    const mitglied = await getMitglied();

    if (!mitglied) return;

    const { error } = await supabase
      .from("missionen")
      .update({ status: "erledigt" })
      .eq("id", mission.id);

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

    await supabase
      .from("mitglieder")
      .update({
        xp: (mitglied.xp || 0) + mission.xp,
      })
      .eq("id", mitglied.id);

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

    loadMissionen();
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] px-5 pt-6 pb-32 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <p className="font-medium text-gray-500">Questino 🔥</p>
          <h1 className="text-3xl font-black">Missionen</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kleine Schritte. Große Wirkung.
          </p>
        </div>

        <section className="mb-6 rounded-[2rem] bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">Neue Mission</h2>

          <div className="space-y-3">
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. Zimmer aufräumen"
              className="w-full rounded-2xl bg-gray-100 p-4 font-bold outline-none"
            />

            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Beschreibung optional"
              className="min-h-24 w-full rounded-2xl bg-gray-100 p-4 outline-none"
            />

            <div>
              <p className="mb-3 font-black">
                🌱 Welche Stärken trainiert diese Mission?
              </p>

              <div className="grid grid-cols-2 gap-2">
                {staerken.map((staerke) => (
                  <button
                    key={staerke}
                    type="button"
                    onClick={() => {
                      if (selectedStaerken.includes(staerke)) {
                        setSelectedStaerken(
                          selectedStaerken.filter((s) => s !== staerke)
                        );
                      } else {
                        setSelectedStaerken([...selectedStaerken, staerke]);
                      }
                    }}
                    className={`rounded-2xl p-3 text-sm font-bold transition ${
                      selectedStaerken.includes(staerke)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {staerke}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={createMission}
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-4 font-black text-white shadow-xl disabled:opacity-60"
            >
              {loading ? "Speichern..." : "Mission erstellen 🚀"}
            </button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-black">Aktuelle Missionen</h2>

          <div className="space-y-3">
            {missionen.length === 0 && (
              <div className="rounded-3xl bg-white p-5 text-center shadow">
                <p className="text-3xl">🌱</p>
                <p className="mt-2 font-black">Noch keine Missionen</p>
                <p className="text-sm text-gray-500">
                  Erstelle die erste kleine Routine.
                </p>
              </div>
            )}

            {missionen.map((mission) => (
              <div key={mission.id} className="rounded-3xl bg-white p-4 shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{mission.titel}</h3>

                    {mission.beschreibung && (
                      <p className="mt-1 text-sm text-gray-500">
                        {mission.beschreibung}
                      </p>
                    )}

                    <p className="mt-2 text-xs font-bold text-blue-600">
                      {mission.xp} XP · {mission.status}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {mission.status === "offen" ? (
                      <button
                        onClick={() => completeMission(mission)}
                        className="rounded-2xl bg-green-500 px-3 py-2 font-black text-white"
                      >
                        ✅
                      </button>
                    ) : (
                      <div className="rounded-2xl bg-green-100 px-3 py-2 text-center font-black text-green-700">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AppNav />
    </main>
  );
}