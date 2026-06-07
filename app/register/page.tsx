"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

function createFamilyCode() {
  return "QST-" + Math.floor(1000 + Math.random() * 9000);
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    const userId = authData.user?.id;

    if (!userId) {
      alert("Benutzer konnte nicht erstellt werden.");
      return;
    }

    const familyCode = createFamilyCode();

    const { data: familyData, error: familyError } = await supabase
      .from("familien")
      .insert({
        name: familyName,
        familien_code: familyCode,
      })
      .select()
      .single();

    if (familyError) {
      alert(familyError.message);
      return;
    }

    const { error: memberError } = await supabase.from("mitglieder").insert({
      familie_id: familyData.id,
      auth_user_id: userId,
      name,
      rolle: "eltern",
      xp: 0,
      level: 1,
    });

    if (memberError) {
      alert(memberError.message);
      return;
    }

    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 text-gray-900">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-3xl font-black">Questino starten 🚀</h1>
        <p className="mb-6 text-gray-500">
          Erstelle deine Familie und deinen Eltern-Account.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            className="w-full rounded-2xl bg-white p-4 shadow"
            placeholder="Dein Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full rounded-2xl bg-white p-4 shadow"
            placeholder="Familienname"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
          />

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
            Familie erstellen
          </button>
        </form>
      </div>
    </main>
  );
}