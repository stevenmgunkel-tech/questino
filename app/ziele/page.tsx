"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Ziel = {
  id: string;
  titel: string;
  beschreibung: string | null;
  ziel_wert: number;
  aktueller_wert: number;
  belohnung: string | null;
  status: string;
};

export default function ZielePage() {
  const [ziele, setZiele] = useState<Ziel[]>([]);
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [zielWert, setZielWert] = useState("");
  const [belohnung, setBelohnung] = useState("");
  const [mitgliedId, setMitgliedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ladeZiele();
  }, []);

  async function ladeZiele() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) return;

    setMitgliedId(mitglied.id);

    const { data, error } = await supabase
      .from("ziele")
      .select("*")
      .eq("mitglied_id", mitglied.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setZiele(data || []);
  }

  async function zielErstellen() {
    if (!mitgliedId || !titel || !zielWert) return;

    setLoading(true);

    const { error } = await supabase.from("ziele").insert({
      mitglied_id: mitgliedId,
      titel,
      beschreibung,
      ziel_wert: Number(zielWert),
      aktueller_wert: 0,
      belohnung,
      status: "aktiv",
    });

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    setTitel("");
    setBeschreibung("");
    setZielWert("");
    setBelohnung("");
    ladeZiele();
  }

  async function fortschrittPlus(ziel: Ziel) {
    const neuerWert = Number(ziel.aktueller_wert) + 1;
    const erreicht = neuerWert >= Number(ziel.ziel_wert);

    const { error } = await supabase
      .from("ziele")
      .update({
        aktueller_wert: neuerWert,
        status: erreicht ? "erreicht" : "aktiv",
      })
      .eq("id", ziel.id);

    if (error) {
      console.error(error);
      return;
    }

    ladeZiele();
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-2">🎯 Persönliche Ziele</h1>
        <p className="text-gray-500 mb-6">
          Wer möchtest du werden? Setze dir Ziele und wachse Schritt für Schritt.
        </p>

        <div className="bg-white rounded-3xl p-5 shadow mb-6">
          <h2 className="text-xl font-black mb-4">Neues Ziel</h2>

          <div className="space-y-3">
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. 30 Tage Lesen"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Beschreibung"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <input
              value={zielWert}
              onChange={(e) => setZielWert(e.target.value)}
              placeholder="Zielwert z.B. 30"
              type="number"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <input
              value={belohnung}
              onChange={(e) => setBelohnung(e.target.value)}
              placeholder="Belohnung z.B. 1h Gaming"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <button
              onClick={zielErstellen}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-3 font-black text-white shadow"
            >
              {loading ? "Speichere..." : "🎯 Ziel erstellen"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {ziele.map((ziel) => {
            const progress = Math.min(
              100,
              Math.round((Number(ziel.aktueller_wert) / Number(ziel.ziel_wert)) * 100)
            );

            const erreicht = ziel.status === "erreicht";

            return (
              <div key={ziel.id} className="bg-white rounded-3xl p-5 shadow">
                <div className="flex justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">{ziel.titel}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {ziel.beschreibung}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">
                      {ziel.aktueller_wert}/{ziel.ziel_wert}
                    </p>
                    <p className="text-xs text-gray-400">Fortschritt</p>
                  </div>
                </div>

                <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      erreicht
                        ? "bg-gradient-to-r from-green-400 to-emerald-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {ziel.belohnung && (
                  <p className="mt-3 text-sm font-bold text-gray-600">
                    🎁 Belohnung: {ziel.belohnung}
                  </p>
                )}

                <div className="mt-4">
                  {erreicht ? (
                    <div className="rounded-2xl bg-green-100 p-3 text-center font-black text-green-700">
                      🏆 Ziel erreicht
                    </div>
                  ) : (
                    <button
                      onClick={() => fortschrittPlus(ziel)}
                      className="w-full rounded-2xl bg-gray-900 p-3 font-black text-white"
                    >
                      +1 Fortschritt
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {ziele.length === 0 && (
            <div className="bg-white rounded-3xl p-6 text-center shadow text-gray-500">
              Noch keine Ziele angelegt.
            </div>
          )}
        </div>
      </div>

      <AppNav />
    </main>
  );
}