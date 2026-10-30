import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { currentOwner } from "@/lib/auth";
import { loadDashboardData } from "@/lib/dashboard/load";
import type { ViewId } from "@/modules/types";
import { addTask, answerGate, deleteGalleryItem, deleteTask, listGallery, moveTask, setTodayEntry, toggleTodayTracker, updateTask } from "./actions";

/**
 * One page of the real app, signed in as the owner. Every page reads the same data, so moving
 * between them is instant once visited. Anyone else goes to /login (`/` shows a welcome instead).
 */
export function OwnerDashboard({ view, signedOut }: { view: ViewId; signedOut?: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <p role="status" className="m-0 p-6 text-center text-sm text-soft">
          Loading…
        </p>
      }
    >
      <Content view={view} signedOut={signedOut} />
    </Suspense>
  );
}

async function Content({ view, signedOut }: { view: ViewId; signedOut?: React.ReactNode }) {
  const owner = await currentOwner();
  if (!owner) {
    if (signedOut) return signedOut;
    redirect("/login");
  }
  const data = await loadDashboardData(owner.supabase);
  if (!data) {
    return <p className="m-0 p-6 text-center text-sm text-danger">Couldn&apos;t load your dashboard. Refresh to try again.</p>;
  }
  return (
    <Dashboard
      data={data}
      view={view}
      onToggleToday={toggleTodayTracker}
      onSetEntry={setTodayEntry}
      taskActions={{ add: addTask, update: updateTask, move: moveTask, remove: deleteTask, gate: answerGate }}
      galleryActions={{ list: listGallery, remove: deleteGalleryItem }}
    />
  );
}
