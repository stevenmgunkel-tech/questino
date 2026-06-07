"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 text-gray-900">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-black">Willkommen zurück 👋</h1>
        <p className="mb-6 text-gray-500">Melde dich bei Questino an.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full rounded-2xl bg-white p-4 shadow"
            placeholder="E-Mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-2xl bg-white p-4 shadow"
            placeholder="Passwort"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-4 font-black text-white shadow-xl">
            Einloggen
          </button>
        </form>
      </div>
    </main>
  );
}