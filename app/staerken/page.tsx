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
  const [fehler, setFehler] = useState("");

  useEffect(() => {
    ladeStaerken();
  }, []);

  async function ladeStaerken() {
    setLoading(true);
    setFehler("");

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setFehler("Du bist nicht eingeloggt.");
      setLoading(false);
      return;
    }

    const { data: mitglied, error: mitgliedError } = await supabase
      .from("mitglieder")
      .select("id")
      .eq("auth_user_id", userData.user.id)
      .maybeSingle();

    if (mitgliedError) {
      setFehler(mitgliedError.message);
      setLoading(false);
      return;
    }

    if (!mitglied) {
      setFehler(
        "Dein Login ist noch mit keinem Familienmitglied verbunden. Bitte prüfe Familie/Login."
      );
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("mitglied_staerken")
      .select(
        `
        punkte,
        staerken (
          id,
          name
        )
      `
      )
      .eq("mitglied_id", mitglied.id);

    if (error) {
      console.error(error);
      setFehler(error.message);
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

  const gesamtPunkte = staerken.reduce(
    (sum, staerke) => sum + (staerke.punkte || 0),
    0
  );

  const staerksteStaerke =
    staerken.length > 0
      ? [...staerken].sort((a, b) => b.punkte - a.punkte)[0]
      : null;

  const hoechstesLevel =
    staerken.length > 0
      ? Math.max(...staerken.map((staerke) => getStaerkeLevel(staerke.punkte).level))
      : 1;

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 pb-28 pt-4 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto max-w-md">
        <header className="mb-4 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-4 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino Wachstum
                </p>

                <h1 className="mt-2 text-4xl font-black leading-none tracking-tight">
                  Stärken
                </h1>

                <p className="mt-2 max-w-[15rem] text-sm leading-5 text-[#F3E8D5]/75">
                  Hier siehst du, worin du gerade wächst.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                🌱
              </div>
            </div>
          </div>

          {!loading && !fehler && (
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{staerken.length}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Aktiv
                </p>
              </div>

              <div className="rounded-2xl bg-[#F3EBDD] p-3">
                <p className="text-xl font-black">{gesamtPunkte}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Punkte
                </p>
              </div>

              <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
                <p className="text-xl font-black">{hoechstesLevel}</p>
                <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                  Level
                </p>
              </div>
            </div>
          )}
        </header>

        {loading && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-sm text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            Lade Stärken...
          </div>
        )}

        {!loading && fehler && (
          <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#F8E8DD] p-5 text-[#9A3A28] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
            <p className="font-black">Stärken konnten nicht geladen werden.</p>
            <p className="mt-2 text-sm">{fehler}</p>
          </div>
        )}

        {!loading && !fehler && (
          <>
            {staerksteStaerke && (
              <section className="mb-3 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                  Aktuell stärkste Stärke
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                    {icons[staerksteStaerke.name] || "🌱"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-black">
                      {staerksteStaerke.name}
                    </h2>

                    <p className="text-sm text-[#776B5B]">
                      {staerksteStaerke.punkte} Punkte gesammelt
                    </p>
                  </div>
                </div>
              </section>
            )}

            {staerken.length === 0 && (
              <div className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-5 text-center text-[#776B5B] shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
                <p className="text-3xl">🌱</p>
                <p className="mt-2 font-black text-[#182019]">
                  Noch keine Stärken gesammelt.
                </p>
                <p className="mt-1 text-sm">
                  Erledige Missionen oder Routinen, um deine Stärken wachsen zu lassen.
                </p>
              </div>
            )}

            <div className="space-y-3">
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
                    className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3EBDD] text-xl">
                        {icons[staerke.name] || "🌱"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-black">
                              {staerke.name}
                            </h2>

                            <p className="text-sm text-[#776B5B]">
                              Level {levelInfo.level} · {levelInfo.titel}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-[#E7F0E4] px-3 py-2 text-sm font-black text-[#2F5D43]">
                            {staerke.punkte}
                          </div>
                        </div>

                        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E8DECF]">
                          <div
                            className="h-2 rounded-full bg-[#4D8A5C] transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-[#776B5B]">
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
          </>
        )}
      </div>

      <AppNav />
    </main>
  );
}
