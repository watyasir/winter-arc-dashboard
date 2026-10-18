"use client";

import { Chip } from "@/components/Chip";
import type { Mail } from "@/modules/types";

/** One message in a list. Unread = blue dot + bold. */
export function MailRow({
  mail,
  current,
  compact,
  onOpen,
}: {
  mail: Mail;
  current?: boolean;
  compact?: boolean;
  onOpen: () => void;
}) {
  const weight = mail.unread ? "font-bold" : compact ? "font-medium" : "font-normal";
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={current ? "true" : undefined}
      className={`flex w-full min-h-11 cursor-pointer items-start gap-3 rounded-[10px] border-0 text-left text-text hover:bg-fill ${
        compact ? "px-2 py-[9px]" : "p-3"
      } ${current ? "bg-blue/12 hover:bg-blue/12" : "bg-transparent"}`}
    >
      <span
        aria-hidden="true"
        className={`mt-1.5 size-2 shrink-0 rounded-full ${mail.unread ? "bg-blue" : "bg-transparent"}`}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex justify-between gap-2">
          <span className={`${compact ? "text-[13px]" : "text-sm"} ${weight}`}>
            {mail.unread && <span className="sr-only">Unread: </span>}
            {mail.from}
          </span>
          <span className="shrink-0 text-xs text-subtext1">{mail.time}</span>
        </span>
        {compact ? (
          <span className="truncate text-[13px] text-subtext1">{mail.subject}</span>
        ) : (
          <>
            <span className={`text-[13px] ${weight}`}>{mail.subject}</span>
            <span className="mt-0.5 flex flex-wrap gap-1.5">
              <Chip>{mail.label}</Chip>
              {mail.loggedByClaude && <Chip tone="green">Logged by Claude</Chip>}
            </span>
          </>
        )}
      </span>
    </button>
  );
}
