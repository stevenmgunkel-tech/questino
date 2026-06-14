"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type FamilienWert = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
  punkte: number;
};

export default function FamilienwertePage() {
  const [werte, setWerte] = useState<FamilienWert[]>([]);
  const [familieId, setFamilieId] = useState<string | null>(null);

  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [icon, setIcon] = useState("❤️");

  useEffect(() => {
    ladeWerte();
  }, []);

  async function ladeWerte() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("familie_id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) return;

    setFamilieId(mitglied.familie_id);

    const { data: werteData, error } = await supabase
      .from("familien_werte")
      .select("*")
      .eq("familie_id", mitglied.familie_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    const { data: punkteData } = await supabase
      .from("familienwert_punkte")
      .select("familienwert_id, punkte")
      .eq("familie_id", mitglied.familie_id);

    const werteMitPunkten =
      werteData?.map((wert) => {
        const punkteEintrag = punkteData?.find(
          (p) => p.familienwert_id === wert.id
        );

        return {
          ...wert,
          punkte: punkteEintrag?.punkte || 0,
        };
      }) || [];

    const sortiert = werteMitPunkten.sort((a, b) => b.punkte - a.punkte);

    setWerte(sortiert);
  }

  async function wertErstellen() {
    if (!familieId || !titel) return;

    const { error } = await supabase.from("familien_werte").insert({
      familie_id: familieId,
      titel,
      beschreibung,
      icon,
    });

    if (error) {
      console.error(error);
      return;
    }

    setTitel("");
    setBeschreibung("");
    setIcon("❤️");

    ladeWerte();
  }

  const staerksterWert = werte.length > 0 ? werte[0] : null;
  const maxPunkte = Math.max(...werte.map((wert) => wert.punkte), 1);

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black">
            Q
          </div>

          <h1 className="text-3xl font-black">Familienwerte</h1>

          <p className="mt-2 text-sm text-white/70">
            Das sind nicht nur Wörter. Das lebt ihr als Familie.
          </p>
        </div>

        {staerksterWert && (
          <div className="mb-6 rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-bold text-gray-500">
              🏆 Euer stärkster Familienwert
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 text-3xl">
                {staerksterWert.icon || "❤️"}
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  {staerksterWert.titel}
                </h2>

                <p className="text-sm font-bold text-emerald-700">
                  {staerksterWert.punkte} Punkte
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">Neuen Wert erstellen</h2>

          <div className="space-y-3">
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Icon z.B. ❤️"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. Hilfsbereitschaft"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <textarea
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              placeholder="Was bedeutet dieser Wert für euch?"
              className="w-full rounded-2xl border border-gray-200 p-3 outline-none"
            />

            <button
              onClick={wertErstellen}
              className="w-full rounded-2xl bg-gray-900 p-3 font-black text-white shadow"
            >
              ❤️ Wert speichern
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-black">📊 Werte-Ranking</h2>
          <p className="text-sm text-gray-500">
            Welche Werte ihr durch Missionen lebt.
          </p>
        </div>

        <div className="space-y-4">
          {werte.map((wert, index) => {
            const progress = Math.round((wert.punkte / maxPunkte) * 100);

            return (
              <div key={wert.id} className="rounded-3xl bg-white p-5 shadow">
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                    {wert.icon || "❤️"}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black">
                          #{index + 1} {wert.titel}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          {wert.beschreibung || "Noch keine Beschreibung"}
                        </p>
                      </div>

                      <p className="text-2xl font-black text-emerald-700">
                        {wert.punkte}
                      </p>
                    </div>

                    <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-3 rounded-full bg-emerald-700 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {werte.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
              Noch keine Familienwerte angelegt.
            </div>
          )}
        </div>
      </div>

      <AppNav />
    </main>
  );
}