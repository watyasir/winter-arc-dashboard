"use client";

import { useActionState } from "react";
import { Button } from "@/components/Button";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col gap-2">
        <h2 className="m-0 text-[17px] font-semibold">Check your email</h2>
        <p className="m-0 text-[15px] text-sub">
          If {state.email} can sign in, a link is on its way. Open it to finish signing in.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-[13px] font-semibold">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        className="min-h-11 rounded-full border border-sep bg-base px-4 text-[17px] text-ink"
      />
      {(state.status === "error" || notice) && (
        <p role="alert" className="m-0 text-[13px] text-coral-text">
          {state.status === "error" ? state.message : notice}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="sm:min-h-11">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
