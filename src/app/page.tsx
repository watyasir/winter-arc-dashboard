import Link from "next/link";
import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { isAllowedEmail } from "@/lib/auth";
import { loadDashboardData } from "@/lib/dashboard/load";
import { createClient } from "@/lib/supabase/server";
import { toggleTodayTracker } from "./actions";

/** Signed in as the owner: the real dashboard. Anyone else: a short welcome with the demo link. */
export default function Home() {
  return (
    <Suspense
      fallback={
        <p role="status" className="m-0 p-6 text-center text-[15px] text-sub">
          Loading your dashboard…
        </p>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email || !isAllowedEmail(email)) return <Welcome />;

  const dashboard = await loadDashboardData(supabase, email);
  if (!dashboard) {
    return <p className="m-0 p-6 text-center text-[15px] text-coral-text">Couldn&apos;t load your dashboard. Refresh to try again.</p>;
  }
  return <Dashboard data={dashboard} onToggleToday={toggleTodayTracker} />;
}

function Welcome() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-[20px] border border-sep bg-card p-8 text-center">
        <h1 className="m-0 text-3xl font-bold tracking-tight">Winter Arc Dashboard</h1>
        <p className="mt-2 text-sub">A personal life dashboard with a 90-day Winter Arc season.</p>
        <Link
          href="/demo"
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-4 text-[13px] font-semibold text-white no-underline hover:bg-brand-hover hover:text-white"
        >
          View the demo
        </Link>
        <p className="mt-4 mb-0 text-[13px] text-sub">
          It&apos;s you?{" "}
          <Link href="/login" className="font-semibold text-brand-text hover:text-brand-hover">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
