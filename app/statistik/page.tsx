"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

export default function StatistikPage() {
  const [xp, setXp] = useState(0);
  const [besteStaerke, setBesteStaerke] = useState("Keine");
  const [besteStaerkePunkte, setBesteStaerkePunkte] = useState(0);
  const [zieleErreicht, setZieleErreicht] = useState(0);
  const [routinenErledigt, setRoutinenErledigt] = useState(0);
  const [missionenErledigt, setMissionenErledigt] = useState(0);

  useEffect(() => {
    ladeStatistik();
  }, []);

  async function ladeStatistik() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("id, xp")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) return;

    setXp(mitglied.xp || 0);

    const { data: staerken } = await supabase
      .from("mitglied_staerken")
      .select(`
        punkte,
        staerken (
          name
        )
      `)
      .eq("mitglied_id", mitglied.id);

    if (staerken && staerken.length > 0) {
      const sortiert = [...staerken].sort(
        (a: any, b: any) => b.punkte - a.punkte
      );

      const beste = sortiert[0] as any;

      setBesteStaerke(beste?.staerken?.name || "Keine");
      setBesteStaerkePunkte(beste?.punkte || 0);
    }

    const { count: zielCount } = await supabase
      .from("ziele")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitglied.id)
      .eq("status", "erreicht");

    setZieleErreicht(zielCount || 0);

    const { count: routineCount } = await supabase
      .from("routine_logs")
      .select("*", { count: "exact", head: true })
      .eq("mitglied_id", mitglied.id);

    setRoutinenErledigt(routineCount || 0);

    const { count: missionCount } = await supabase
      .from("missionen")
      .select("*", { count: "exact", head: true })
      .eq("zugewiesen_an", mitglied.id)
      .eq("status", "erledigt");

    setMissionenErledigt(missionCount || 0);
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-xl">
          <h1 className="text-3xl font-black">📊 Statistiken</h1>
          <p className="mt-2 text-sm text-white/80">
            Deine Entwicklung auf einen Blick.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-gray-500 text-sm">⚡ XP gesamt</p>
            <h2 className="text-4xl font-black text-blue-600">{xp}</h2>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-gray-500 text-sm mb-2">🌱 Beste Stärke</p>
            <h2 className="text-2xl font-black">{besteStaerke}</h2>
            <p className="text-blue-600 font-bold mt-1">
              {besteStaerkePunkte} Punkte
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-gray-500 text-sm">🎯 Ziele erreicht</p>
            <h2 className="text-4xl font-black text-green-600">
              {zieleErreicht}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-gray-500 text-sm">🔁 Routinen erledigt</p>
            <h2 className="text-4xl font-black text-purple-600">
              {routinenErledigt}
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow">
            <p className="text-gray-500 text-sm">🔥 Missionen erledigt</p>
            <h2 className="text-4xl font-black text-orange-600">
              {missionenErledigt}
            </h2>
          </div>
        </div>
      </div>

      <AppNav />
    </main>
  );
}