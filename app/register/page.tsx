"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Modus = "erstellen" | "beitreten";

function erstelleFamilienCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function istSchonRegistriertFehler(message: string) {
  const text = message.toLowerCase();

  return (
    text.includes("already registered") ||
    text.includes("already been registered") ||
    text.includes("user already registered") ||
    text.includes("already exists") ||
    (text.includes("email address") && text.includes("registered"))
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [modus, setModus] = useState<Modus>("beitreten");
  const [name, setName] = useState("");
  const [familienName, setFamilienName] = useState("");
  const [familienCode, setFamilienCode] = useState("");
  const [rolle, setRolle] = useState("Erwachsener");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [fehler, setFehler] = useState("");

  const normalisierterCode = useMemo(
    () => familienCode.trim().toUpperCase(),
    [familienCode]
  );

  async function holeOderErstelleUser() {
    const saubereEmail = email.trim().toLowerCase();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: saubereEmail,
        password,
      }
    );

    if (!signUpError && signUpData.user) {
      return signUpData.user;
    }

    if (signUpError && istSchonRegistriertFehler(signUpError.message)) {
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: saubereEmail,
          password,
        });

      if (loginError || !loginData.user) {
        throw new Error(
          "Diese E-Mail ist schon registriert. Bitte nutze das richtige Passwort oder logge dich normal ein."
        );
      }

      return loginData.user;
    }

    throw new Error(
      signUpError?.message ||
        "Registrierung fehlgeschlagen. Bitte später erneut versuchen."
    );
  }

  async function findeOderErstelleFamilie() {
    if (modus === "erstellen") {
      const neuerCode = erstelleFamilienCode();

      const { data: neueFamilie, error: familieError } = await supabase
        .from("familien")
        .insert({
          name: familienName.trim(),
          familien_code: neuerCode,
        })
        .select("id")
        .single();

      if (familieError || !neueFamilie) {
        throw new Error(
          familieError?.message ||
            "Familie konnte nicht erstellt werden. Prüfe bitte Supabase RLS."
        );
      }

      return neueFamilie.id as string;
    }

    const { data: familie, error: familieError } = await supabase
      .from("familien")
      .select("id")
      .eq("familien_code", normalisierterCode)
      .single();

    if (familieError || !familie) {
      throw new Error("Familiencode nicht gefunden.");
    }

    return familie.id as string;
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setFehler("");

    if (!name.trim()) {
      setFehler("Bitte deinen Namen eingeben.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setFehler("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    if (password.length < 6) {
      setFehler("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    if (modus === "erstellen" && !familienName.trim()) {
      setFehler("Bitte Familienname eingeben.");
      return;
    }

    if (modus === "beitreten" && !normalisierterCode) {
      setFehler("Bitte Familiencode eingeben.");
      return;
    }

    setLoading(true);

    try {
      const user = await holeOderErstelleUser();

      const { data: vorhandenesMitglied, error: vorhandenesMitgliedError } =
        await supabase
          .from("mitglieder")
          .select("id, familie_id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

      if (vorhandenesMitgliedError) {
        throw new Error(vorhandenesMitgliedError.message);
      }

      if (vorhandenesMitglied) {
        router.push("/");
        router.refresh();
        return;
      }

      const familieId = await findeOderErstelleFamilie();

      const { error: mitgliedError } = await supabase.from("mitglieder").insert({
        familie_id: familieId,
        auth_user_id: user.id,
        name: name.trim(),
        rolle,
        xp: 0,
        level: 1,
      });

      if (mitgliedError) {
        const message = mitgliedError.message.toLowerCase();

        if (message.includes("duplicate") || message.includes("unique")) {
          router.push("/");
          router.refresh();
          return;
        }

        throw new Error(
          mitgliedError.message ||
            "Mitglied konnte nicht erstellt werden. Prüfe bitte Supabase RLS."
        );
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setFehler(error instanceof Error ? error.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F3EEE5] px-4 py-6 text-[#182019]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(86,118,87,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,124,82,0.16),transparent_35%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center">
        <header className="mb-5 overflow-hidden rounded-[1.65rem] border border-[#E1D7C7] bg-[#FFF9EF] shadow-[0_12px_35px_rgba(54,42,25,0.08)]">
          <div className="bg-gradient-to-br from-[#20362B] via-[#294638] to-[#4F5C3A] p-5 text-[#FFF7EA]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#D8C7A1]">
                  Questino Start
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight">
                  Questino starten
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Erstelle deine Familie oder tritt mit Familiencode bei.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                Q
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3">
            <div className="rounded-2xl bg-[#F3EBDD] p-3">
              <p className="text-xl font-black">👨‍👩‍👧</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                Familie
              </p>
            </div>

            <div className="rounded-2xl bg-[#E7F0E4] p-3 text-[#2F5D43]">
              <p className="text-xl font-black">XP</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#5E8064]">
                sammeln
              </p>
            </div>

            <div className="rounded-2xl bg-[#F3EBDD] p-3">
              <p className="text-xl font-black">Q</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                wachsen
              </p>
            </div>
          </div>
        </header>

        <div className="mb-4 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-2 shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setModus("beitreten");
                setFehler("");
              }}
              className={`rounded-2xl p-3 text-sm font-black transition active:scale-[0.98] ${
                modus === "beitreten"
                  ? "bg-[#20362B] text-[#FFF7EA]"
                  : "bg-[#FBF4EA] text-[#8C7655]"
              }`}
            >
              Beitreten
            </button>

            <button
              type="button"
              onClick={() => {
                setModus("erstellen");
                setFehler("");
              }}
              className={`rounded-2xl p-3 text-sm font-black transition active:scale-[0.98] ${
                modus === "erstellen"
                  ? "bg-[#20362B] text-[#FFF7EA]"
                  : "bg-[#FBF4EA] text-[#8C7655]"
              }`}
            >
              Familie erstellen
            </button>
          </div>
        </div>

        <form
          onSubmit={handleRegister}
          className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
        >
          <div className="mb-4">
            <h2 className="text-xl font-black">
              {modus === "erstellen" ? "Neue Familie" : "Familie beitreten"}
            </h2>

            <p className="mt-1 text-sm text-[#776B5B]">
              {modus === "erstellen"
                ? "Starte eure gemeinsame Questino-Reise."
                : "Gib den Familiencode ein und werde Teil der Reise."}
            </p>
          </div>

          {fehler && (
            <div className="mb-3 rounded-2xl border border-[#E1D7C7] bg-[#F8E8DD] p-3 text-sm font-bold text-[#9A3A28]">
              {fehler}
            </div>
          )}

          <div className="space-y-3">
            <input
              className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none placeholder:text-[#9C8B74] focus:ring-2 focus:ring-[#4D8A5C]"
              placeholder="Dein Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {modus === "erstellen" ? (
              <input
                className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none placeholder:text-[#9C8B74] focus:ring-2 focus:ring-[#4D8A5C]"
                placeholder="Familienname z.B. Familie Gunkel"
                value={familienName}
                onChange={(e) => setFamilienName(e.target.value)}
              />
            ) : (
              <input
                className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold uppercase tracking-widest outline-none placeholder:tracking-normal placeholder:text-[#9C8B74] focus:ring-2 focus:ring-[#4D8A5C]"
                placeholder="Familiencode"
                value={familienCode}
                onChange={(e) => setFamilienCode(e.target.value.toUpperCase())}
              />
            )}

            <select
              className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none focus:ring-2 focus:ring-[#4D8A5C]"
              value={rolle}
              onChange={(e) => setRolle(e.target.value)}
            >
              <option>Erwachsener</option>
              <option>Teenager</option>
              <option>Kind</option>
            </select>

            <input
              className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none placeholder:text-[#9C8B74] focus:ring-2 focus:ring-[#4D8A5C]"
              placeholder="E-Mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none placeholder:text-[#9C8B74] focus:ring-2 focus:ring-[#4D8A5C]"
              placeholder="Passwort min. 6 Zeichen"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-[#20362B] p-4 font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(32,54,43,0.20)] disabled:opacity-60 active:scale-[0.98]"
            >
              {loading
                ? "Prüfe Konto..."
                : modus === "erstellen"
                ? "Familie erstellen"
                : "Familie beitreten"}
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
          <p className="text-sm leading-6 text-[#776B5B]">
            Schon registriert? Dann kannst du dich direkt einloggen.
          </p>

          <Link
            href="/login"
            className="mt-3 block rounded-2xl bg-[#F3EBDD] p-4 font-black text-[#20362B] active:scale-[0.98]"
          >
            Direkt einloggen
          </Link>
        </div>

        <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#8C7655]">
          Familie · Wachstum · gemeinsame Reise
        </p>
      </div>
    </main>
  );
}
