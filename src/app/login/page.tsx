import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in · Yarizz's Dashboard" };

const notices: Record<string, string> = {
  "not-allowed": "That account can't use this dashboard.",
  "link-expired": "That sign-in link has expired or was already used. Send a new one.",
  "session-ended": "It's been 7 days, so you were signed out. Sign in again to carry on.",
};

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-5 rounded-[20px] border border-sep bg-card p-6">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[28px] leading-tight font-bold tracking-[-0.02em]">Sign in</h1>
          <p className="m-0 text-[15px] text-sub">Yarizz&apos;s Dashboard is private. Just looking around?</p>
          <Link href="/demo" className="self-start text-[15px] font-semibold text-brand-text hover:text-brand-hover">
            See the demo instead
          </Link>
        </div>
        <Suspense fallback={<LoginForm />}>
          <LoginWithNotice searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginWithNotice({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error } = await searchParams;
  return <LoginForm notice={typeof error === "string" ? notices[error] : undefined} />;
}
