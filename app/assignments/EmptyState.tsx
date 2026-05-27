"use client";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh] md:min-h-[calc(100vh-140px)] px-6">
      {/* Exact illustration from the design */}
      <Image
        src="/notFound.png"
        alt="No assignments"
        width={300}
        height={250}
        priority
        className="w-[230px] md:w-[300px] h-auto mb-6"
      />

      <h2 className="text-[22px] font-bold text-[#303030] mb-2.5">
        No assignments yet
      </h2>
      <p className="text-[14px] text-[#5E5E5E]/80 max-w-[420px] leading-[1.55] mb-7">
        Create your first assignment to start collecting and grading student
        submissions. You can set up rubrics, define marking criteria, and let AI
        assist with grading.
      </p>

      <Link
        href="/assignments/create"
        className="flex items-center gap-2 bg-[#181818] text-white font-semibold text-[15px] rounded-full px-6 py-3.5 hover:bg-black transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
      >
        <Plus size={17} strokeWidth={2.6} />
        Create Your First Assignment
      </Link>
    </div>
  );
}
