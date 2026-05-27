"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { api } from "@/lib/api";
import { getSocket, SOCKET_EVENTS } from "@/lib/socket";

type GenState =
  | { phase: "idle" }
  | { phase: "working"; percent: number; stage: string }
  | { phase: "error"; message: string };

export default function CreateAssignmentPage() {
  const [step, setStep] = useState(1);
  const [gen, setGen] = useState<GenState>({ phase: "idle" });
  const [formError, setFormError] = useState<string | null>(null);
  const router = useRouter();
  const { form, resetForm } = useAssignmentStore();
  const assignmentIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const finishSuccess = (id: string) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopPolling();
    setGen({ phase: "working", percent: 100, stage: "Done" });
    resetForm();
    router.push(`/assignments/${id}/output`);
  };

  // Cleanup socket listeners + polling on unmount.
  useEffect(() => {
    return () => {
      const s = getSocket();
      s.off(SOCKET_EVENTS.GENERATION_PROGRESS);
      s.off(SOCKET_EVENTS.GENERATION_COMPLETED);
      s.off(SOCKET_EVENTS.GENERATION_FAILED);
      stopPolling();
    };
  }, []);

  function validate(): string | null {
    if (!form.title.trim()) return "Please enter an assignment title.";
    if (form.questionTypes.length === 0) return "Add at least one question type.";
    for (const q of form.questionTypes) {
      if (q.numQuestions < 1) return "Each question type needs at least 1 question.";
      if (q.marks < 1) return "Marks must be at least 1 per question.";
    }
    return null;
  }

  async function handleGenerate() {
    const err = validate();
    if (err) {
      setFormError(err);
      setStep(1);
      return;
    }

    setGen({ phase: "working", percent: 5, stage: "Uploading" });
    try {
      // 1. Upload the file (if any).
      let fileMeta;
      if (form.file) fileMeta = await api.uploadFile(form.file);

      // 2. Create the assignment.
      setGen({ phase: "working", percent: 12, stage: "Creating assignment" });
      const assignment = await api.createAssignment({
        title: form.title.trim(),
        dueDate: form.dueDate || undefined,
        questionTypes: form.questionTypes.map((q) => ({
          type: q.type,
          numQuestions: q.numQuestions,
          marks: q.marks,
        })),
        additionalInstructions: form.additionalInfo,
        file: fileMeta,
      });
      assignmentIdRef.current = assignment._id;

      // 3. Subscribe to live progress BEFORE kicking off generation.
      const socket = getSocket();
      const subscribe = () => socket.emit(SOCKET_EVENTS.SUBSCRIBE, { assignmentId: assignment._id });
      // Subscribe now (if connected) and on every (re)connect so events are never missed.
      if (socket.connected) subscribe();
      socket.off("connect").on("connect", subscribe);
      socket.off(SOCKET_EVENTS.GENERATION_PROGRESS).on(
        SOCKET_EVENTS.GENERATION_PROGRESS,
        (p: { assignmentId: string; percent: number; stage: string }) => {
          if (p.assignmentId === assignment._id)
            setGen({ phase: "working", percent: p.percent, stage: p.stage });
        }
      );
      socket.off(SOCKET_EVENTS.GENERATION_COMPLETED).on(
        SOCKET_EVENTS.GENERATION_COMPLETED,
        (p: { assignmentId: string }) => {
          if (p.assignmentId === assignment._id) finishSuccess(assignment._id);
        }
      );
      socket.off(SOCKET_EVENTS.GENERATION_FAILED).on(
        SOCKET_EVENTS.GENERATION_FAILED,
        (p: { assignmentId: string; message: string }) => {
          if (p.assignmentId === assignment._id) {
            stopPolling();
            setGen({ phase: "error", message: humanizeError(p.message) });
          }
        }
      );

      // 4. Kick off generation.
      doneRef.current = false;
      setGen({ phase: "working", percent: 18, stage: "Queued" });
      await api.generate(assignment._id);

      // 5. Safety-net: poll status in case socket events don't arrive.
      stopPolling();
      pollRef.current = setInterval(async () => {
        try {
          const a = await api.getAssignment(assignment._id);
          if (a.status === "completed" && a.paperId) finishSuccess(assignment._id);
          else if (a.status === "failed") {
            stopPolling();
            setGen({
              phase: "error",
              message: "Generation failed. The AI may be rate-limited — please try again in a moment.",
            });
          }
        } catch {
          /* keep polling */
        }
      }, 3000);
    } catch (e) {
      setGen({ phase: "error", message: humanizeError((e as Error).message) });
    }
  }

  return (
    <AppLayout breadcrumb="Assignment">
      {/* Title */}
      <div className="flex items-center gap-3 mb-1">
        <span className="w-3 h-3 rounded-full bg-[#4BC26D] ring-[3px] ring-[#4BC26D]/30 flex-shrink-0" />
        <h1 className="font-bold text-[22px] text-[#303030]">Create Assignment</h1>
      </div>
      <p className="text-[14px] text-[#5E5E5E]/75 ml-6 mb-6">
        Set up a new assignment for your students.
      </p>

      {/* Progress — two segments */}
      <div className="flex items-center gap-3 mb-7 max-w-[820px] mx-auto">
        <div className="h-[5px] flex-1 rounded-full bg-[#303030]" />
        <div
          className="h-[5px] flex-1 rounded-full transition-colors"
          style={{ background: step >= 2 ? "#303030" : "#DADADA" }}
        />
      </div>

      {/* Validation banner */}
      {formError && (
        <div className="max-w-[820px] mx-auto mb-3 flex items-center gap-2 text-[13px] text-[#D7263D] bg-[#D7263D]/8 border border-[#D7263D]/20 rounded-xl px-4 py-2.5">
          <AlertCircle size={15} />
          {formError}
        </div>
      )}

      {/* Card */}
      <div className="max-w-[820px] mx-auto">{step === 1 ? <Step1 /> : <Step2 />}</div>

      {/* Footer */}
      <div className="flex items-center justify-between max-w-[820px] mx-auto mt-7">
        <button
          onClick={() => (step === 1 ? router.back() : setStep(1))}
          className="flex items-center gap-2 bg-white text-[#303030] text-[15px] font-semibold rounded-full px-6 py-3.5 shadow-[0_3px_14px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12.5L5.5 8L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Previous
        </button>
        <button
          onClick={() => {
            setFormError(null);
            if (step === 1) {
              const err = validate();
              if (err) return setFormError(err);
              setStep(2);
            } else {
              handleGenerate();
            }
          }}
          className="flex items-center gap-2 bg-[#181818] text-white text-[15px] font-semibold rounded-full px-7 py-3.5 hover:bg-black transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
        >
          {step === 2 ? "Generate" : "Next"}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Generation overlay (live WebSocket progress) */}
      {gen.phase !== "idle" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[28px] w-full max-w-[420px] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            {gen.phase === "working" ? (
              <>
                <div
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "linear-gradient(135deg,#F97316,#DC2626)" }}
                >
                  <Sparkles className="text-white" size={26} />
                </div>
                <h3 className="font-bold text-[18px] text-[#303030]">Generating your paper</h3>
                <p className="text-[13px] text-[#9A9A9A] mt-1 flex items-center justify-center gap-1.5">
                  <Loader2 className="animate-spin" size={13} />
                  {gen.stage}…
                </p>
                <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${gen.percent}%`,
                      background: "linear-gradient(90deg,#F97316,#DC2626)",
                    }}
                  />
                </div>
                <p className="text-[12px] text-[#A9A9A9] mt-2">{gen.percent}%</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#D7263D]/10 flex items-center justify-center mb-5">
                  <AlertCircle className="text-[#D7263D]" size={26} />
                </div>
                <h3 className="font-bold text-[18px] text-[#303030]">Generation failed</h3>
                <p className="text-[13px] text-[#5E5E5E] mt-2 leading-relaxed">{gen.message}</p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setGen({ phase: "idle" })}
                    className="flex-1 bg-white border border-gray-200 text-[#303030] text-[14px] font-semibold rounded-full py-3 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex-1 bg-[#181818] text-white text-[14px] font-semibold rounded-full py-3 hover:bg-black transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function humanizeError(msg: string): string {
  if (/quota|RESOURCE_EXHAUSTED|429/i.test(msg)) {
    return "The AI is rate-limited right now (free-tier limit). Please wait ~30 seconds and try again.";
  }
  return msg || "Something went wrong. Please try again.";
}
