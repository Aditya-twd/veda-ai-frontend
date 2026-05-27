"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Loader2, Wand2, ArrowRight, FileText, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { formatDate } from "@/lib/format";

export default function ToolkitPage() {
  const { assignments, loaded, loading, fetchAssignments } = useAssignmentStore();

  useEffect(() => {
    if (!loaded) fetchAssignments();
  }, [loaded, fetchAssignments]);

  const papers = assignments.filter((a) => a.status === "completed");

  return (
    <AppLayout breadcrumb="AI Teacher's Toolkit" icon="sparkle">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-3 h-3 rounded-full bg-[#4BC26D] ring-[3px] ring-[#4BC26D]/30 flex-shrink-0" />
        <h1 className="font-bold text-[22px] text-[#303030]">AI Teacher&apos;s Toolkit</h1>
      </div>
      <p className="text-[14px] text-[#5E5E5E]/75 ml-6 mb-6">
        Open a generated paper to refine it section by section with AI, or edit it by hand.
      </p>

      {!loaded && loading ? (
        <div className="flex items-center justify-center py-20 text-[#9A9A9A] gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-sm">Loading your papers…</span>
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-white rounded-[22px] p-12 text-center shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5623]/10 flex items-center justify-center mx-auto">
            <Wand2 className="text-[#FF5623]" size={22} />
          </div>
          <p className="mt-4 text-[15px] font-semibold text-[#303030]">Nothing to edit yet</p>
          <p className="mt-1 text-[13px] text-[#9A9A9A] max-w-sm mx-auto">
            Generate a question paper first, then come back here to refine it with AI.
          </p>
          <Link
            href="/assignments/create"
            className="mt-5 inline-flex items-center gap-2 bg-[#181818] text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-black transition-colors"
          >
            <Sparkles size={15} fill="white" />
            Create assignment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {papers.map((a) => (
            <Link
              key={a._id}
              href={`/toolkit/${a._id}`}
              className="group bg-white rounded-[22px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F2F2F2] flex items-center justify-center">
                  <FileText size={18} className="text-[#5E5E5E]" />
                </div>
                <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#FF5623] bg-[#FF5623]/10 rounded-full px-3 py-1.5">
                  <Wand2 size={13} />
                  Edit with AI
                </span>
              </div>
              <h3 className="mt-4 font-bold text-[16px] text-[#303030] truncate">{a.title}</h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[12px] text-[#9A9A9A]">
                  {a.totalQuestions} questions · {a.totalMarks} marks
                </span>
                <span className="flex items-center gap-1 text-[12px] text-[#9A9A9A] group-hover:text-[#303030] transition-colors">
                  Open
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#B6B6B6]">Created {formatDate(a.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
