"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Mitglied = {
  id: string;
  name: string;
  rolle: string;
  xp: number;
  level: number;
};

type Familie = {
  id: string;
  name: string;
  familien_code: string;
};

type FamilienWert = {
  id: string;
  titel: string;
  beschreibung: string | null;
  icon: string | null;
  punkte: number;
};

export default function FamiliePage() {
  const [familie, setFamilie] = useState<Familie | null>(null);
  const [mitglieder, setMitglieder] = useState<Mitglied[]>([]);
  const [staerksterWert, setStaerksterWert] = useState<FamilienWert | null>(
    null
  );
  const [gesamtXP, setGesamtXP] = useState(0);

  useEffect(() => {
    ladeFamilie();
  }, []);

  async function ladeFamilie() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data: eigenesMitglied } = await supabase
      .from("mitglieder")
      .select("familie_id")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!eigenesMitglied) return;

    const { data: familieData } = await supabase
      .from("familien")
      .select("*")
      .eq("id", eigenesMitglied.familie_id)
      .single();

    setFamilie(familieData || null);

    const { data: mitgliederData } = await supabase
      .from("mitglieder")
      .select("id, name, rolle, xp, level")
      .eq("familie_id", eigenesMitglied.familie_id)
      .order("xp", { ascending: false });

    setMitglieder(mitgliederData || []);

    const xpSumme =
      mitgliederData?.reduce((sum, mitglied) => sum + (mitglied.xp || 0), 0) ||
      0;

    setGesamtXP(xpSumme);

    const { data: werteData } = await supabase
      .from("familien_werte")
      .select("*")
      .eq("familie_id", eigenesMitglied.familie_id);

    const { data: punkteData } = await supabase
      .from("familienwert_punkte")
      .select("familienwert_id, punkte")
      .eq("familie_id", eigenesMitglied.familie_id);

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

    setStaerksterWert(sortiert[0] || null);
  }

  function iconFuerRolle(rolle: string) {
    const clean = rolle?.toLowerCase();

    if (clean === "kind") return "🧒";
    if (clean === "mama") return "👩";
    if (clean === "papa") return "👨";
    if (clean === "eltern") return "👨‍👩‍👧";

    return "👤";
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="font-medium text-gray-500">
              {familie?.name || "Familie"}
            </p>

            <h1 className="text-3xl font-black">Familie</h1>

            <p className="text-sm text-gray-500">
              Eure gemeinsame Entwicklung auf einen Blick.
            </p>
          </div>

          <button className="rounded-2xl bg-white px-4 py-2 text-sm font-bold shadow">
            ➕ Mitglied
          </button>
        </div>

        <div className="mb-5 rounded-[2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black">
              Q
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {mitglieder.length} Mitglieder
              </h2>

              <p className="mt-1 text-white/75">
                Gemeinsam {gesamtXP} XP gesammelt
              </p>
            </div>
          </div>
        </div>

        {staerksterWert && (
          <div className="mb-5 rounded-3xl bg-white p-5 shadow">
            <p className="text-sm font-bold text-gray-500">
              🏆 Stärkster Familienwert
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                {staerksterWert.icon || "❤️"}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-black">
                  {staerksterWert.titel}
                </h2>

                <p className="text-sm text-gray-500">
                  {staerksterWert.beschreibung || "Euer aktuell stärkster Wert"}
                </p>
              </div>

              <p className="text-2xl font-black text-emerald-700">
                {staerksterWert.punkte}
              </p>
            </div>

            <Link
              href="/familienwerte"
              className="mt-4 block rounded-2xl bg-gray-900 p-3 text-center font-black text-white"
            >
              Alle Familienwerte ansehen
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {mitglieder.map((mitglied) => (
            <div
              key={mitglied.id}
              className="rounded-[2rem] bg-white p-5 shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-100 text-3xl">
                  {iconFuerRolle(mitglied.rolle)}
                </div>

                <div className="flex-1">
                  <h2 className="text-lg font-black">{mitglied.name}</h2>

                  <p className="text-sm text-gray-500">{mitglied.rolle}</p>
                </div>

                <div className="text-right">
                  <p className="font-black text-blue-600">
                    {mitglied.xp || 0} XP
                  </p>

                  <p className="text-xs text-gray-500">
                    Level {mitglied.level || 1}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {mitglieder.length === 0 && (
            <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
              Noch keine Mitglieder gefunden.
            </div>
          )}
        </div>
      </div>

      <AppNav />
    </main>
  );
}