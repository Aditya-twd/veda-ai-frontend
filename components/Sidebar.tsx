"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  SquareUser,
  FileText,
  BookText,
  PieChart,
  Settings,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Avatar from "./Avatar";

const navItems = [
  { label: "Home", icon: LayoutGrid, href: "/home", filled: true },
  { label: "My Groups", icon: SquareUser, href: "/groups", filled: true },
  { label: "Assignments", icon: FileText, href: "/assignments", filled: true },
  { label: "AI Teacher's Toolkit", icon: BookText, href: "/toolkit", filled: false },
  { label: "My Library", icon: PieChart, href: "/library", filled: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  // School card shows the user's school; falls back to their email if none is set yet.
  const primaryLine = user?.school?.name || user?.name || "VedaAI";
  const secondaryLine = user?.school?.location || user?.email || "";

  return (
    <aside className="hidden md:flex flex-col fixed left-3.5 top-3.5 bottom-3.5 w-[288px] bg-white rounded-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.06)] z-40 px-4 py-5">
      {/* Logo */}
      <div className="px-2 mb-5">
        <Image
          src="/desktopLogo.png"
          alt="VedaAI"
          width={272}
          height={80}
          priority
          className="h-9 w-auto"
        />
      </div>

      {/* Create Assignment button — dark pill with orange glow ring */}
      <Link
        href="/assignments/create"
        className="create-glow press group flex items-center justify-center gap-2 mt-8 bg-[#181818] text-white text-[15px] font-semibold rounded-full py-3 px-4 mb-7 hover:bg-black"
      >
        <Sparkles
          size={16}
          className="text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
          fill="white"
        />
        <span>Create Assignment</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ label, icon: Icon, href, filled }) => {
          const isActive =
            href === "/assignments"
              ? pathname.startsWith("/assignments")
              : pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`press group flex items-center gap-3 px-3.5 py-3 rounded-2xl text-[15px] ${
                isActive
                  ? "bg-[#F2F2F2] text-[#303030] font-semibold"
                  : "text-[#5E5E5E] font-medium hover:bg-[#FF5623]/8 hover:text-[#FF5623]"
              }`}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2 : 1.9}
                className={`transition-colors ${
                  isActive
                    ? "text-[#303030]"
                    : `text-[#9A9A9A] group-hover:text-[#FF5623]${
                        filled ? " group-hover:fill-[#FF5623]" : ""
                      }`
                }`}
                fill={filled ? (isActive ? "#303030" : "#B6B6B6") : "none"}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto pt-4">
        <Link
          href="/settings"
          className="press group flex items-center gap-3 px-3.5 py-2.5 mb-3 rounded-2xl text-[15px] text-[#9A9A9A] hover:text-[#FF5623] hover:bg-[#FF5623]/8"
        >
          <Settings
            size={19}
            strokeWidth={1.9}
            className="transition-transform duration-500 group-hover:rotate-90"
          />
          <span>Settings</span>
        </Link>

        <div className="flex items-center gap-3 bg-[#F4F4F4] rounded-2xl p-2.5">
          <Avatar src={user?.avatarUrl} name={user?.name} size={40} className="w-10 h-10" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#303030] leading-tight truncate">
              {primaryLine}
            </p>
            {secondaryLine && (
              <p className="text-[11px] text-[#9A9A9A] leading-tight truncate">{secondaryLine}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
