"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { MobileTopBar, MobileBottomNav } from "./MobileBars";
import { useAuthStore } from "@/store/useAuthStore";

interface AppLayoutProps {
  children: React.ReactNode;
  breadcrumb: string;
  icon?: "grid" | "sparkle";
}

export default function AppLayout({ children, breadcrumb, icon = "grid" }: AppLayoutProps) {
  const router = useRouter();
  const { status, user, hydrate } = useAuthStore();

  // AppLayout wraps every protected page — this is the single auth gate.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (status === "anon") {
      router.replace("/login");
    } else if (status === "authed" && user && !user.onboarded) {
      router.replace("/onboarding");
    }
  }, [status, user, router]);

  // Show a neutral splash until authenticated + onboarded (avoids flashing protected content).
  const ready = status === "authed" && !!user?.onboarded;
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#EEEEEE] to-[#DADADA]">
        <Loader2 className="animate-spin text-[#A9A9A9]" size={26} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileTopBar />

      {/* Desktop content area */}
      <div className="md:ml-[312px] md:mr-3.5 pt-5 md:pt-3.5 px-3 md:px-0 pb-28 md:pb-4">
        <div className="hidden md:block">
          <Header breadcrumb={breadcrumb} icon={icon} />
        </div>
        <main>{children}</main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
