"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Routine = {
  id: string;
  titel: string;
  beschreibung: string | null;
  xp: number;
  aktiv: boolean;
};

export default function RoutinenPage() {
  const [routinen, setRoutinen] = useState<Routine[]>([]);
  const [mitgliedId, setMitgliedId] = useState<string | null>(null);

  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [xp, setXp] = useState("5");

  const [heuteLogs, setHeuteLogs] = useState<string[]>([]);

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

    setHeuteLogs(logs?.map((l) => l.routine_id) || []);
  }

  async function routineErstellen() {
    if (!mitgliedId || !titel) return;

    await supabase.from("routinen").insert({
      mitglied_id: mitgliedId,
      titel,
      beschreibung,
      xp: Number(xp),
      aktiv: true,
    });

    setTitel("");
    setBeschreibung("");
    setXp("5");

    ladeDaten();
  }

  async function routineErledigen(routine: Routine) {
    if (!mitgliedId) return;

    if (heuteLogs.includes(routine.id)) return;

    const heute = new Date().toISOString().split("T")[0];

    await supabase.from("routine_logs").insert({
      routine_id: routine.id,
      mitglied_id: mitgliedId,
      datum: heute,
    });

    const { data: aktuellesMitglied } = await supabase
      .from("mitglieder")
      .select("xp")
      .eq("id", mitgliedId)
      .single();

    await supabase
      .from("mitglieder")
      .update({
        xp: (aktuellesMitglied?.xp || 0) + routine.xp,
      })
      .eq("id", mitgliedId);

    ladeDaten();
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-2">🔁 Routinen</h1>

        <p className="text-gray-500 mb-6">
          Kleine Gewohnheiten. Große Wirkung.
        </p>

        <div className="bg-white rounded-3xl p-5 shadow mb-6">
          <h2 className="font-black text-xl mb-4">
            Neue Routine
          </h2>

          <div className="space-y-3">
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. 10 Seiten lesen"
              className="w-full rounded-2xl border p-3"
            />

            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Beschreibung"
              className="w-full rounded-2xl border p-3"
            />

            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(e.target.value)}
              className="w-full rounded-2xl border p-3"
            />

            <button
              onClick={routineErstellen}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 font-black text-white"
            >
              🔁 Routine erstellen
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {routinen.map((routine) => {
            const erledigt = heuteLogs.includes(routine.id);

            return (
              <div
                key={routine.id}
                className="bg-white rounded-3xl p-5 shadow"
              >
                <h2 className="text-xl font-black">
                  {routine.titel}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {routine.beschreibung}
                </p>

                <p className="mt-3 font-bold text-blue-600">
                  +{routine.xp} XP
                </p>

                <div className="mt-4">
                  {erledigt ? (
                    <div className="rounded-2xl bg-green-100 p-3 text-center font-black text-green-700">
                      ✅ Heute erledigt
                    </div>
                  ) : (
                    <button
                      onClick={() => routineErledigen(routine)}
                      className="w-full rounded-2xl bg-gray-900 p-3 font-black text-white"
                    >
                      🔥 Erledigen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AppNav />
    </main>
  );
}