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
          {staerken.map((staerke) => (
            <div
              key={staerke.id}
              className="bg-white rounded-3xl p-5 shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">
                  {icons[staerke.name] || "🌱"}
                </div>

                <div>
                  <h2 className="font-bold text-lg">{staerke.name}</h2>
                  <p className="text-sm text-gray-500">Entwicklungspunkte</p>
                </div>
              </div>

              <div className="text-2xl font-black text-blue-600">
                {staerke.punkte}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}