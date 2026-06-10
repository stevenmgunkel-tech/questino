"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type FamilienWert = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
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

    const { data, error } = await supabase
      .from("familien_werte")
      .select("*")
      .eq("familie_id", mitglied.familie_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setWerte(data || []);
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

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black">
            Q
          </div>

          <h1 className="text-3xl font-black">Familienwerte</h1>

          <p className="mt-2 text-sm text-white/70">
            Was euch als Familie wichtig ist.
          </p>
        </div>

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

        <div className="space-y-4">
          {werte.map((wert) => (
            <div key={wert.id} className="rounded-3xl bg-white p-5 shadow">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                  {wert.icon || "❤️"}
                </div>

                <div>
                  <h2 className="text-xl font-black">{wert.titel}</h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {wert.beschreibung || "Noch keine Beschreibung"}
                  </p>
                </div>
              </div>
            </div>
          ))}

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