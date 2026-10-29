"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/Button";
import { TextButton } from "@/components/TextButton";
import { sendMagicLink, signInWithCode, type CodeState, type LoginState } from "./actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });
  const [withCode, setWithCode] = useState(false);

  if (withCode) return <CodeForm onBack={() => setWithCode(false)} />;

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
        className="min-h-11 rounded-full border border-line bg-card px-4 text-[17px] text-ink"
      />
      {(state.status === "error" || notice) && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {state.status === "error" ? state.message : notice}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="sm:min-h-11">
        {pending ? "Sending…" : "Email me a sign-in link"}
      </Button>
      <TextButton onClick={() => setWithCode(true)} className="self-center">
        Have a code?
      </TextButton>
    </form>
  );
}

/** For the iPhone home-screen app: the one-time code from Settings on a signed-in device. */
function CodeForm({ onBack }: { onBack: () => void }) {
  const [state, action, pending] = useActionState<CodeState, FormData>(signInWithCode, { status: "idle" });
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="code" className="text-[13px] font-semibold">
        Sign-in code
      </label>
      <p className="m-0 text-[13px] text-sub">On a device that&apos;s signed in, open Settings → Sign in on another device.</p>
      <input
        id="code"
        name="code"
        type="text"
        autoComplete="one-time-code"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        required
        maxLength={12}
        placeholder="ABCD-EFGH"
        className="min-h-11 rounded-full border border-line bg-card px-4 font-mono text-[20px] tracking-[0.12em] text-ink uppercase"
      />
      {state.status === "error" && (
        <p role="alert" className="m-0 text-[13px] text-danger">
          {state.message}
        </p>
      )}
      <Button type="submit" variant="primary" disabled={pending} className="sm:min-h-11">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <TextButton onClick={onBack} className="self-center">
        Use email instead
      </TextButton>
    </form>
  );
}
