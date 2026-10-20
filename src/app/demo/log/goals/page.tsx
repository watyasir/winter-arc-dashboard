import type { Metadata } from "next";
import { DemoGoalsForm } from "@/components/goals/DemoGoalsForm";

export const metadata: Metadata = {
  title: "Demo goals · Yarizz's Dashboard",
  description: "The goals page on made-up sample data. Nothing is saved.",
};

export default function DemoGoalsPage() {
  return <DemoGoalsForm />;
}
