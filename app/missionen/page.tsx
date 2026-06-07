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
};

export default function MissionenPage() {
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [missionen, setMissionen] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);

  async function getMitglied() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return null;
    }

    const { data } = await supabase
      .from("mitglieder")
      .select("*")
      .eq("auth_user_id", userData.user.id)
      .single();

    return data;
  }

  async function loadMissionen() {
    const mitglied = await getMitglied();

    if (!mitglied) {
      return;
    }

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

    const { error } = await supabase.from("missionen").insert({
      familie_id: mitglied.familie_id,
      titel,
      beschreibung,
      xp: 10,
      status: "offen",
      erstellt_von: mitglied.id,
      zugewiesen_an: mitglied.id,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitel("");
    setBeschreibung("");
    loadMissionen();
  }

  useEffect(() => {
    loadMissionen();
  }, []);

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

                  <div className="rounded-2xl bg-blue-50 px-3 py-2 text-xl">
                    🔥
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