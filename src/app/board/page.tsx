import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";

export const metadata: Metadata = { title: "Board · Yasir OS" };

export default function Page() {
  return <OwnerDashboard view="board" />;
}
