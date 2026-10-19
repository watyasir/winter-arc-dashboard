"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { toneBg } from "@/lib/tones";
import { MailRow } from "./MailRow";

/** Mailboxes | message list | reading pane. Demo only; real Gmail arrives in Phase 8b. */
export function InboxView() {
  const { data, mailbox, setMailbox, selectedMailId, openMail } = useDashboard();
  const list = mailbox === "Inbox" ? data.mails : data.mails.filter((m) => m.box === mailbox || m.label === mailbox);
  const sel = data.mails.find((m) => m.id === selectedMailId) ?? data.mails[0];

  return (
    <div className="flex flex-wrap items-start gap-2.5">
      <Card aria-label="Mailboxes" className="flex flex-[1_1_200px] flex-col gap-0.5 p-3 sm:flex-[0_1_200px]">
        {data.mailboxes.map((b) => (
          <button
            key={b.label}
            type="button"
            aria-current={mailbox === b.label ? "page" : undefined}
            onClick={() => setMailbox(b.label)}
            className={`flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-full border-0 px-3 text-left text-[13px] text-ink hover:bg-fill sm:min-h-[38px] ${
              mailbox === b.label ? "bg-brand font-semibold text-white hover:bg-brand" : "bg-transparent font-medium"
            }`}
          >
            <span aria-hidden="true" className={`size-2 rounded-full ${toneBg[b.tone]}`} />
            <span className="flex-1">{b.label}</span>
            <span className={`text-xs font-semibold ${mailbox === b.label ? "text-white/80" : "text-sub"}`}>{b.count}</span>
          </button>
        ))}
        <p className="m-0 px-2.5 pt-3.5 text-xs leading-[1.45] text-sub">{data.mailboxNote}</p>
      </Card>

      <Card aria-label="Messages" className="flex flex-[1_1_320px] flex-col gap-0.5 p-2.5">
        {list.length === 0 ? (
          <p className="m-0 p-3 text-[13px] text-sub">Nothing in {mailbox}. You&apos;re all caught up.</p>
        ) : (
          list.map((m) => <MailRow key={m.id} mail={m} current={m.id === sel?.id} onOpen={() => openMail(m.id)} />)
        )}
      </Card>

      {sel && (
        <Card aria-label="Reading pane" className="flex flex-[2_1_420px] flex-col gap-3.5 p-6">
          <div className="flex flex-wrap justify-between gap-2.5">
            <div className="flex flex-col gap-1">
              <h2 className="m-0 text-[22px] font-bold tracking-[-0.01em]">{sel.subject}</h2>
              <span className="text-[13px] text-sub">
                {sel.from} · {sel.time}
              </span>
            </div>
            <div className="flex gap-2">
              <Button>Reply</Button>
              <Button>Archive</Button>
            </div>
          </div>
          <p className="m-0 max-w-[62ch] text-[15px] leading-[1.55] whitespace-pre-line">{sel.body}</p>
          <div className="flex gap-2.5 rounded-[14px] bg-arc/8 px-3.5 py-3 text-[13px]">
            <span className="font-semibold text-arc-text">Claude</span>
            <span>{sel.claudeNote}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
