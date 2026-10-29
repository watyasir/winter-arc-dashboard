import Link from "next/link";
import { OwnerDashboard } from "./OwnerDashboard";

/** Signed in as the owner: the Overview. Anyone else: a short welcome with the demo link. */
export default function Home() {
  return <OwnerDashboard view="overview" signedOut={<Welcome />} />;
}

function Welcome() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-tile border border-line bg-card p-8 text-center shadow-tile">
        <span aria-hidden="true" className="grid size-12 place-items-center rounded-item bg-peach font-mono text-xl font-bold">
          Y
        </span>
        <h1 className="m-0 text-[32px] font-extrabold tracking-[-0.02em]">Yasir OS</h1>
        <p className="m-0 text-sub">A personal life dashboard with a 90-day Winter Arc season.</p>
        <Link href="/demo" className="press mt-3 inline-flex min-h-11 items-center rounded-full bg-peach px-5 text-sm font-semibold text-ink no-underline hover:bg-peach-strong">
          View the demo
        </Link>
        <p className="m-0 text-sm text-sub">
          It&apos;s you?{" "}
          <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-blue-text hover:text-blue-hover">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
