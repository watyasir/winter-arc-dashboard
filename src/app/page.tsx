import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-base p-8 text-center">
        <h1 className="m-0 text-3xl font-bold tracking-tight">Winter Arc Dashboard</h1>
        <p className="mt-2 text-subtext1">A personal life dashboard with a 90-day Winter Arc season.</p>
        <Link
          href="/demo"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-blue px-4 text-[13px] font-semibold text-white no-underline hover:bg-blue-text hover:text-white"
        >
          View the demo
        </Link>
      </div>
    </main>
  );
}
