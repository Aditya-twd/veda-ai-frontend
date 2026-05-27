/** Thin typed client for the VedaAI backend. */
import { getToken, clearAuth, type AuthUser } from "./auth";

export const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BASE = `${API_ORIGIN}/api`;

/** Called on 401 — drop the dead token and bounce to login (skips the login page itself). */
function onUnauthorized() {
  clearAuth();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Never hang forever — abort after 12s so the UI can show an error + retry.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
      ...options,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("The server took too long to respond. Is the backend running on " + API_ORIGIN + "?");
    }
    throw new Error(`Cannot reach the backend at ${API_ORIGIN}. Is it running?`);
  } finally {
    clearTimeout(timeout);
  }
  if (res.status === 401) {
    onUnauthorized();
    throw new Error("Your session has expired. Please sign in again.");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.error?.message || `Request failed (${res.status})`);
  }
  return json.data as T;
}

// ── Types coming back from the API ──
export interface ApiAssignment {
  _id: string;
  title: string;
  status: "draft" | "queued" | "generating" | "completed" | "failed";
  dueDate?: string;
  createdAt: string;
  paperId?: string;
  totalQuestions: number;
  totalMarks: number;
}

export interface ApiQuestion {
  text: string;
  difficulty: "easy" | "moderate" | "hard";
  marks: number;
  options?: string[];
}
export interface ApiSection {
  title: string;
  instruction: string;
  questions: ApiQuestion[];
}
export interface ApiPaper {
  _id: string;
  assignmentId: string;
  meta: { school: string; subject: string; class: string; timeAllowed: string; maxMarks: number };
  sections: ApiSection[];
  answerKey: { index: number; answer: string }[];
  generatedBy: string;
  isFallback?: boolean; // true → sample paper served because the AI was unavailable
}

/** A question + its model answer — returned when the AI regenerates a section. */
export interface ApiEditQuestion extends ApiQuestion {
  answer: string;
}

export interface UpdatePaperBody {
  meta: { subject: string; class: string; timeAllowed: string; maxMarks: number };
  sections: ApiSection[];
  answerKey: { index: number; answer: string }[];
}

export interface FileMeta {
  originalName: string;
  mimeType: string;
  path: string;
  size: number;
}

export interface CreateAssignmentInput {
  title: string;
  dueDate?: string;
  questionTypes: { type: string; numQuestions: number; marks: number }[];
  additionalInstructions?: string;
  file?: FileMeta;
}

export interface AuthResult {
  token: string;
  user: AuthUser;
}

export const api = {
  // ── Auth ──
  googleLogin: (credential: string) =>
    request<AuthResult>(`/auth/google`, { method: "POST", body: JSON.stringify({ credential }) }),
  guestLogin: () => request<AuthResult>(`/auth/guest`, { method: "POST" }),
  me: () => request<AuthUser>(`/auth/me`),
  updateProfile: (school: { name: string; location?: string; sector?: string }) =>
    request<AuthUser>(`/auth/me`, { method: "PATCH", body: JSON.stringify({ school }) }),

  listAssignments: (q?: string) =>
    request<{ items: ApiAssignment[]; total: number }>(
      `/assignments${q ? `?q=${encodeURIComponent(q)}` : ""}`
    ),
  getAssignment: (id: string) => request<ApiAssignment>(`/assignments/${id}`),
  createAssignment: (body: CreateAssignmentInput) =>
    request<ApiAssignment>(`/assignments`, { method: "POST", body: JSON.stringify(body) }),
  deleteAssignment: (id: string) =>
    request<{ id: string }>(`/assignments/${id}`, { method: "DELETE" }),
  generate: (id: string) =>
    request<{ assignmentId: string; jobId: string; status: string }>(
      `/assignments/${id}/generate`,
      { method: "POST" }
    ),
  getPaperByAssignment: (assignmentId: string) =>
    request<ApiPaper>(`/papers/by-assignment/${assignmentId}`),
  updatePaper: (paperId: string, body: UpdatePaperBody) =>
    request<ApiPaper>(`/papers/${paperId}`, { method: "PATCH", body: JSON.stringify(body) }),
  regenerateSection: (paperId: string, index: number, instruction: string) =>
    request<{ questions: ApiEditQuestion[] }>(`/papers/${paperId}/sections/${index}/regenerate`, {
      method: "POST",
      body: JSON.stringify({ instruction }),
    }),

  async uploadFile(file: File): Promise<FileMeta> {
    const fd = new FormData();
    fd.append("file", file);
    const token = getToken();
    // No Content-Type — the browser sets the multipart boundary itself.
    const res = await fetch(`${BASE}/upload`, {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.status === 401) {
      onUnauthorized();
      throw new Error("Your session has expired. Please sign in again.");
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.success === false) {
      throw new Error(json?.error?.message || "Upload failed");
    }
    return json.data as FileMeta;
  },

  /**
   * Download a paper's PDF. The route is auth-protected, so we can't just navigate to the URL
   * (a browser navigation can't send the Bearer header) — fetch it as a blob with the token,
   * then trigger a save.
   */
  async downloadPdf(paperId: string, filename = "question-paper.pdf"): Promise<void> {
    const token = getToken();
    const res = await fetch(`${BASE}/papers/${paperId}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.status === 401) {
      onUnauthorized();
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error?.message || `Failed to download PDF (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
