"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, X, LayoutGrid, FileText, PieChart, BookText, School, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Avatar from "./Avatar";

const tabs = [
  { label: "Home", icon: LayoutGrid, href: "/home" },
  { label: "Assignments", icon: FileText, href: "/assignments" },
  { label: "Library", icon: PieChart, href: "/library" },
  { label: "AI Toolkit", icon: BookText, href: "/toolkit" },
];

export function MobileTopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="md:hidden sticky top-0 z-40 px-3 pt-3">
      <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <Image src="/mobileLogo.png" alt="VedaAI" width={198} height={56} className="h-9 w-auto" priority />
        <div className="flex items-center gap-3">
          <button className="relative">
            <Bell size={20} strokeWidth={2} className="text-[#303030]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#FF5623] ring-2 ring-white" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Account menu"
              className="flex items-center gap-1.5"
            >
              <Avatar src={user?.avatarUrl} name={user?.name} size={28} className="w-7 h-7" />
              {open ? (
                <X size={20} strokeWidth={2} className="text-[#303030]" />
              ) : (
                <Menu size={20} strokeWidth={2} className="text-[#303030]" />
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2.5 w-56 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04] p-1.5 z-50">
                <div className="flex items-center gap-2.5 px-2.5 py-2.5">
                  <Avatar src={user?.avatarUrl} name={user?.name} size={36} className="w-9 h-9" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#303030] truncate">{user?.name || "Account"}</p>
                    <p className="text-[12px] text-[#9A9A9A] truncate">{user?.email}</p>
                  </div>
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
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1">
      <div className="flex items-center justify-between bg-[#1C1C1C] rounded-[26px] px-3 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
        {tabs.map(({ label, icon: Icon, href }) => {
          const isActive =
            href === "/assignments"
              ? pathname.startsWith("/assignments")
              : pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`press flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl ${
                isActive ? "bg-white/10 text-white" : "text-[#8A8A8A] hover:text-[#FF5623]"
              }`}
            >
              <Icon size={20} strokeWidth={2} fill="none" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
