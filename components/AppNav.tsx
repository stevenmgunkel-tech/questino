import Link from "next/link";

export default function AppNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-6 text-center text-[11px]">
        <Link href="/" className="p-2">
          <div className="text-xl">🏠</div>
          Home
        </Link>

        <Link href="/missionen" className="p-2">
          <div className="text-xl">📋</div>
          Mission
        </Link>

        <Link href="/einkaufsliste" className="p-2">
          <div className="text-xl">🛒</div>
          Einkauf
        </Link>

        <Link href="/kalender" className="p-2">
          <div className="text-xl">📅</div>
          Kalender
        </Link>

        <Link href="/belohnungen" className="p-2">
          <div className="text-xl">🎁</div>
          Rewards
        </Link>

        <Link href="/familie" className="p-2">
          <div className="text-xl">👨‍👩‍👧</div>
          Familie
        </Link>
      </div>
    </nav>
  );
}