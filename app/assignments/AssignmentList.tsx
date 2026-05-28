"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  SlidersHorizontal,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  Eye,
  Check,
} from "lucide-react";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { ApiAssignment } from "@/lib/api";
import { formatDate } from "@/lib/format";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  queued: { text: "Queued", cls: "text-[#C77700] bg-[#C77700]/10" },
  generating: { text: "Generating…", cls: "text-[#C77700] bg-[#C77700]/10" },
  failed: { text: "Failed", cls: "text-[#D7263D] bg-[#D7263D]/10" },
};

type StatusFilter = "all" | ApiAssignment["status"];

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "generating", label: "Generating" },
  { value: "queued", label: "Queued" },
  { value: "draft", label: "Draft" },
];

function Card({ a }: { a: ApiAssignment }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const removeAssignment = useAssignmentStore((s) => s.removeAssignment);
  const badge = STATUS_LABEL[a.status];
  const href = `/assignments/${a._id}/output`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      }}
      className="bg-white rounded-[22px] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative cursor-pointer transition-all hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5623]/40"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 pr-2">
          <h3 className="font-bold text-[24px] text-[#303030]">{a.title}</h3>
          {badge && (
            <span className={`text-[12px] font-semibold rounded-full px-2 py-0.5 ${badge.cls}`}>
              {badge.text}
            </span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="w-7 h-7 -mr-1 -mt-1 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Assignment options"
          >
            <MoreVertical size={17} strokeWidth={2.2} className="text-[#9A9A9A]" />
          </button>
          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
              />
              <div
                className="absolute right-0 top-8 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.14)] border border-gray-100 py-1.5 z-20 min-w-[170px]"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#303030] hover:bg-gray-50 transition-colors"
                >
                  <Eye size={15} strokeWidth={1.9} className="text-[#5E5E5E]" />
                  View Assignment
                </Link>
                <button
                  onClick={() => {
                    removeAssignment(a._id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#E0411F] hover:bg-red-50/60 transition-colors text-left"
                >
                  <Trash2 size={15} strokeWidth={1.9} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-12">
        <span className="text-[16px] text-[#5E5E5E]">
          <span className="font-bold text-[#303030]">Assigned on</span> : {formatDate(a.createdAt)}
        </span>
        <span className="text-[16px] text-[#5E5E5E]">
          <span className="font-bold text-[#303030]">Due</span> : {formatDate(a.dueDate)}
        </span>
      </div>
    </div>
  );
}

export default function AssignmentList() {
  const { assignments } = useAssignmentStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = assignments.filter((a) => {
    if (a.status === "failed") return false; // never show failed generations
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || a.status === status;
    return matchesSearch && matchesStatus;
  });

  const activeFilter = STATUS_FILTERS.find((f) => f.value === status)!;

  return (
    <div className="relative pb-24 md:pb-12">
      {/* Title */}
      <div className="flex items-center gap-3 mb-1">
        <span className="w-3 h-3 rounded-full bg-[#4BC26D] ring-[3px] ring-[#4BC26D]/30 flex-shrink-0" />
        <h1 className="font-bold text-[22px] text-[#303030]">Assignments</h1>
      </div>
      <p className="text-[14px] text-[#5E5E5E]/75 ml-6 mb-6">
        Manage and create assignments for your classes.
      </p>

      {/* Filter + Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-colors ${
              status === "all"
                ? "bg-white text-[#5E5E5E] hover:bg-gray-50"
                : "bg-[#181818] text-white hover:bg-black"
            }`}
          >
            <SlidersHorizontal size={15} strokeWidth={1.9} />
            {status === "all" ? "Filter By" : activeFilter.label}
          </button>
          {filterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
              <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.14)] border border-gray-100 py-1.5 z-20 min-w-[200px]">
                <p className="px-4 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wide text-[#A9A9A9]">
                  Status
                </p>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => {
                      setStatus(f.value);
                      setFilterOpen(false);
                    }}
                    className="flex w-full items-center justify-between gap-2.5 px-4 py-2.5 text-[14px] text-[#303030] hover:bg-gray-50 transition-colors text-left"
                  >
                    {f.label}
                    {status === f.value && (
                      <Check size={15} strokeWidth={2.4} className="text-[#FF5623]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="flex-1 relative">
          <Search
            size={16}
            strokeWidth={1.9}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A9A9A9]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Assignment"
            className="w-full bg-white rounded-full pl-11 pr-4 py-3 text-[14px] text-[#303030] placeholder:text-[#A9A9A9] outline-none shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <Card key={a._id} a={a} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center py-16 text-[14px] text-[#A9A9A9]">No assignments found.</p>
      )}

      {/* Floating CTA (desktop — mobile uses the round + FAB) */}
      <div className="hidden md:flex justify-center fixed left-[312px] right-3.5 bottom-7 z-30 pointer-events-none">
        <Link
          href="/assignments/create"
          className="pointer-events-auto flex items-center gap-2.5 bg-[#181818] text-white font-semibold text-[15px] rounded-full px-8 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:bg-black transition-colors"
        >
          <Plus size={19} strokeWidth={2.6} />
          Create Assignment
        </Link>
      </div>
    </div>
  );
}
