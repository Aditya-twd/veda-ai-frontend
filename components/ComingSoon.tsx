"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";

interface ComingSoonProps {
  /** Page name — used for the breadcrumb and the heading */
  title: string;
  /** One-line description of what the feature will do */
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <AppLayout breadcrumb={title} icon="grid">
      <div className="flex flex-col items-center justify-center text-center min-h-[60vh] md:min-h-[calc(100vh-140px)] px-6">
        {/* Reuse the design's empty-state illustration */}
        <Image
          src="/notFound.png"
          alt={title}
          width={300}
          height={250}
          priority
          className="w-[220px] md:w-[280px] h-auto mb-6 rise"
        />

        <span
          className="rise inline-flex items-center gap-2 rounded-full bg-[#F2F2F2] text-[#5E5E5E] text-[12.5px] font-semibold px-3.5 py-1.5 mb-4"
          style={{ animationDelay: "80ms" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5623]" />
          Coming soon
        </span>

        <h2
          className="rise text-[22px] md:text-[26px] font-bold text-[#303030] mb-2.5"
          style={{ animationDelay: "140ms" }}
        >
          {title}
        </h2>
        <p
          className="rise text-[14px] text-[#5E5E5E]/80 max-w-[440px] leading-[1.55] mb-7"
          style={{ animationDelay: "200ms" }}
        >
          {description}
        </p>

        <div
          className="rise flex flex-col sm:flex-row items-center gap-3"
          style={{ animationDelay: "260ms" }}
        >
          <Link
            href="/home"
            className="press group flex items-center gap-2 bg-[#181818] text-white font-semibold text-[15px] rounded-full px-6 py-3.5 hover:bg-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          >
            <ArrowLeft
              size={17}
              strokeWidth={2.4}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Back to Home
          </Link>
          <Link
            href="/assignments/create"
            className="press flex items-center gap-2 bg-white text-[#303030] font-semibold text-[15px] rounded-full px-6 py-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
          >
            <Sparkles size={16} className="text-[#303030]" fill="#303030" />
            Create assignment
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
