"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import EmptyState from "./EmptyState";
import AssignmentList from "./AssignmentList";
import { useAssignmentStore } from "@/store/useAssignmentStore";

export default function AssignmentsPage() {
  const { assignments, loaded, loading, error, fetchAssignments } = useAssignmentStore();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const isEmpty = loaded && assignments.length === 0 && !error;

  return (
    <AppLayout breadcrumb="Assignment">
      {!loaded && loading && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#9A9A9A] gap-3">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading assignments…</span>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-center px-6">
          <p className="text-[15px] font-semibold text-[#303030]">Couldn’t reach the server</p>
          <p className="text-[13px] text-[#9A9A9A] max-w-sm">{error}</p>
          <button
            onClick={() => fetchAssignments()}
            className="mt-2 bg-[#181818] text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-black transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {loaded && !error && (isEmpty ? <EmptyState /> : <AssignmentList />)}

      {/* Mobile-only floating "+" action button */}
      <Link
        href="/assignments/create"
        className="md:hidden fixed right-4 bottom-24 z-40 w-12 h-12 rounded-full bg-[#FF5623] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(255,86,35,0.45)] active:scale-95 transition-transform"
        aria-label="Create assignment"
      >
        <Plus size={24} strokeWidth={2.6} />
      </Link>
    </AppLayout>
  );
}
