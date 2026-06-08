"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type Mitglied = {
  id: string;
  name: string;
  rolle: string;
  xp: number;
  level: number;
  familie_id: string;
};

type Familie = {
  id: string;
  name: string;
  familien_code: string;
};

type BesteStaerke = {
  name: string;
  punkte: number;
};

function berechneLevel(xp: number) {
  if (xp >= 1000) {
    return {
      level: 5,
      name: "Meister",
      aktuellesLevelXP: 1000,
      naechstesLevelXP: 1000,
    };
  }

  if (xp >= 500) {
    return {
      level: 4,
      name: "Organisator",
      aktuellesLevelXP: 500,
      naechstesLevelXP: 1000,
    };
  }

  if (xp >= 250) {
    return {
      level: 3,
      name: "Planer",
      aktuellesLevelXP: 250,
      naechstesLevelXP: 500,
    };
  }

  if (xp >= 100) {
    return {
      level: 2,
      name: "Starter",
      aktuellesLevelXP: 100,
      naechstesLevelXP: 250,
    };
  }

  return {
    level: 1,
    name: "Entdecker",
    aktuellesLevelXP: 0,
    naechstesLevelXP: 100,
  };
}

export default function Home() {
  const router = useRouter();

  const [mitglied, setMitglied] = useState<Mitglied | null>(null);
  const [familie, setFamilie] = useState<Familie | null>(null);
  const [offeneMissionen, setOffeneMissionen] = useState(0);
  const [letzteAktivitaet, setLetzteAktivitaet] = useState("");
  const [besteStaerke, setBesteStaerke] = useState<BesteStaerke | null>(null);
  const [naechsteBelohnung, setNaechsteBelohnung] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: mitgliedData, error: mitgliedError } = await supabase
        .from("mitglieder")
        .select("*")
        .eq("auth_user_id", userData.user.id)
        .single();

      if (mitgliedError || !mitgliedData) {
        alert("Mitglied nicht gefunden.");
        return;
      }

      setMitglied(mitgliedData);

      const { data: familieData, error: familieError } = await supabase
        .from("familien")
        .select("*")
        .eq("id", mitgliedData.familie_id)
        .single();

      if (familieError || !familieData) {
        alert("Familie nicht gefunden.");
        return;
      }

      setFamilie(familieData);

      const { count } = await supabase
        .from("missionen")
        .select("*", { count: "exact", head: true })
        .eq("familie_id", mitgliedData.familie_id)
        .eq("status", "offen");

      setOffeneMissionen(count || 0);

      const { data: feedData } = await supabase
        .from("feed")
        .select("*")
        .eq("familie_id", mitgliedData.familie_id)
        .order("erstellt_am", { ascending: false })
        .limit(1)
        .maybeSingle();

      setLetzteAktivitaet(feedData?.text || "");

      const { data: staerkenData } = await supabase
        .from("mitglied_staerken")
        .select(`
          punkte,
          staerken (
            name
          )
        `)
        .eq("mitglied_id", mitgliedData.id)
        .order("punkte", { ascending: false })
        .limit(1);

      const staerke = staerkenData?.[0] as any;

      if (staerke) {
        setBesteStaerke({
          name: staerke.staerken?.name || "Unbekannt",
          punkte: staerke.punkte || 0,
        });
      }

      const { data: belohnungData } = await supabase
        .from("belohnungen")
        .select("*")
        .eq("familie_id", mitgliedData.familie_id)
        .gte("kosten", mitgliedData.xp || 0)
        .order("kosten", { ascending: true })
        .limit(1)
        .maybeSingle();

      setNaechsteBelohnung(belohnungData?.titel || "");
    }

    loadData();
  }, [router]);

  const xp = mitglied?.xp ?? 0;
  const levelInfo = berechneLevel(xp);

  const fortschritt =
    levelInfo.naechstesLevelXP === levelInfo.aktuellesLevelXP
      ? 100
      : Math.min(
          100,
          Math.round(
            ((xp - levelInfo.aktuellesLevelXP) /
              (levelInfo.naechstesLevelXP - levelInfo.aktuellesLevelXP)) *
              100
          )
        );

  return (
    <main className="min-h-screen bg-[#F6F7FB] px-5 pt-6 pb-32 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-2xl text-white shadow-lg">
              🚀
            </div>

            <div>
              <p className="font-medium text-gray-500">
                Guten Tag {mitglied?.name ?? ""} 👋
              </p>
              <h1 className="text-3xl font-black leading-none">Questino</h1>
              <p className="mt-1 text-sm text-gray-500">
                {familie?.name ?? "Familie wird geladen..."}
              </p>
            </div>
          </div>

          <Link
            href="/eltern"
            className="rounded-2xl bg-white px-4 py-2 text-sm font-black shadow"
          >
            👨 Eltern
          </Link>
        </div>

        <section className="relative mb-5 overflow-hidden rounded-[2.2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-2xl">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="font-medium text-white/75">Aktueller Rang</p>
                <h2 className="text-2xl font-black">
                  Level {levelInfo.level} – {levelInfo.name}
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Du wächst mit jeder erledigten Mission weiter.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white/20 text-3xl">
                ⭐
              </div>
            </div>

            <div className="my-6 flex justify-center">
              <div className="relative h-44 w-44">
                <div
                  className="absolute inset-0 rounded-full shadow-inner"
                  style={{
                    background: `conic-gradient(white 0deg ${
                      fortschritt * 3.6
                    }deg, rgba(255,255,255,0.22) ${
                      fortschritt * 3.6
                    }deg 360deg)`,
                  }}
                />

                <div className="absolute inset-[15px] flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-inner">
                  <div className="text-center">
                    <p className="text-5xl font-black leading-none">{xp}</p>
                    <p className="mt-1 font-black text-white/75">XP</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-2 flex justify-between text-sm text-white/80">
              <span>{xp} XP</span>
              <span>
                {levelInfo.level >= 5 ? "MAX" : `${levelInfo.naechstesLevelXP} XP`}
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-white/25">
              <div
                className="h-3 rounded-full bg-white transition-all"
                style={{ width: `${fortschritt}%` }}
              />
            </div>

            <div className="mt-5 rounded-3xl bg-white/15 p-4">
              <p className="text-sm text-white/75">Nächstes Level</p>
              <p className="font-black">
                {levelInfo.level >= 5
                  ? "Maximales Level erreicht 🔥"
                  : `${levelInfo.naechstesLevelXP - xp} XP fehlen noch 🌱`}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-4 gap-3">
          {[
            { href: "/missionen", icon: "➕", label: "Mission" },
            { href: "/feed", icon: "📢", label: "Feed" },
            { href: "/staerken", icon: "🌱", label: "Stärken" },
            { href: "/belohnungen", icon: "🎁", label: "Reward" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center rounded-3xl bg-white p-4 shadow transition active:scale-95"
            >
              <span className="mb-2 text-2xl">{item.icon}</span>
              <span className="text-[11px] font-black text-gray-700">
                {item.label}
              </span>
            </Link>
          ))}
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-black">🚀 Familien Übersicht</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <div>
                <p className="font-black">🎯 Offene Missionen</p>
                <p className="text-sm text-gray-500">Was noch ansteht</p>
              </div>
              <p className="text-2xl font-black text-blue-600">
                {offeneMissionen}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
              <div>
                <p className="font-black">🌱 Beste Stärke</p>
                <p className="text-sm text-gray-500">
                  {besteStaerke?.name ?? "Noch keine Stärke"}
                </p>
              </div>
              <p className="text-2xl font-black text-green-600">
                {besteStaerke?.punkte ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="font-black">🎁 Nächste Belohnung</p>
              <p className="text-sm text-gray-500">
                {naechsteBelohnung || "Noch keine Belohnung gefunden"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="font-black">📢 Letzte Aktivität</p>
              <p className="mt-1 text-sm text-gray-500">
                {letzteAktivitaet || "Noch keine Aktivität"}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-2 gap-4">
          <Link href="/kalender" className="rounded-3xl bg-white p-5 shadow">
            <p className="mb-2 text-3xl">📅</p>
            <h2 className="font-black">Kalender</h2>
            <p className="mt-1 text-sm text-gray-500">Termine planen</p>
          </Link>

          <Link
            href="/einkaufsliste"
            className="rounded-3xl bg-white p-5 shadow"
          >
            <p className="mb-2 text-3xl">🛒</p>
            <h2 className="font-black">Einkauf</h2>
            <p className="mt-1 text-sm text-gray-500">Liste verwalten</p>
          </Link>
        </section>
      </div>

      <AppNav />
    </main>
  );
}