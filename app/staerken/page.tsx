"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Staerke = {
  id: string;
  name: string;
  punkte: number;
};

const icons: Record<string, string> = {
  Verantwortung: "⭐",
  Disziplin: "💪",
  Fitness: "🏃",
  Mindset: "🧠",
  Hilfsbereitschaft: "❤️",
  Teamwork: "🤝",
  Kreativität: "🎨",
  Dankbarkeit: "🙏",
};

function getStaerkeLevel(punkte: number) {
  if (punkte >= 50) {
    return {
      level: 5,
      titel: "Vorbild",
      start: 50,
      next: 50,
    };
  }

  if (punkte >= 25) {
    return {
      level: 4,
      titel: "Planer",
      start: 25,
      next: 50,
    };
  }

  if (punkte >= 10) {
    return {
      level: 3,
      titel: "Lernender",
      start: 10,
      next: 25,
    };
  }

  if (punkte >= 5) {
    return {
      level: 2,
      titel: "Entdecker",
      start: 5,
      next: 10,
    };
  }

  return {
    level: 1,
    titel: "Anfänger",
    start: 0,
    next: 5,
  };
}

export default function StaerkenPage() {
  const [staerken, setStaerken] = useState<Staerke[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ladeStaerken();
  }, []);

  async function ladeStaerken() {
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

    const { data, error } = await supabase
      .from("mitglied_staerken")
      .select(`
        punkte,
        staerken (
          id,
          name
        )
      `)
      .eq("mitglied_id", mitglied.id);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const formatierteStaerken =
      data?.map((eintrag: any) => ({
        id: eintrag.staerken.id,
        name: eintrag.staerken.name,
        punkte: eintrag.punkte,
      })) || [];

    setStaerken(formatierteStaerken);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-2">🌱 Deine Stärken</h1>
        <p className="text-gray-500 mb-6">
          Hier siehst du, worin du gerade wächst.
        </p>

        {loading && (
          <div className="bg-white rounded-3xl p-6 shadow text-center text-gray-500">
            Lade Stärken...
          </div>
        )}

        {!loading && staerken.length === 0 && (
          <div className="bg-white rounded-3xl p-6 shadow text-center text-gray-500">
            Noch keine Stärken gesammelt.
          </div>
        )}

        <div className="space-y-4">
          {staerken.map((staerke) => {
            const levelInfo = getStaerkeLevel(staerke.punkte);

            const progress =
              levelInfo.next === levelInfo.start
                ? 100
                : Math.min(
                    100,
                    Math.round(
                      ((staerke.punkte - levelInfo.start) /
                        (levelInfo.next - levelInfo.start)) *
                        100
                    )
                  );

            return (
              <div
                key={staerke.id}
                className="bg-white rounded-3xl p-5 shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                    {icons[staerke.name] || "🌱"}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between gap-3">
                      <div>
                        <h2 className="font-black text-lg">{staerke.name}</h2>
                        <p className="text-sm text-gray-500">
                          Level {levelInfo.level} – {levelInfo.titel}
                        </p>
                      </div>

                      <div className="text-2xl font-black text-blue-600">
                        {staerke.punkte}
                      </div>
                    </div>

                    <div className="mt-4 h-3 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-gray-400">
                      {levelInfo.level >= 5
                        ? "Maximale Stärke erreicht 🔥"
                        : `${staerke.punkte} / ${levelInfo.next} Punkte bis Level ${
                            levelInfo.level + 1
                          }`}
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