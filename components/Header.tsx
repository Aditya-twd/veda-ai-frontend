"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LayoutGrid, Bell, ChevronDown, Sparkles, School, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Avatar from "./Avatar";

interface HeaderProps {
  breadcrumb: string;
  icon?: "grid" | "sparkle";
}

export default function Header({ breadcrumb, icon = "grid" }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const displayName = user?.name || "Account";

  return (
    <header className="hidden md:flex items-center justify-between bg-white rounded-[22px] shadow-[0_6px_24px_rgba(0,0,0,0.04)] px-3.5 py-2.5 mb-5">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="group w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:bg-[#FF5623]/10"
        >
          <ArrowLeft
            size={20}
            strokeWidth={2.2}
            className="text-[#303030] transition-all duration-300 group-hover:text-[#FF5623] group-hover:-translate-x-0.5"
          />
        </button>
        <div className="flex items-center gap-2.5 text-[#A3A3A3]">
          {icon === "grid" ? (
            <LayoutGrid size={18} strokeWidth={2} fill="#A3A3A3" />
          ) : (
            <Sparkles size={18} strokeWidth={2} fill="#A3A3A3" />
          )}
          <span className="text-[17px] font-medium">{breadcrumb}</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="group relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#FF5623]/10">
          <Bell
            size={20}
            strokeWidth={2}
            className="text-[#303030] transition-all duration-300 origin-top group-hover:text-[#FF5623] group-hover:rotate-[12deg]"
          />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF5623] ring-2 ring-white" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2.5 bg-white rounded-full pl-1.5 pr-3.5 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:bg-gray-50 transition-colors"
          >
            <Avatar src={user?.avatarUrl} name={displayName} size={32} />
            <span className="text-[16px] font-bold text-[#303030] max-w-[160px] truncate">
              {displayName}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2.4}
              className={`text-[#303030] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] ring-1 ring-black/[0.04] p-1.5 z-50">
              <div className="px-3 py-2.5">
                <p className="text-[14px] font-bold text-[#303030] truncate">{displayName}</p>
                <p className="text-[12px] text-[#9A9A9A] truncate">{user?.email}</p>
              </div>
              <div className="h-px bg-black/[0.06] my-1" />
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/onboarding");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#5E5E5E] hover:bg-[#FF5623]/8 hover:text-[#FF5623] transition-colors"
              >
                <School size={17} strokeWidth={2} />
                Edit school
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium text-[#C0392B] hover:bg-[#C0392B]/8 transition-colors"
              >
                <LogOut size={17} strokeWidth={2} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
