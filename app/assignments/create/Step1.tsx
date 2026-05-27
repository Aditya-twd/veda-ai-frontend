"use client";
import { useRef } from "react";
import { UploadCloud, Calendar, Plus, X, Mic, ChevronDown } from "lucide-react";
import { useAssignmentStore } from "@/store/useAssignmentStore";

const OPTIONS = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
  "Fill in the Blanks",
  "True/False Questions",
];

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-full px-3 py-2 min-w-[108px] justify-between shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="text-[#9A9A9A] hover:text-[#303030] transition-colors text-lg leading-none w-4"
      >
        −
      </button>
      <span className="text-[15px] font-bold text-[#303030] tabular-nums">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="text-[#9A9A9A] hover:text-[#303030] transition-colors text-lg leading-none w-4"
      >
        +
      </button>
    </div>
  );
}

export default function Step1() {
  const { form, setTitle, setFile, setDueDate, setAdditionalInfo, addRow, removeRow, updateRow } =
    useAssignmentStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const totalQuestions = form.questionTypes.reduce((s, q) => s + q.numQuestions, 0);
  const totalMarks = form.questionTypes.reduce((s, q) => s + q.numQuestions * q.marks, 0);

  return (
    <div
      className="rounded-[32px] p-6 md:p-9 shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
      style={{ background: "linear-gradient(179.67deg, #F4F4F4 -15.9%, #EFEFEF 158.68%)" }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-bold text-[22px] text-[#303030]">Assignment Details</h2>
        <p className="text-[14px] text-[#5E5E5E]/80">Basic information about your assignment</p>
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-[16px] font-bold text-[#303030] mb-2">Assignment Title</label>
        <input
          value={form.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Quiz on Electricity"
          className="w-full bg-transparent border-[1.5px] border-[#D9D9D9] rounded-full px-5 py-3.5 text-[15px] text-[#303030] placeholder:text-[#A9A9A9] outline-none focus:border-[#B5B5B5] transition-colors"
        />
      </div>

      {/* Upload */}
      <div className="mb-6">
        <button
          onClick={() => fileRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) setFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="w-full flex flex-col items-center justify-center gap-3 border-[1.75px] border-dashed border-black/20 rounded-3xl bg-white py-9 px-6 hover:border-black/30 transition-colors"
        >
          <UploadCloud size={26} strokeWidth={2} className="text-[#1E1E1E]" />
          <div className="text-center">
            <p className="text-[16px] font-semibold text-[#303030]">
              {form.file?.name ?? "Choose a file or drag & drop it here"}
            </p>
            <p className="text-[13px] text-[#A9A9A9] mt-1">JPEG, PNG, upto 10MB</p>
          </div>
          <span className="bg-[#F1F1F1] text-[14px] font-medium text-[#303030] rounded-full px-6 py-2.5 mt-1">
            Browse Files
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
        <p className="text-[13px] text-[#A9A9A9] mt-2 text-center">
          Upload images of your preferred document/image
        </p>
      </div>

      {/* Due date */}
      <div className="mb-6">
        <label className="block text-[16px] font-bold text-[#303030] mb-2">Due Date</label>
        <div className="relative">
          <input
            value={form.dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="DD-MM-YYYY"
            className="w-full bg-transparent border-[1.5px] border-[#D9D9D9] rounded-full px-5 py-3.5 text-[15px] text-[#303030] placeholder:text-[#A9A9A9] outline-none focus:border-[#B5B5B5] transition-colors pr-12"
          />
          <Calendar size={19} strokeWidth={1.9} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#7A7A7A] pointer-events-none" />
        </div>
      </div>

      {/* Question types */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3 pr-1">
          <label className="text-[16px] font-bold text-[#303030]">Question Type</label>
          <div className="hidden sm:flex gap-3 text-[12px] text-[#9A9A9A] font-medium">
            <span className="w-[108px] text-center">No. of Questions</span>
            <span className="w-[108px] text-center">Marks</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {form.questionTypes.map((row) => (
            <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              {/* Dropdown pill */}
              <div className="relative flex-1 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <select
                  value={row.type}
                  onChange={(e) => updateRow(row.id, "type", e.target.value)}
                  className="w-full appearance-none bg-transparent text-[15px] text-[#303030] pl-5 pr-10 py-3.5 outline-none cursor-pointer rounded-full"
                >
                  {OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <ChevronDown size={17} strokeWidth={2} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#303030] pointer-events-none" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => removeRow(row.id)}
                  className="w-6 h-6 flex items-center justify-center text-[#5E5E5E] hover:text-[#303030] transition-colors flex-shrink-0"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
                <Stepper value={row.numQuestions} onChange={(v) => updateRow(row.id, "numQuestions", v)} />
                <Stepper value={row.marks} onChange={(v) => updateRow(row.id, "marks", v)} />
              </div>
            </div>
          ))}
        </div>

        {/* Add row */}
        <button
          onClick={addRow}
          className="flex items-center gap-3 mt-4 group"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#181818] text-white group-hover:bg-black transition-colors">
            <Plus size={17} strokeWidth={2.6} />
          </span>
          <span className="text-[15px] font-bold text-[#303030]">Add Question Type</span>
        </button>

        {/* Totals */}
        <div className="flex flex-col items-end gap-0.5 mt-4">
          <span className="text-[13px] text-[#5E5E5E]">
            Total Questions : <span className="font-bold text-[#303030]">{totalQuestions}</span>
          </span>
          <span className="text-[13px] text-[#5E5E5E]">
            Total Marks : <span className="font-bold text-[#303030]">{totalMarks}</span>
          </span>
        </div>
      </div>

      {/* Additional info */}
      <div>
        <label className="block text-[16px] font-bold text-[#303030] mb-2">
          Additional Information{" "}
          <span className="font-normal text-[#9A9A9A]">(For better output)</span>
        </label>
        <div className="relative">
          <textarea
            rows={3}
            value={form.additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            className="w-full bg-white border-[1.5px] border-[#E4E4E4] rounded-3xl px-5 py-4 text-[15px] text-[#303030] placeholder:text-[#A9A9A9] outline-none focus:border-[#C5C5C5] transition-colors resize-none pr-12"
          />
          <button className="absolute right-4 bottom-4 text-[#7A7A7A] hover:text-[#303030] transition-colors">
            <Mic size={18} strokeWidth={1.9} />
          </button>
        </div>
      </div>
    </div>
  );
}
