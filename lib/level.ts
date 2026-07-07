import { supabase } from "@/lib/supabase";

export type LevelMeilenstein = {
  level: number;
  xp: number;
  icon: string;
  titel: string;
  text: string;
};

export type LevelLog = {
  id: string;
  mitglied_id: string;
  familie_id: string;
  level: number;
  xp_erreicht: number;
  titel: string;
  icon: string | null;
  erreicht_am: string;
};

export const LEVEL_MEILENSTEINE: LevelMeilenstein[] = [
  {
    level: 1,
    xp: 0,
    icon: "🌱",
    titel: "Start der Reise",
    text: "Du hast begonnen, jeden Tag 1% besser zu werden.",
  },
  {
    level: 2,
    xp: 100,
    icon: "🔥",
    titel: "Erste Flamme",
    text: "Die ersten Missionen zeigen Wirkung.",
  },
  {
    level: 3,
    xp: 250,
    icon: "🧭",
    titel: "Eigener Weg",
    text: "Du erkennst, wohin du dich entwickeln möchtest.",
  },
  {
    level: 4,
    xp: 500,
    icon: "💎",
    titel: "Starke Gewohnheiten",
    text: "Routinen, Werte und Ziele werden Teil von dir.",
  },
  {
    level: 5,
    xp: 1000,
    icon: "👑",
    titel: "Questino Champion",
    text: "Du bist ein echtes Vorbild für deine Familie.",
  },
];

export function berechneLevelreise(xp: number) {
  const aktuellerIndex = LEVEL_MEILENSTEINE.reduce(
    (letzterIndex, meilenstein, index) => {
      return xp >= meilenstein.xp ? index : letzterIndex;
    },
    0
  );

  const aktuellerMeilenstein = LEVEL_MEILENSTEINE[aktuellerIndex];
  const naechsterMeilenstein = LEVEL_MEILENSTEINE[aktuellerIndex + 1] || null;

  if (!naechsterMeilenstein) {
    return {
      aktuellerMeilenstein,
      naechsterMeilenstein,
      progress: 100,
      xpBisNaechstesLevel: 0,
    };
  }

  const xpSeitAktuellemLevel = Math.max(0, xp - aktuellerMeilenstein.xp);
  const xpZwischenLeveln = Math.max(
    1,
    naechsterMeilenstein.xp - aktuellerMeilenstein.xp
  );

  return {
    aktuellerMeilenstein,
    naechsterMeilenstein,
    progress: Math.min(
      100,
      Math.round((xpSeitAktuellemLevel / xpZwischenLeveln) * 100)
    ),
    xpBisNaechstesLevel: Math.max(0, naechsterMeilenstein.xp - xp),
  };
}

export async function pruefeLevelUps(mitgliedId: string): Promise<LevelLog[]> {
  const { data: mitglied, error: mitgliedError } = await supabase
    .from("mitglieder")
    .select("id, familie_id, xp")
    .eq("id", mitgliedId)
    .single();

  if (mitgliedError || !mitglied) {
    console.error("Questino Levelreise: Mitglied konnte nicht geladen werden.", mitgliedError);
    return [];
  }

  const aktuelleXp = mitglied.xp || 0;

  const erreichbareLevel = LEVEL_MEILENSTEINE.filter(
    (meilenstein) => aktuelleXp >= meilenstein.xp
  );

  if (erreichbareLevel.length === 0) return [];

  const { data: vorhandeneLogs, error: vorhandeneError } = await supabase
    .from("level_logs")
    .select("level")
    .eq("mitglied_id", mitgliedId);

  if (vorhandeneError) {
    console.error("Questino Levelreise: Level-Logs konnten nicht geladen werden.", vorhandeneError);
    return [];
  }

  const vorhandeneLevel = new Set(
    (vorhandeneLogs || []).map((log) => log.level)
  );

  const neueLevel = erreichbareLevel.filter(
    (meilenstein) => !vorhandeneLevel.has(meilenstein.level)
  );

  if (neueLevel.length === 0) return [];

  const neueLogs = neueLevel.map((meilenstein) => ({
    mitglied_id: mitglied.id,
    familie_id: mitglied.familie_id,
    level: meilenstein.level,
    xp_erreicht: meilenstein.xp,
    titel: meilenstein.titel,
    icon: meilenstein.icon,
  }));

  const { data: eingefuegteLogs, error: insertError } = await supabase
    .from("level_logs")
    .insert(neueLogs)
    .select("id, mitglied_id, familie_id, level, xp_erreicht, titel, icon, erreicht_am");

  if (insertError) {
    // Falls zwei Checks gleichzeitig laufen, schützt unique(mitglied_id, level).
    // Dann nicht crashen, sondern ruhig weiterlaufen.
    console.error("Questino Levelreise: Neue Level konnten nicht gespeichert werden.", insertError);
    return [];
  }

  return (eingefuegteLogs || []) as LevelLog[];
}
