"use client";

import { Card } from "@/components/Card";
import { CardHeader, SectionHeading } from "@/components/SectionHeading";
import { TextButton } from "@/components/TextButton";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { MailRow } from "./MailRow";

export function InboxPreviewTile() {
  const { data, setView, setMailbox, openMail } = useDashboard();
  return (
    <Card aria-label="Inbox" className="flex-[1_1_340px] px-3 pt-[18px] pb-2.5">
      <div className="px-2 pb-1.5">
        <CardHeader aside={<TextButton onClick={() => setView("inbox")}>Open Inbox</TextButton>}>
          <SectionHeading tone="peach">Inbox</SectionHeading>
        </CardHeader>
      </div>
      {data.mails.slice(0, 4).map((m) => (
        <MailRow
          key={m.id}
          mail={m}
          compact
          onOpen={() => {
            setMailbox("Inbox");
            openMail(m.id);
          }}
        />
      ))}
    </Card>
  );
}
