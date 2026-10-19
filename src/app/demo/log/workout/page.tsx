import type { Metadata } from "next";
import { DemoWorkoutForm } from "@/components/body/DemoForms";

export const metadata: Metadata = {
  title: "Demo workout · Winter Arc Dashboard",
  description: "The workout log on made-up sample data. Nothing is saved.",
};

export default async function DemoWorkoutPage({ searchParams }: { searchParams: Promise<{ repeat?: string }> }) {
  const { repeat } = await searchParams;
  return <DemoWorkoutForm repeat={repeat === "1"} />;
}
