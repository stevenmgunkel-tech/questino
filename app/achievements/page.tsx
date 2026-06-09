"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Achievement = {
  id: string;
  key: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ladeAchievements();
  }, []);

  async function ladeAchievements() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) {
      setLoading(false);
      return;
    }

    const { data: alleAchievements } = await supabase
      .from("achievements")
      .select("id, key, titel, beschreibung, icon")
      .order("created_at", { ascending: true });

    setAchievements(alleAchievements || []);

    const { data: meineAchievements } = await supabase
      .from("mitglied_achievements")
      .select("achievement_id")
      .eq("mitglied_id", mitglied.id);

    setUnlockedIds(
      meineAchievements?.map((eintrag) => eintrag.achievement_id) || []
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-gray-900 to-gray-700 p-6 text-white shadow-xl">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-4xl font-black">
            Q
          </div>

          <h1 className="text-3xl font-black">Erfolge</h1>
          <p className="mt-2 text-sm text-white/70">
            Deine Reise wird sichtbar. Jeder Schritt zählt.
          </p>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
            Lade Erfolge...
          </div>
        )}

        {!loading && achievements.length === 0 && (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
            Noch keine Achievements angelegt.
          </div>
        )}

        <div className="space-y-4">
          {achievements.map((achievement) => {
            const unlocked = unlockedIds.includes(achievement.id);

            return (
              <div
                key={achievement.id}
                className={`rounded-3xl p-5 shadow transition ${
                  unlocked ? "bg-white" : "bg-white/60 opacity-70"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                      unlocked
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {unlocked ? achievement.icon || "🏆" : "🔒"}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-black">
                      {achievement.titel}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {achievement.beschreibung}
                    </p>

                    <p
                      className={`mt-2 text-xs font-black ${
                        unlocked ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {unlocked ? "Freigeschaltet" : "Noch gesperrt"}
                    </p>
                  </div>
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