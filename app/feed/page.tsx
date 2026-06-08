"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type FeedEintrag = {
  id: string;
  text: string;
  xp: number;
  erstellt_am: string;
};

export default function FeedPage() {
  const [feed, setFeed] = useState<FeedEintrag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ladeFeed();
  }, []);

  async function ladeFeed() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("familie_id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("feed")
      .select("*")
      .eq("familie_id", mitglied.familie_id)
      .order("erstellt_am", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setFeed(data || []);
    setLoading(false);
  }

  function formatiereDatum(datum: string) {
    return new Date(datum).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-2">📢 Familien-Feed</h1>
        <p className="text-gray-500 mb-6">
          Hier siehst du, was eure Familie gemeinsam geschafft hat.
        </p>

        {loading && (
          <div className="bg-white rounded-3xl p-6 shadow text-center text-gray-500">
            Lade Feed...
          </div>
        )}

        {!loading && feed.length === 0 && (
          <div className="bg-white rounded-3xl p-6 shadow text-center text-gray-500">
            Noch keine Aktivitäten.
          </div>
        )}

        <div className="space-y-4">
          {feed.map((eintrag) => (
            <div key={eintrag.id} className="bg-white rounded-3xl p-5 shadow">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">
                  🌱
                </div>

                <div className="flex-1">
                  <p className="font-black text-lg">{eintrag.text}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      {formatiereDatum(eintrag.erstellt_am)}
                    </p>

                    <p className="font-black text-blue-600">
                      ⭐ +{eintrag.xp} XP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}