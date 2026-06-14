import { supabase } from "@/lib/supabase";

type Achievement = {
  id: string;
  typ: string | null;
  zielwert: number | null;
  xp_bonus: number | null;
};

export async function pruefeAchievements(mitgliedId: string) {
  const { data: mitglied } = await supabase
    .from("mitglieder")
    .select("id, familie_id, xp")
    .eq("id", mitgliedId)
    .single();

  if (!mitglied) return;

  let aktuelleXp = mitglied.xp || 0;

  const { data: achievements } = await supabase
    .from("achievements")
    .select("id, typ, zielwert, xp_bonus");

  const { data: bereits } = await supabase
    .from("mitglied_achievements")
    .select("achievement_id")
    .eq("mitglied_id", mitgliedId);

  const unlockedIds = new Set(
    bereits?.map((eintrag) => eintrag.achievement_id) || []
  );

  for (const achievement of achievements || []) {
    if (unlockedIds.has(achievement.id)) continue;

    const fortschritt = await holeFortschritt(
      mitgliedId,
      mitglied.familie_id,
      aktuelleXp,
      achievement
    );

    if (fortschritt >= (achievement.zielwert || 1)) {
      const { error } = await supabase.from("mitglied_achievements").insert({
        mitglied_id: mitgliedId,
        achievement_id: achievement.id,
      });

      if (error) continue;

      const bonus = achievement.xp_bonus || 0;

      if (bonus > 0) {
        aktuelleXp += bonus;

        await supabase
          .from("mitglieder")
          .update({ xp: aktuelleXp })
          .eq("id", mitgliedId);
      }

      unlockedIds.add(achievement.id);
    }
  }
}

async function holeFortschritt(
  mitgliedId: string,
  familieId: string,
  xp: number,
  achievement: Achievement
) {
  switch (achievement.typ) {
    case "missionen": {
      const { count } = await supabase
        .from("missionen")
        .select("*", { count: "exact", head: true })
        .eq("zugewiesen_an", mitgliedId)
        .eq("status", "erledigt");

      return count || 0;
    }

    case "xp":
      return xp;

    case "ziele": {
      const { count } = await supabase
        .from("ziele")
        .select("*", { count: "exact", head: true })
        .eq("mitglied_id", mitgliedId);

      return count || 0;
    }

    case "ziele_erreicht": {
      const { count } = await supabase
        .from("ziele")
        .select("*", { count: "exact", head: true })
        .eq("mitglied_id", mitgliedId)
        .eq("status", "erreicht");

      return count || 0;
    }

    case "routinen": {
      const { count } = await supabase
        .from("routine_logs")
        .select("*", { count: "exact", head: true })
        .eq("mitglied_id", mitgliedId);

      return count || 0;
    }

    case "familienwerte": {
      const { count } = await supabase
        .from("familienwert_logs")
        .select("*", { count: "exact", head: true })
        .eq("familie_id", familieId);

      return count || 0;
    }

    default:
      return 0;
  }
}