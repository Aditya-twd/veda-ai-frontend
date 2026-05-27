"use client";
import { useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Clock,
  CircleCheck,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  completed: { text: "Completed", cls: "text-[#2E7D32] bg-[#2E7D32]/10" },
  generating: { text: "Generating…", cls: "text-[#C77700] bg-[#C77700]/10" },
  queued: { text: "Queued", cls: "text-[#C77700] bg-[#C77700]/10" },
  draft: { text: "Draft", cls: "text-[#5E5E5E] bg-black/[0.06]" },
};

export default function HomePage() {
  const { assignments, loaded, loading, fetchAssignments } = useAssignmentStore();
  const firstName = useAuthStore((s) => s.user?.name?.split(" ")[0] || "there");

  useEffect(() => {
    if (!loaded) fetchAssignments();
  }, [loaded, fetchAssignments]);

  const visible = assignments.filter((a) => a.status !== "failed");
  const completed = visible.filter((a) => a.status === "completed").length;
  const inProgress = visible.filter((a) => a.status === "queued" || a.status === "generating").length;
  const recent = visible.slice(0, 4);

  const stats = [
    { label: "Total assignments", value: visible.length },
    { label: "Completed", value: completed },
    { label: "In progress", value: inProgress },
  ];

  return (
    <AppLayout breadcrumb="Home" icon="grid">
      {/* Greeting */}
      <div className="flex items-center gap-3 mb-1">
        <span className="w-3 h-3 rounded-full bg-[#4BC26D] ring-[3px] ring-[#4BC26D]/30 flex-shrink-0" />
        <h1 className="font-bold text-[22px] text-[#303030]">Welcome back, {firstName}</h1>
      </div>
      <p className="text-[14px] text-[#5E5E5E]/75 ml-6 mb-6">
        Here&apos;s a quick look at your assessments.
      </p>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Link
          href="/assignments/create"
          className="press group relative overflow-hidden bg-[#181818] rounded-[22px] p-6 text-white shadow-[0_8px_28px_rgba(0,0,0,0.12)] hover:bg-black"
        >
          <div className="pointer-events-none absolute -top-10 -right-8 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(255,86,35,0.4),transparent_65%)] blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center">
              <Sparkles size={20} fill="white" className="text-white" />
            </div>
            <ArrowRight
              size={20}
              className="text-white/60 transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
          <h2 className="relative mt-5 font-bold text-[18px]">Create assignment</h2>
          <p className="relative mt-1 text-[13.5px] text-white/65">
            Set up question types and let AI write the paper.
          </p>
        </Link>

        <Link
          href="/assignments"
          className="press group bg-white rounded-[22px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5623]/10 flex items-center justify-center text-[#FF5623]">
              <FileText size={20} />
            </div>
            <ArrowUpRight
              size={20}
              className="text-[#C9C9C9] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
          <h2 className="mt-5 font-bold text-[18px] text-[#303030]">View assignments</h2>
          <p className="mt-1 text-[13.5px] text-[#5E5E5E]">
            Browse, generate, and download your question papers.
          </p>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-[22px] px-5 py-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          >
            <p className="font-bold text-[26px] md:text-[30px] text-[#303030] leading-none">
              {s.value}
            </p>
            <p className="mt-1.5 text-[12.5px] md:text-[13px] text-[#5E5E5E]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent assignments */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-[17px] text-[#303030]">Recent assignments</h2>
        <Link
          href="/assignments"
          className="flex items-center gap-1 text-[13.5px] font-medium text-[#5E5E5E] hover:text-[#303030] transition-colors"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {!loaded && loading ? (
        <div className="flex items-center justify-center py-16 text-[#9A9A9A] gap-2">
          <Loader2 className="animate-spin" size={22} />
          <span className="text-sm">Loading…</span>
        </div>
      ) : recent.length === 0 ? (
        <div className="bg-white rounded-[22px] p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <p className="text-[15px] font-semibold text-[#303030]">No assignments yet</p>
          <p className="mt-1 text-[13px] text-[#9A9A9A]">
            Create your first assignment to get started.
          </p>
          <Link
            href="/assignments/create"
            className="mt-4 inline-flex items-center gap-2 bg-[#181818] text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-black transition-colors"
          >
            <Sparkles size={15} fill="white" />
            Create assignment
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] divide-y divide-black/[0.05]">
          {recent.map((a) => {
            const badge = STATUS_LABEL[a.status];
            const href =
              a.status === "completed" ? `/assignments/${a._id}/output` : "/assignments";
            return (
              <Link
                key={a._id}
                href={href}
                className="flex items-center gap-3 px-5 py-4 hover:bg-[#FAFAFA] transition-colors first:rounded-t-[22px] last:rounded-b-[22px]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F2F2F2] flex items-center justify-center flex-shrink-0">
                  {a.status === "completed" ? (
                    <CircleCheck size={17} className="text-[#2E7D32]" />
                  ) : a.status === "generating" || a.status === "queued" ? (
                    <Clock size={17} className="text-[#C77700]" />
                  ) : (
                    <FileText size={17} className="text-[#9A9A9A]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-[#303030] truncate">{a.title}</p>
                  <p className="text-[12px] text-[#9A9A9A]">Assigned on {formatDate(a.createdAt)}</p>
                </div>
                {badge && (
                  <span
                    className={`hidden sm:inline text-[11px] font-semibold rounded-full px-2.5 py-1 ${badge.cls}`}
                  >
                    {badge.text}
                  </span>
                )}
                <ArrowRight size={16} className="text-[#C9C9C9] flex-shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
