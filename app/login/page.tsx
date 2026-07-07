"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fehler, setFehler] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setFehler("");

    if (!email.trim() || !password.trim()) {
      setFehler("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setFehler(error.message);
      return;
    }

    router.push("/");
    router.refresh();
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
                  Questino Familie
                </p>

                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight">
                  Willkommen zurück
                </h1>

                <p className="mt-3 max-w-[16rem] text-sm leading-6 text-[#F3E8D5]/75">
                  Melde dich an und mach heute wieder einen kleinen Schritt nach
                  vorne.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl font-black shadow-inner">
                Q
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3">
            <div className="rounded-2xl bg-[#F3EBDD] p-3">
              <p className="text-xl font-black">1%</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-[#8C7655]">
                täglich
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

        <form
          onSubmit={handleLogin}
          className="rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 shadow-[0_10px_30px_rgba(54,42,25,0.06)]"
        >
          <div className="mb-4">
            <h2 className="text-xl font-black">Einloggen</h2>
            <p className="mt-1 text-sm text-[#776B5B]">
              Weiter mit deiner Familienreise.
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
              placeholder="E-Mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="w-full rounded-2xl border border-[#E1D7C7] bg-[#FBF4EA] p-4 font-bold outline-none placeholder:text-[#9C8B74] focus:ring-2 focus:ring-[#4D8A5C]"
              placeholder="Passwort"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-[#20362B] p-4 font-black text-[#FFF7EA] shadow-[0_12px_35px_rgba(32,54,43,0.20)] disabled:opacity-60 active:scale-[0.98]"
            >
              {loading ? "Logge ein..." : "Einloggen"}
            </button>
          </div>
        </form>

        <div className="mt-4 rounded-[1.45rem] border border-[#E1D7C7] bg-[#FFF9EF] p-4 text-center shadow-[0_10px_30px_rgba(54,42,25,0.06)]">
          <p className="text-sm text-[#776B5B]">Noch kein Konto?</p>

          <Link
            href="/register"
            className="mt-3 block rounded-2xl bg-[#F3EBDD] p-4 font-black text-[#20362B] active:scale-[0.98]"
          >
            Familie starten oder beitreten
          </Link>
        </div>

        <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#8C7655]">
          Denk nach · Wachse · Entwickle dich
        </p>
      </div>
    </main>
  );
}
