"use client";
import { create } from "zustand";
import { api, ApiAssignment } from "@/lib/api";

export interface QuestionTypeRow {
  id: string;
  type: string;
  numQuestions: number;
  marks: number;
}

export interface AssignmentFormState {
  title: string;
  file: File | null;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  additionalInfo: string;
}

interface AssignmentStore {
  assignments: ApiAssignment[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  form: AssignmentFormState;

  fetchAssignments: (q?: string) => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;

  setTitle: (t: string) => void;
  setFile: (f: File | null) => void;
  setDueDate: (d: string) => void;
  setAdditionalInfo: (s: string) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, field: "type" | "numQuestions" | "marks", value: string | number) => void;
  resetForm: () => void;
}

const defaultRows: QuestionTypeRow[] = [
  { id: "q1", type: "Multiple Choice Questions", numQuestions: 4, marks: 1 },
  { id: "q2", type: "Short Questions", numQuestions: 3, marks: 2 },
  { id: "q3", type: "Diagram/Graph-Based Questions", numQuestions: 5, marks: 5 },
  { id: "q4", type: "Numerical Problems", numQuestions: 5, marks: 5 },
];

const freshForm = (): AssignmentFormState => ({
  title: "",
  file: null,
  dueDate: "",
  questionTypes: defaultRows.map((r) => ({ ...r })),
  additionalInfo: "",
});

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  loaded: false,
  loading: false,
  error: null,
  form: freshForm(),

  fetchAssignments: async (q) => {
    set({ loading: true, error: null });
    try {
      const data = await api.listAssignments(q);
      set({ assignments: data.items, loaded: true, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false, loaded: true });
    }
  },

  removeAssignment: async (id) => {
    // optimistic remove
    const prev = get().assignments;
    set({ assignments: prev.filter((a) => a._id !== id) });
    try {
      await api.deleteAssignment(id);
    } catch {
      set({ assignments: prev }); // rollback on failure
    }
  },

  setTitle: (title) => set((s) => ({ form: { ...s.form, title } })),
  setFile: (file) => set((s) => ({ form: { ...s.form, file } })),
  setDueDate: (dueDate) => set((s) => ({ form: { ...s.form, dueDate } })),
  setAdditionalInfo: (additionalInfo) => set((s) => ({ form: { ...s.form, additionalInfo } })),

  addRow: () =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: [
          ...s.form.questionTypes,
          { id: `q${Date.now()}`, type: "Multiple Choice Questions", numQuestions: 4, marks: 1 },
        ],
      },
    })),
  removeRow: (id) =>
    set((s) => ({
      form: { ...s.form, questionTypes: s.form.questionTypes.filter((q) => q.id !== id) },
    })),
  updateRow: (id, field, value) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.map((q) =>
          q.id === id ? { ...q, [field]: value } : q
        ),
      },
    })),
  resetForm: () => set({ form: freshForm() }),
}));
