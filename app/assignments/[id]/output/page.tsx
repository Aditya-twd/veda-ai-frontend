"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileText, Loader2, AlertCircle, Wand2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { api, ApiPaper } from "@/lib/api";
import { difficultyLabel } from "@/lib/format";

const DIFF_CHIP: Record<string, string> = {
  easy: "text-[#2E7D32] bg-[#2E7D32]/10",
  moderate: "text-[#C77700] bg-[#C77700]/10",
  hard: "text-[#D7263D] bg-[#D7263D]/10",
};

const OPTION_LETTERS = "ABCDEFGH";

export default function OutputPage() {
  const params = useParams<{ id: string }>();
  const assignmentId = params.id;
  const [paper, setPaper] = useState<ApiPaper | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload(p: ApiPaper) {
    setDownloading(true);
    setDownloadError(null);
    try {
      const name = `${p.meta.subject || "question-paper"}${p.meta.class ? `-class-${p.meta.class}` : ""}.pdf`;
      await api.downloadPdf(p._id, name.replace(/\s+/g, "-").toLowerCase());
    } catch (e) {
      setDownloadError((e as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api
      .getPaperByAssignment(assignmentId)
      .then((p) => {
        if (active) {
          setPaper(p);
          setState("ready");
        }
      })
      .catch(() => active && setState("missing"));
    return () => {
      active = false;
    };
  }, [assignmentId]);

  if (state === "loading") {
    return (
      <AppLayout breadcrumb="Create New" icon="sparkle">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#9A9A9A] gap-3">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading question paper…</span>
        </div>
      </AppLayout>
    );
  }

  if (state === "missing" || !paper) {
    return (
      <AppLayout breadcrumb="Create New" icon="sparkle">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C77700]/10 flex items-center justify-center">
            <AlertCircle className="text-[#C77700]" size={24} />
          </div>
          <p className="text-[15px] font-semibold text-[#303030]">No paper yet</p>
          <p className="text-[13px] text-[#9A9A9A] max-w-sm">
            This assignment hasn’t finished generating, or no paper was produced.
          </p>
          <Link
            href="/assignments"
            className="mt-2 bg-[#181818] text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-black transition-colors"
          >
            Back to Assignments
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { meta, sections, answerKey } = paper;
  let qNum = 0;

  return (
    <AppLayout breadcrumb="Create New" icon="sparkle">
      {paper.isFallback && (
        <div className="flex items-start gap-2.5 bg-[#FFF4E5] border border-[#F0C27A] text-[#9A5B00] rounded-[16px] px-4 py-3 mb-4">
          <AlertCircle size={18} strokeWidth={2} className="mt-0.5 flex-shrink-0" />
          <p className="text-[13px] leading-snug">
            <span className="font-semibold">Sample output</span> — the AI service was temporarily
            unavailable, so a placeholder paper was generated. Try regenerating in a moment for a
            paper based on your inputs.
          </p>
        </div>
      )}

      {/* AI banner */}
      <div className="bg-[#262626] rounded-[24px] px-5 md:px-7 py-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleDownload(paper)}
            disabled={downloading}
            className="flex items-center gap-2 bg-white text-[#303030] text-[14px] font-semibold rounded-full px-4 py-2.5 hover:bg-gray-100 active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 size={15} strokeWidth={2} className="animate-spin" />
            ) : (
              <FileText size={15} strokeWidth={2} />
            )}
            {downloading ? "Preparing…" : "Download as PDF"}
          </button>
          <Link
            href={`/toolkit/${assignmentId}`}
            className="flex items-center gap-2 bg-[#FF5623] text-white text-[14px] font-semibold rounded-full px-4 py-2.5 hover:bg-[#e84d1f] active:scale-[0.97] transition-all"
          >
            <Wand2 size={15} strokeWidth={2} />
            Edit with AI
          </Link>
        </div>
        {downloadError && (
          <p className="text-[13px] text-[#FFB4A6] bg-white/5 rounded-xl px-3.5 py-2">
            {downloadError}
          </p>
        )}
        <p className="text-[16px] md:text-[18px] font-bold text-white leading-snug">
          Certainly! Here is your customized question paper
          {meta.subject ? ` for ${meta.subject}` : ""}
          {meta.class ? `, Class ${meta.class}` : ""}:
        </p>
      </div>

      {/* Paper */}
      <div className="bg-white rounded-[24px] mt-4 p-6 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        {/* School header */}
        <div className="text-center">
          <h1 className="font-bold text-[20px] md:text-[24px] text-[#303030]">
            {meta.school || "School"}
          </h1>
          {meta.subject && (
            <p className="text-[15px] md:text-[17px] text-[#303030] mt-1">Subject: {meta.subject}</p>
          )}
          {meta.class && (
            <p className="text-[15px] md:text-[17px] text-[#303030]">Class: {meta.class}</p>
          )}
        </div>
        <div className="border-t border-[#303030] my-5" />

        {/* Meta */}
        <div className="flex justify-between text-[14px] md:text-[15px] text-[#303030] mb-4">
          <span>Time Allowed: {meta.timeAllowed || "—"}</span>
          <span>Maximum Marks: {meta.maxMarks}</span>
        </div>
        <p className="text-[14px] md:text-[15px] text-[#303030] mb-6">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student fields */}
        <div className="flex flex-col gap-3 mb-8 text-[14px] md:text-[15px] text-[#303030] max-w-[460px]">
          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap">Name:</span>
            <span className="flex-1 exam-line h-5" />
          </div>
          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap">Roll Number:</span>
            <span className="flex-1 exam-line h-5" />
          </div>
          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap">
              Class: {meta.class || ""}&nbsp;&nbsp;Section:
            </span>
            <span className="flex-1 exam-line h-5" />
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, si) => (
          <div key={si} className="mb-6">
            <h2 className="text-center font-bold text-[16px] md:text-[18px] text-[#303030] mb-3">
              {section.title}
            </h2>
            {section.instruction && (
              <p className="text-[13px] md:text-[14px] text-[#303030] italic mb-4">
                {section.instruction}
              </p>
            )}
            <ol className="flex flex-col gap-4">
              {section.questions.map((q, qi) => {
                qNum += 1;
                return (
                  <li
                    key={qi}
                    className="flex gap-2.5 text-[14px] md:text-[15px] text-[#303030] leading-relaxed"
                  >
                    <span className="font-medium w-5 flex-shrink-0">{qNum}.</span>
                    <div className="flex-1 min-w-0">
                      {/* Question line: text on the left; difficulty + marks together on the far right */}
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="min-w-0">{q.text}</p>
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] md:text-[12px] font-semibold ${
                              DIFF_CHIP[q.difficulty] ?? DIFF_CHIP.moderate
                            }`}
                          >
                            {difficultyLabel(q.difficulty)}
                          </span>
                          <span className="font-medium text-[#5E5E5E]">
                            [{q.marks} {q.marks === 1 ? "Mark" : "Marks"}]
                          </span>
                        </span>
                      </div>

                      {/* MCQ options */}
                      {q.options && q.options.length > 0 && (
                        <ol className="mt-2.5 grid sm:grid-cols-2 gap-x-8 gap-y-1.5 pl-0.5">
                          {q.options.map((opt, oi) => (
                            <li key={oi} className="flex gap-2 text-[#444]">
                              <span className="font-medium text-[#303030]">
                                {OPTION_LETTERS[oi]})
                              </span>
                              <span>{opt}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}

        <p className="font-bold text-[15px] text-[#303030] mt-2">End of Question Paper</p>

        {/* Answer key */}
        {answerKey.length > 0 && (
          <div className="mt-9 pt-7 border-t border-gray-200">
            <h2 className="font-bold text-[16px] md:text-[18px] text-[#303030] mb-4">Answer Key:</h2>
            <ol className="flex flex-col gap-3">
              {answerKey.map((a) => (
                <li key={a.index} className="flex gap-2.5 text-[14px] md:text-[15px] leading-relaxed">
                  <span className="font-semibold text-[#303030] w-5 flex-shrink-0">{a.index}.</span>
                  <p className="flex-1 text-[#444]">{a.answer}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
