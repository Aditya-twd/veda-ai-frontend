/** Format an ISO date string as DD-MM-YYYY (the UI's convention). */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

/** Map backend difficulty → the label shown on the paper. */
export function difficultyLabel(d: "easy" | "moderate" | "hard"): string {
  return d === "hard" ? "Challenging" : d === "easy" ? "Easy" : "Moderate";
}
