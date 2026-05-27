"use client";
import { useAssignmentStore } from "@/store/useAssignmentStore";
import { FileText, Calendar, ListChecks, MessageSquare } from "lucide-react";

export default function Step2() {
  const { form } = useAssignmentStore();
  const totalQuestions = form.questionTypes.reduce((s, q) => s + q.numQuestions, 0);
  const totalMarks = form.questionTypes.reduce((s, q) => s + q.numQuestions * q.marks, 0);

  const Item = ({
    icon: Icon,
    label,
    children,
  }: {
    icon: typeof FileText;
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="w-9 h-9 rounded-xl bg-[#F4F4F4] flex items-center justify-center flex-shrink-0">
        <Icon size={18} strokeWidth={1.9} className="text-[#5E5E5E]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#9A9A9A] font-medium mb-0.5">{label}</p>
        <div className="text-[15px] text-[#303030]">{children}</div>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-[32px] p-6 md:p-9 shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
      style={{ background: "linear-gradient(179.67deg, #F4F4F4 -15.9%, #EFEFEF 158.68%)" }}
    >
      <div className="mb-6">
        <h2 className="font-bold text-[22px] text-[#303030]">Review &amp; Generate</h2>
        <p className="text-[14px] text-[#5E5E5E]/80">
          Review your assignment details before generating the question paper
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Item icon={FileText} label="Title">
          <span className="font-semibold">{form.title || "Untitled assignment"}</span>
        </Item>
        <Item icon={FileText} label="Uploaded File">
          <span className="font-semibold">{form.file?.name ?? "No file uploaded"}</span>
        </Item>
        <Item icon={Calendar} label="Due Date">
          <span className="font-semibold">{form.dueDate || "Not set"}</span>
        </Item>
        <Item icon={ListChecks} label="Question Types">
          <div className="flex flex-col gap-1.5 mt-1">
            {form.questionTypes.map((q) => (
              <div key={q.id} className="flex items-center justify-between">
                <span>{q.type}</span>
                <span className="text-[12px] text-[#9A9A9A]">
                  {q.numQuestions} × {q.marks}m
                </span>
              </div>
            ))}
            <div className="border-t border-black/10 mt-2 pt-2 flex justify-between text-[13px]">
              <span className="text-[#5E5E5E]">
                Total Questions : <strong className="text-[#303030]">{totalQuestions}</strong>
              </span>
              <span className="text-[#5E5E5E]">
                Total Marks : <strong className="text-[#303030]">{totalMarks}</strong>
              </span>
            </div>
          </div>
        </Item>
        {form.additionalInfo && (
          <Item icon={MessageSquare} label="Additional Information">
            {form.additionalInfo}
          </Item>
        )}
      </div>

      <div className="mt-7 rounded-2xl p-5 text-center border border-[#FF5623]/20 bg-[#FF5623]/[0.06]">
        <p className="text-[15px] font-semibold text-[#303030]">
          Ready to generate your AI-powered question paper?
        </p>
        <p className="text-[13px] text-[#5E5E5E]/80 mt-1">
          Click “Generate” to create your customized question paper.
        </p>
      </div>
    </div>
  );
}
