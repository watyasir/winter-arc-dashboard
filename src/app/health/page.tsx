import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";

export const metadata: Metadata = { title: "Health · Yasir OS" };

export default function Page() {
  return <OwnerDashboard view="health" />;
}
