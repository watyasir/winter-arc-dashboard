"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { SwitchRow } from "@/components/Switch";
import { useDashboard } from "@/components/dashboard/DashboardContext";

/** Ask box, recent exchanges | what Instinct can see, morning digest. Demo only; wiring arrives in Phase 8c. */
export function InstinctView() {
  const { data, shares, toggleShare, askInstinct, instinct } = useDashboard();
  const [question, setQuestion] = useState(data.instinct.draftQuestion);

  return (
    <div className="flex flex-wrap items-start gap-2.5">
      <div className="flex min-w-0 flex-[2_1_460px] flex-col gap-3.5">
        <Card aria-label="Ask Instinct" className="flex flex-col gap-3">
          <SectionHeading tone="green">Ask Instinct</SectionHeading>
          <form
            className="flex flex-wrap gap-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim()) askInstinct();
            }}
          >
            <input
              aria-label="Question for Instinct"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-11 flex-[1_1_260px] rounded-xl border-0 bg-fill px-3.5 text-sm text-text"
            />
            <Button type="submit" variant="primary" className="min-h-11 sm:min-h-11" disabled={instinct.status === "waiting"}>
              Send to Instinct
            </Button>
          </form>
          <span className="text-xs text-subtext1">
            Goes to Instinct by email. A status pill shows at the top while it works and disappears when the reply lands.
          </span>
        </Card>

        <Card aria-label="Recent exchanges" className="flex flex-col gap-0.5">
          <div className="pb-2">
            <SectionHeading>Recent exchanges</SectionHeading>
          </div>
          {data.instinct.exchanges.map((x) => (
            <div key={x.question} className="flex items-start gap-3 border-t border-surface0 py-3">
              <span
                className={`flex size-[22px] shrink-0 items-center justify-center rounded-full ${
                  x.status === "answered" ? "bg-green" : "bg-peach"
                }`}
              >
                <Icon name={x.status === "answered" ? "check" : "alert"} size={11} strokeWidth={3.5} className="stroke-white" />
                <span className="sr-only">{x.status === "answered" ? "Answered" : "Paused"}</span>
              </span>
              <div className="flex flex-1 flex-col gap-[3px]">
                <span className="text-sm font-semibold">{x.question}</span>
                <span className="text-[13px] text-subtext1">{x.answer}</span>
              </div>
              <span className="text-xs whitespace-nowrap text-subtext1">{x.meta}</span>
            </div>
          ))}
        </Card>
      </div>

      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5">
        <Card aria-label="What Instinct can see" className="flex flex-col gap-1">
          <SectionHeading>What Instinct can see</SectionHeading>
          <span className="pb-1.5 text-xs text-subtext1">Read-only page for Instinct, refreshed every 15 minutes.</span>
          {data.instinct.shares.map((s) => (
            <SwitchRow key={s.key} label={s.label} on={shares[s.key]} onToggle={() => toggleShare(s.key)} />
          ))}
        </Card>
        <Card aria-label="Morning digest" className="flex flex-col gap-2">
          <CardHeader aside={<span className="text-xs text-subtext1">Emails Instinct at 7:30 AM</span>}>
            <SectionHeading>Morning digest</SectionHeading>
          </CardHeader>
          <div className="rounded-xl bg-fill px-3.5 py-3 text-[13px] leading-[1.55] whitespace-pre-line">
            {data.instinct.digest}
          </div>
        </Card>
      </div>
    </div>
  );
}
