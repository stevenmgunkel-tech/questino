"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Belohnung = {
  id: string;
  titel: string;
  beschreibung: string | null;
  kosten: number;
};

export default function BelohnungenPage() {
  const [belohnungen, setBelohnungen] = useState<Belohnung[]>([]);

  useEffect(() => {
    ladeBelohnungen();
  }, []);

  async function ladeBelohnungen() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("familie_id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) return;

    const { data, error } = await supabase
      .from("belohnungen")
      .select("*")
      .eq("familie_id", mitglied.familie_id)
      .order("kosten", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setBelohnungen(data || []);
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-2">🎁 Belohnungen</h1>
        <p className="text-gray-500 mb-6">
          Verdiente XP können in gemeinsame Erlebnisse wachsen.
        </p>

        <div className="space-y-4">
          {belohnungen.map((belohnung) => (
            <div key={belohnung.id} className="bg-white rounded-3xl p-5 shadow">
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{belohnung.titel}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {belohnung.beschreibung}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-blue-600">
                    {belohnung.kosten}
                  </p>
                  <p className="text-xs text-gray-400">XP</p>
                </div>
              </div>
            </div>
          ))}

          {belohnungen.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow text-gray-500">
              Noch keine Belohnungen angelegt.
            </div>
          )}
        </div>
      </div>

      <AppNav />
    </main>
  );
}