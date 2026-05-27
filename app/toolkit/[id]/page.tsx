"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Wand2,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  Check,
  X,
  FileText,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { api, ApiPaper } from "@/lib/api";

type Diff = "easy" | "moderate" | "hard";
interface EQ {
  text: string;
  difficulty: Diff;
  marks: number;
  options: string[];
  answer: string;
}
interface ES {
  title: string;
  instruction: string;
  questions: EQ[];
}

const DIFFS: { value: Diff; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Challenging" },
];

const inputCls =
  "w-full bg-[#FAFAFA] border border-black/[0.08] rounded-xl px-3 py-2 text-[14px] text-[#303030] outline-none focus:border-[#FF5623]/50 focus:bg-white transition-colors";

export default function ToolkitEditor() {
  const params = useParams<{ id: string }>();
  const assignmentId = params.id;

  const [paperId, setPaperId] = useState<string | null>(null);
  const [meta, setMeta] = useState<ApiPaper["meta"] | null>(null);
  const [sections, setSections] = useState<ES[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [regen, setRegen] = useState<number | null>(null);
  const [instrOpen, setInstrOpen] = useState<number | null>(null);
  const [instr, setInstr] = useState<Record<number, string>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getPaperByAssignment(assignmentId)
      .then((p) => {
        if (!active) return;
        setPaperId(p._id);
        setMeta(p.meta);
        let idx = 0;
        setSections(
          p.sections.map((s) => ({
            title: s.title,
            instruction: s.instruction,
            questions: s.questions.map((q) => {
              idx += 1;
              return {
                text: q.text,
                difficulty: (q.difficulty as Diff) || "moderate",
                marks: q.marks,
                options: [...(q.options || [])],
                answer: p.answerKey.find((a) => a.index === idx)?.answer ?? "",
              };
            }),
          }))
        );
        setState("ready");
      })
      .catch(() => active && setState("missing"));
    return () => {
      active = false;
    };
  }, [assignmentId]);

  // ── mutations ──
  const mutateQ = (si: number, qi: number, patch: Partial<EQ>) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i !== si ? s : { ...s, questions: s.questions.map((q, j) => (j !== qi ? q : { ...q, ...patch })) }
      )
    );
  const mutateSection = (si: number, patch: Partial<ES>) =>
    setSections((prev) => prev.map((s, i) => (i !== si ? s : { ...s, ...patch })));
  const addQuestion = (si: number) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i !== si
          ? s
          : { ...s, questions: [...s.questions, { text: "", difficulty: "moderate", marks: 1, options: [], answer: "" }] }
      )
    );
  const removeQuestion = (si: number, qi: number) =>
    setSections((prev) =>
      prev.map((s, i) => (i !== si ? s : { ...s, questions: s.questions.filter((_, j) => j !== qi) }))
    );
  const setOption = (si: number, qi: number, oi: number, val: string) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i !== si
          ? s
          : {
              ...s,
              questions: s.questions.map((q, j) =>
                j !== qi ? q : { ...q, options: q.options.map((o, k) => (k === oi ? val : o)) }
              ),
            }
      )
    );
  const addOption = (si: number, qi: number) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i !== si ? s : { ...s, questions: s.questions.map((q, j) => (j !== qi ? q : { ...q, options: [...q.options, ""] })) }
      )
    );
  const removeOption = (si: number, qi: number, oi: number) =>
    setSections((prev) =>
      prev.map((s, i) =>
        i !== si
          ? s
          : { ...s, questions: s.questions.map((q, j) => (j !== qi ? q : { ...q, options: q.options.filter((_, k) => k !== oi) })) }
      )
    );

  const totalMarks = sections.reduce(
    (t, s) => t + s.questions.reduce((a, q) => a + (Number(q.marks) || 0), 0),
    0
  );

  async function regenerate(si: number) {
    if (!paperId) return;
    setErr(null);
    setRegen(si);
    try {
      const { questions } = await api.regenerateSection(paperId, si, instr[si] || "");
      setSections((prev) =>
        prev.map((s, i) =>
          i !== si
            ? s
            : {
                ...s,
                questions: questions.map((q) => ({
                  text: q.text,
                  difficulty: (q.difficulty as Diff) || "moderate",
                  marks: q.marks,
                  options: [...(q.options || [])],
                  answer: q.answer || "",
                })),
              }
        )
      );
      setInstrOpen(null);
    } catch (e) {
      setErr((e as Error).message);
    }
    setRegen(null);
  }

  async function save() {
    if (!paperId || !meta) return;
    setErr(null);
    setSaving(true);
    try {
      let idx = 0;
      const answerKey: { index: number; answer: string }[] = [];
      const payloadSections = sections.map((s) => ({
        title: s.title,
        instruction: s.instruction,
        questions: s.questions.map((q) => {
          idx += 1;
          if (q.answer?.trim()) answerKey.push({ index: idx, answer: q.answer.trim() });
          return {
            text: q.text,
            difficulty: q.difficulty,
            marks: Number(q.marks) || 0,
            options: q.options.map((o) => o.trim()).filter(Boolean),
          };
        }),
      }));
      await api.updatePaper(paperId, {
        meta: { subject: meta.subject, class: meta.class, timeAllowed: meta.timeAllowed, maxMarks: totalMarks },
        sections: payloadSections,
        answerKey,
      });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch (e) {
      setErr((e as Error).message);
    }
    setSaving(false);
  }

  if (state === "loading") {
    return (
      <AppLayout breadcrumb="AI Teacher's Toolkit" icon="sparkle">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#9A9A9A] gap-3">
          <Loader2 className="animate-spin" size={28} />
          <span className="text-sm">Loading paper…</span>
        </div>
      </AppLayout>
    );
  }

  if (state === "missing") {
    return (
      <AppLayout breadcrumb="AI Teacher's Toolkit" icon="sparkle">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C77700]/10 flex items-center justify-center">
            <AlertCircle className="text-[#C77700]" size={24} />
          </div>
          <p className="text-[15px] font-semibold text-[#303030]">No paper to edit</p>
          <Link
            href="/toolkit"
            className="mt-2 bg-[#181818] text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-black transition-colors"
          >
            Back to Toolkit
          </Link>
        </div>
      </AppLayout>
    );
  }

  let qNum = 0;

  return (
    <AppLayout breadcrumb="AI Teacher's Toolkit" icon="sparkle">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-30 -mx-3 md:mx-0 px-3 md:px-0 pt-1 pb-3 mb-4 bg-[#EDEDED]/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 bg-white rounded-[18px] px-4 py-3 shadow-[0_4px_18px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/assignments/${assignmentId}/output`}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Back to paper"
            >
              <ArrowLeft size={18} className="text-[#303030]" />
            </Link>
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#303030] truncate">
                Editing {meta?.subject ? `· ${meta.subject}` : "paper"}
              </p>
              <p className="text-[12px] text-[#9A9A9A]">{totalMarks} marks total</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/assignments/${assignmentId}/output`}
              className="hidden sm:flex items-center gap-1.5 text-[14px] font-medium text-[#5E5E5E] hover:text-[#303030] px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FileText size={15} />
              View paper
            </Link>
            <button
              onClick={save}
              disabled={saving}
              className={`flex items-center gap-2 text-[14px] font-semibold rounded-full px-5 py-2.5 transition-all active:scale-[0.97] ${
                justSaved ? "bg-[#2E7D32] text-white" : "bg-[#181818] text-white hover:bg-black"
              } disabled:opacity-60`}
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : justSaved ? (
                <Check size={15} />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving…" : justSaved ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>
        {err && (
          <p className="mt-2 text-[13px] text-[#D7263D] bg-[#D7263D]/8 rounded-xl px-4 py-2">{err}</p>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-5 pb-8">
        {sections.map((section, si) => (
          <div
            key={si}
            className="bg-white rounded-[24px] p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]"
          >
            {/* section header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <input
                  value={section.title}
                  onChange={(e) => mutateSection(si, { title: e.target.value })}
                  className="w-full font-bold text-[17px] text-[#303030] bg-transparent outline-none border-b border-transparent focus:border-black/10 pb-1"
                  placeholder="Section title"
                />
                <input
                  value={section.instruction}
                  onChange={(e) => mutateSection(si, { instruction: e.target.value })}
                  className="mt-1 w-full text-[13px] italic text-[#9A9A9A] bg-transparent outline-none"
                  placeholder="Section instruction (optional)"
                />
              </div>
              <button
                onClick={() => setInstrOpen(instrOpen === si ? null : si)}
                disabled={regen === si}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#FF5623] bg-[#FF5623]/10 rounded-full px-3 py-2 hover:bg-[#FF5623]/15 transition-colors flex-shrink-0 disabled:opacity-60"
              >
                {regen === si ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {regen === si ? "Regenerating…" : "Regenerate"}
              </button>
            </div>

            {/* regenerate instruction box */}
            {instrOpen === si && (
              <div className="mb-4 bg-[#FFF6F3] border border-[#FF5623]/20 rounded-2xl p-3.5">
                <p className="text-[12.5px] font-medium text-[#5E5E5E] mb-2">
                  How should the AI rewrite this section? (optional)
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={instr[si] || ""}
                    onChange={(e) => setInstr((p) => ({ ...p, [si]: e.target.value }))}
                    placeholder="e.g. make these harder, add more numericals, focus on chapter 3…"
                    className={inputCls}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => regenerate(si)}
                      disabled={regen === si}
                      className="flex items-center gap-1.5 bg-[#FF5623] text-white text-[13px] font-semibold rounded-xl px-4 py-2 hover:bg-[#e84d1f] transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      <RefreshCw size={14} className={regen === si ? "animate-spin" : ""} />
                      Regenerate
                    </button>
                    <button
                      onClick={() => setInstrOpen(null)}
                      className="w-9 flex items-center justify-center text-[#9A9A9A] hover:text-[#303030] rounded-xl hover:bg-black/5 transition-colors"
                      aria-label="Cancel"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* questions */}
            <div className="flex flex-col gap-3">
              {section.questions.map((q, qi) => {
                qNum += 1;
                return (
                  <div key={qi} className="rounded-2xl border border-black/[0.06] p-4">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[13px] font-bold text-[#9A9A9A]">Q{qNum}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={q.difficulty}
                          onChange={(e) => mutateQ(si, qi, { difficulty: e.target.value as Diff })}
                          className="text-[12.5px] font-medium text-[#303030] bg-[#F2F2F2] rounded-lg px-2 py-1.5 outline-none cursor-pointer"
                        >
                          {DIFFS.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-1 bg-[#F2F2F2] rounded-lg px-2 py-1">
                          <input
                            type="number"
                            min={0}
                            value={q.marks}
                            onChange={(e) => mutateQ(si, qi, { marks: Number(e.target.value) })}
                            className="w-10 bg-transparent text-[12.5px] font-medium text-[#303030] outline-none text-center"
                          />
                          <span className="text-[12px] text-[#9A9A9A]">mk</span>
                        </div>
                        <button
                          onClick={() => removeQuestion(si, qi)}
                          className="w-8 h-8 flex items-center justify-center text-[#C9C9C9] hover:text-[#D7263D] hover:bg-[#D7263D]/8 rounded-lg transition-colors"
                          aria-label="Remove question"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={q.text}
                      onChange={(e) => mutateQ(si, qi, { text: e.target.value })}
                      rows={2}
                      placeholder="Question text"
                      className={`${inputCls} resize-y`}
                    />

                    {/* options */}
                    {q.options.length > 0 && (
                      <div className="mt-2.5 flex flex-col gap-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <span className="text-[12.5px] font-semibold text-[#9A9A9A] w-5">
                              {String.fromCharCode(65 + oi)})
                            </span>
                            <input
                              value={opt}
                              onChange={(e) => setOption(si, qi, oi, e.target.value)}
                              className={inputCls}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            />
                            <button
                              onClick={() => removeOption(si, qi, oi)}
                              className="w-7 h-7 flex items-center justify-center text-[#C9C9C9] hover:text-[#D7263D] rounded-lg transition-colors flex-shrink-0"
                              aria-label="Remove option"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => addOption(si, qi)}
                      className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-[#5E5E5E] hover:text-[#FF5623] transition-colors"
                    >
                      <Plus size={13} />
                      Add option
                    </button>

                    {/* answer */}
                    <div className="mt-3">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-[#A9A9A9]">
                        Answer
                      </label>
                      <textarea
                        value={q.answer}
                        onChange={(e) => mutateQ(si, qi, { answer: e.target.value })}
                        rows={2}
                        placeholder="Model answer"
                        className={`${inputCls} mt-1 resize-y bg-[#F7FBF8] focus:bg-white`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => addQuestion(si)}
              className="mt-3 flex items-center justify-center gap-1.5 w-full text-[13.5px] font-medium text-[#5E5E5E] border border-dashed border-black/15 rounded-xl py-2.5 hover:border-[#FF5623]/40 hover:text-[#FF5623] transition-colors"
            >
              <Plus size={15} />
              Add question
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}
