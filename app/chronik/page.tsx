"use client";

import { useEffect, useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/lib/supabase";

type ChronikItem = {
  id: string;
  datum: string;
  icon: string;
  titel: string;
  beschreibung: string;
  typ: "mission" | "routine" | "ziel" | "achievement" | "wert";
};

export default function ChronikPage() {
  const [items, setItems] = useState<ChronikItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ladeChronik();
  }, []);

  async function ladeChronik() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data: mitglied } = await supabase
      .from("mitglieder")
      .select("id, familie_id, name")
      .eq("auth_user_id", userData.user.id)
      .single();

    if (!mitglied) {
      setLoading(false);
      return;
    }

    const chronik: ChronikItem[] = [];

    const { data: missionen } = await supabase
      .from("missionen")
      .select("id, titel, erstellt_am")
      .eq("familie_id", mitglied.familie_id)
      .eq("status", "erledigt")
      .order("erstellt_am", { ascending: false })
      .limit(20);

    for (const mission of missionen || []) {
      chronik.push({
        id: `mission-${mission.id}`,
        datum: mission.erstellt_am,
        icon: "🚀",
        titel: mission.titel,
        beschreibung: "Mission abgeschlossen",
        typ: "mission",
      });
    }

    const { data: routinen } = await supabase
      .from("routine_logs")
      .select(
        `
        id,
        created_at,
        datum,
        routinen (
          titel
        )
      `
      )
      .eq("mitglied_id", mitglied.id)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const log of routinen || []) {
      const routineRelation = Array.isArray((log as any).routinen)
        ? (log as any).routinen[0]
        : (log as any).routinen;

      chronik.push({
        id: `routine-${log.id}`,
        datum: log.created_at || log.datum,
        icon: "🔁",
        titel: routineRelation?.titel || "Routine",
        beschreibung: "Routine erledigt",
        typ: "routine",
      });
    }

    const { data: ziele } = await supabase
      .from("ziele")
      .select("id, titel, created_at, status")
      .eq("mitglied_id", mitglied.id)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const ziel of ziele || []) {
      chronik.push({
        id: `ziel-${ziel.id}`,
        datum: ziel.created_at,
        icon: ziel.status === "erreicht" ? "🏁" : "🎯",
        titel: ziel.titel,
        beschreibung:
          ziel.status === "erreicht" ? "Ziel erreicht" : "Ziel gestartet",
        typ: "ziel",
      });
    }

    const { data: achievements } = await supabase
      .from("mitglied_achievements")
      .select(
        `
        id,
        freigeschaltet_am,
        achievements (
          titel,
          icon
        )
      `
      )
      .eq("mitglied_id", mitglied.id)
      .order("freigeschaltet_am", { ascending: false })
      .limit(20);

    for (const eintrag of achievements || []) {
      const achievementRelation = Array.isArray((eintrag as any).achievements)
        ? (eintrag as any).achievements[0]
        : (eintrag as any).achievements;

      chronik.push({
        id: `achievement-${eintrag.id}`,
        datum: eintrag.freigeschaltet_am,
        icon: achievementRelation?.icon || "🏅",
        titel: achievementRelation?.titel || "Achievement",
        beschreibung: "Achievement freigeschaltet",
        typ: "achievement",
      });
    }

    const { data: werte } = await supabase
      .from("familienwert_logs")
      .select(
        `
        id,
        created_at,
        punkte,
        familien_werte (
          titel,
          icon
        )
      `
      )
      .eq("familie_id", mitglied.familie_id)
      .order("created_at", { ascending: false })
      .limit(20);

    for (const wert of werte || []) {
      const wertRelation = Array.isArray((wert as any).familien_werte)
        ? (wert as any).familien_werte[0]
        : (wert as any).familien_werte;

      chronik.push({
        id: `wert-${wert.id}`,
        datum: wert.created_at,
        icon: wertRelation?.icon || "❤️",
        titel: wertRelation?.titel || "Familienwert",
        beschreibung: `Familienwert gelebt +${wert.punkte || 1}`,
        typ: "wert",
      });
    }

    const sortiert = chronik
      .filter((item) => item.datum)
      .sort(
        (a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime()
      )
      .slice(0, 40);

    setItems(sortiert);
    setLoading(false);
  }

  function datumFormatieren(datum: string) {
    return new Date(datum).toLocaleDateString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function typStyle(typ: ChronikItem["typ"]) {
    switch (typ) {
      case "mission":
        return "bg-orange-50 text-orange-700";

      case "routine":
        return "bg-purple-50 text-purple-700";

      case "ziel":
        return "bg-blue-50 text-blue-700";

      case "achievement":
        return "bg-emerald-50 text-emerald-700";

      case "wert":
        return "bg-pink-50 text-pink-700";

      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  const erstesDatum =
    items.length > 0
      ? items.reduce((a, b) =>
          new Date(a.datum).getTime() < new Date(b.datum).getTime() ? a : b
        ).datum
      : null;

  const achievementCount = items.filter((item) => item.typ === "achievement").length;
  const missionCount = items.filter((item) => item.typ === "mission").length;

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28 text-gray-900">
      <div className="mx-auto max-w-md">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-gray-900 via-slate-800 to-emerald-900 p-6 text-white shadow-xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-3xl font-black">
            Q
          </div>

          <h1 className="text-3xl font-black">Chronik</h1>

          <p className="mt-2 text-sm text-white/70">
            Deine Reise in kleinen echten Meilensteinen.
          </p>

          <div className="mt-5 rounded-3xl bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
              Deine Reise begann
            </p>
            <p className="mt-2 text-2xl font-black">
              {erstesDatum ? datumFormatieren(erstesDatum) : "Heute"}
            </p>
          </div>
        </div>

        {loading && (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow">
            Lade Chronik...
          </div>
        )}

        {!loading && (
          <>
            <section className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-white p-4 text-center shadow">
                <p className="text-2xl font-black text-gray-900">
                  {items.length}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Einträge
                </p>
              </div>

              <div className="rounded-3xl bg-white p-4 text-center shadow">
                <p className="text-2xl font-black text-orange-600">
                  {missionCount}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Missionen
                </p>
              </div>

              <div className="rounded-3xl bg-white p-4 text-center shadow">
                <p className="text-2xl font-black text-emerald-700">
                  {achievementCount}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Erfolge
                </p>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-5 shadow">
              <h2 className="mb-4 text-xl font-black">📖 Deine Reise</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 rounded-2xl bg-gray-50 p-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
                      {item.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">{item.titel}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.beschreibung}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${typStyle(
                            item.typ
                          )}`}
                        >
                          {item.typ}
                        </span>
                      </div>

                      <p className="mt-3 text-xs font-bold text-gray-400">
                        {datumFormatieren(item.datum)}
                      </p>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                    Noch keine Chronik-Einträge. Starte deine erste Mission.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
