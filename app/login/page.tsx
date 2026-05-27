"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

/** Resolve once the GIS library is on `window.google`. */
function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in")));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google sign-in"));
    document.head.appendChild(s);
  });
}

export default function LoginPage() {
  const router = useRouter();
  const { login, status, user, hydrate } = useAuthStore();
  const btnRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = useCallback(
    (u: AuthUser) => router.replace(u.onboarded ? "/home" : "/onboarding"),
    [router]
  );

  // Hydrate on mount; if already signed in, skip the login screen.
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    if (status === "authed" && user) goNext(user);
  }, [status, user, goNext]);

  // Initialize + render the Google button.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || status === "loading") return;
    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !window.google || !btnRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async ({ credential }) => {
            setBusy(true);
            setError(null);
            try {
              const { token, user: u } = await api.googleLogin(credential);
              login(token, u);
              goNext(u);
            } catch (e) {
              setError((e as Error).message);
              setBusy(false);
            }
          },
        });
        window.google.accounts.id.renderButton(btnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width: 320,
        });
      })
      .catch((e) => setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [status, login, goNext]);

  async function continueAsGuest() {
    setBusy(true);
    setError(null);
    try {
      const { token, user: u } = await api.guestLogin();
      login(token, u);
      goNext(u);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  // Avoid a flash of the login form while we check for an existing session.
  if (status === "loading" || (status === "authed" && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEEEEE] to-[#DADADA]">
        <Loader2 className="animate-spin text-[#A9A9A9]" size={26} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEEEEE] to-[#DADADA] px-5 py-10">
      <div className="w-full max-w-[440px]">
        <div className="relative bg-gradient-to-b from-[#F4F4F4] to-[#EFEFEF] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.10)] px-8 py-10 sm:px-10 sm:py-12 overflow-hidden">
          {/* soft brand glow */}
          <div className="pointer-events-none absolute -top-16 -right-12 w-52 h-52 rounded-full bg-[radial-gradient(circle,rgba(255,86,35,0.16),transparent_65%)] blur-2xl" />

          <div className="relative flex flex-col items-center text-center">
            <Image
              src="/desktopLogo.png"
              alt="VedaAI"
              width={272}
              height={80}
              priority
              className="h-10 w-auto mb-8"
            />

            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#5E5E5E] bg-white rounded-full px-3 py-1 mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5623]" />
              Welcome back
            </span>

            <h1 className="text-[26px] font-bold text-[#303030] leading-tight mb-2">
              Sign in to VedaAI
            </h1>
            <p className="text-[14px] text-[#5E5E5E]/80 max-w-[320px] leading-[1.55] mb-8">
              Create AI-powered question papers in minutes. Sign in to pick up where you left off.
            </p>

            {/* Google button (rendered by GIS) */}
            <div className="min-h-[44px] flex items-center justify-center">
              {GOOGLE_CLIENT_ID ? (
                <div ref={btnRef} className={busy ? "opacity-50 pointer-events-none" : ""} />
              ) : (
                <p className="text-[13px] text-[#C77700] bg-[#C77700]/10 rounded-xl px-4 py-2.5 max-w-[320px]">
                  Google sign-in isn&apos;t configured. Set{" "}
                  <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>, or continue as a
                  guest below.
                </p>
              )}
            </div>

            {/* divider */}
            <div className="flex items-center gap-3 w-full max-w-[320px] my-6">
              <span className="h-px flex-1 bg-black/10" />
              <span className="text-[12px] text-[#A9A9A9] font-medium">or</span>
              <span className="h-px flex-1 bg-black/10" />
            </div>

            {/* Guest fallback */}
            <button
              onClick={continueAsGuest}
              disabled={busy}
              className="press group flex items-center justify-center gap-2 w-full max-w-[320px] bg-[#181818] text-white text-[15px] font-semibold rounded-full py-3.5 hover:bg-black disabled:opacity-60"
            >
              {busy ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Sparkles size={16} fill="white" className="transition-transform duration-300 group-hover:rotate-12" />
              )}
              Continue as guest
              {!busy && (
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              )}
            </button>

            {error && (
              <p className="mt-5 text-[13px] text-[#C0392B] bg-[#C0392B]/8 rounded-xl px-4 py-2.5 max-w-[320px]">
                {error}
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-[12px] text-[#5E5E5E]/70 mt-6 leading-relaxed">
          Guest mode uses a shared demo account so you can explore without signing in.
        </p>
      </div>
    </div>
  );
}
