import AppNav from "@/components/AppNav";

export default function FamiliePage() {
  const members = [
    {
      name: "Steven",
      role: "Papa",
      xp: 120,
      level: 3,
      icon: "👨",
    },
    {
      name: "Kind 1",
      role: "Kind",
      xp: 80,
      level: 2,
      icon: "🧒",
    },
    {
      name: "Kind 2",
      role: "Kind",
      xp: 60,
      level: 2,
      icon: "👧",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F6F7FB] p-6 pb-28">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-black mb-2">
          Familie
        </h1>

        <p className="text-gray-500 mb-6">
          Familie Gunkel
        </p>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl mb-5">
          <h2 className="text-2xl font-black">
            👨‍👩‍👧 3 Mitglieder
          </h2>

          <p className="text-white/80 mt-2">
            Gemeinsam 260 XP gesammelt
          </p>
        </div>

        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.name}
              className="bg-white rounded-[2rem] p-5 shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-gray-100 flex items-center justify-center text-3xl">
                  {member.icon}
                </div>

                <div className="flex-1">
                  <h2 className="font-black text-lg">
                    {member.name}
                  </h2>

                  <p className="text-gray-500 text-sm">
                    {member.role}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-black text-blue-600">
                    {member.xp} XP
                  </p>

                  <p className="text-xs text-gray-500">
                    Level {member.level}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppNav />
    </main>
  );
}