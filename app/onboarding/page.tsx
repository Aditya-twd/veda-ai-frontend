"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ArrowRight, School } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, status, hydrate, setUser } = useAuthStore();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [sector, setSector] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Not signed in → back to login. Prefill from any existing school (edit flow).
  useEffect(() => {
    if (status === "anon") router.replace("/login");
    if (status === "authed" && user?.school) {
      setName(user.school.name);
      setLocation(user.school.location);
      setSector(user.school.sector);
    }
  }, [status, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your school name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await api.updateProfile({
        name: name.trim(),
        location: location.trim(),
        sector: sector.trim(),
      });
      setUser(updated);
      router.replace("/home");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (status === "loading" || status === "anon") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEEEEE] to-[#DADADA]">
        <Loader2 className="animate-spin text-[#A9A9A9]" size={26} />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEEEEE] to-[#DADADA] px-5 py-10">
      <div className="w-full max-w-[460px]">
        <div className="relative bg-gradient-to-b from-[#F4F4F4] to-[#EFEFEF] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-8 py-10 sm:px-10 sm:py-11 overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-12 w-52 h-52 rounded-full bg-[radial-gradient(circle,rgba(255,86,35,0.16),transparent_65%)] blur-2xl" />

          <div className="relative">
            <Image
              src="/desktopLogo.png"
              alt="VedaAI"
              width={272}
              height={80}
              priority
              className="h-9 w-auto mb-7"
            />

            <div className="w-11 h-11 rounded-2xl bg-[#FF5623]/10 flex items-center justify-center text-[#FF5623] mb-4">
              <School size={21} />
            </div>
            <h1 className="text-[24px] font-bold text-[#303030] leading-tight mb-1.5">
              Welcome, {firstName} 👋
            </h1>
            <p className="text-[14px] text-[#5E5E5E]/80 leading-[1.55] mb-7">
              Tell us about your school so it shows on your question papers. You can change this
              anytime.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="School name" required>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Delhi Public School"
                  autoFocus
                  className="auth-input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Location">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bokaro Steel City"
                    className="auth-input"
                  />
                </Field>
                <Field label="Sector / Branch">
                  <input
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Sector-4"
                    className="auth-input"
                  />
                </Field>
              </div>

              {error && (
                <p className="text-[13px] text-[#C0392B] bg-[#C0392B]/8 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="press group mt-2 flex items-center justify-center gap-2 bg-[#181818] text-white text-[15px] font-semibold rounded-full py-3.5 hover:bg-black disabled:opacity-60"
              >
                {busy ? <Loader2 size={17} className="animate-spin" /> : "Continue"}
                {!busy && (
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-semibold text-[#303030] mb-1.5">
        {label}
        {required && <span className="text-[#FF5623]"> *</span>}
      </span>
      {children}
    </label>
  );
}
