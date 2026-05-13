"use client"
import { useEffect, useRef, useState } from "react"
import { useStore } from "@/lib/store"
import { usePathname } from "next/navigation"
import { useT } from "@/lib/useT"
import { NotificationBell } from "@/components/ui/notification-bell"

export default function Navbar() {
  const { currentUser, logout, loadUser, updateAvatar, lang, setLang } = useStore()
  const t = useT()
  const pathname = usePathname()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!currentUser) loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleLogout() {
    await logout()
    window.location.href = "/login"
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await updateAvatar(file)
    setUploading(false)
    e.target.value = ""
  }

  const navLinks = [
    { href: "/feed",        label: t.nav_feed },
    { href: "/leaderboard", label: t.nav_dashboard },
    { href: "/dashboard",   label: t.nav_mypage },
    { href: "/evaluation",  label: "📋 Đánh giá" },
  ]

  const allowedRoles = ["manager", "hr", "admin"]
  const visibleNavLinks = currentUser && !allowedRoles.includes(currentUser.role)
    ? navLinks.filter(l => l.href !== "/evaluation")
    : navLinks

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white shadow-sm">
      {/* Brand accent line top */}
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: "linear-gradient(to right, #24243F, #27D6D8)" }} />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">

        {/* Logo */}
        <a href="/leaderboard" className="group flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="#24243F"/>
            <polygon points="22,8 34,8 34,20" fill="#27D6D8"/>
            <text x="6" y="26" fontSize="18" fontWeight="800" fill="white" fontFamily="sans-serif">OV</text>
          </svg>
          <div className="flex flex-col leading-none">
            <span className="text-base font-black tracking-tight" style={{ color: "#24243F" }}>My OneValue</span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">Vietnam × Japan</span>
          </div>
        </a>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {visibleNavLinks.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <a key={href} href={href}
                className={"rounded-full px-4 py-2 transition-all duration-150 font-semibold " + (
                  isActive ? "bg-blue-600 text-white shadow-md" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                )}>
                {label}
              </a>
            )
          })}

          {currentUser && <NotificationBell />}

          <a href="/post"
            className="ml-1 flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg">
            {t.nav_addpost}
          </a>

          {currentUser && (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              {/* Clickable avatar */}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                title="Đổi ảnh đại diện"
                className="group relative h-9 w-9 shrink-0 rounded-full focus:outline-none">
                {currentUser.avatar ? (
                  <div className="h-9 w-9 overflow-hidden rounded-full shadow-sm ring-2 ring-blue-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentUser.avatar} alt={currentUser.full_name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                    {currentUser.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {uploading
                    ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <span className="text-[11px]" title={t.nav_change_photo}>📷</span>}
                </div>
              </button>

              {/* Name + office | department */}
              <div className="text-right leading-none">
                <div className="text-xs font-bold text-slate-700">{currentUser.full_name}</div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  {currentUser.office}{currentUser.department ? ` | ${currentUser.department}` : ""}
                </div>
              </div>

              {/* Logout */}
              <button onClick={handleLogout}
                className="rounded-full px-3 py-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                {t.nav_logout}
              </button>

              {/* Language switcher */}
              <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 p-1">
                <button onClick={() => setLang("vi")} title="Tiếng Việt"
                  className={"rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition " + (lang === "vi" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600")}>VN</button>
                <button onClick={() => setLang("ja")} title="日本語"
                  className={"rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition " + (lang === "ja" ? "bg-white shadow-sm text-slate-800" : "text-slate-400 hover:text-slate-600")}>JP</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile right side ── */}
        <div className="flex md:hidden items-center gap-2" ref={menuRef}>
          {currentUser && <NotificationBell />}

          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition"
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div className="absolute right-4 top-16 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* User info */}
              {currentUser && (
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                  <button type="button" onClick={() => { fileInputRef.current?.click(); setMenuOpen(false) }}
                    className="group relative h-10 w-10 shrink-0 rounded-full focus:outline-none">
                    {currentUser.avatar ? (
                      <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-blue-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={currentUser.avatar} alt={currentUser.full_name} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        {currentUser.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-xs">📷</span>
                    </div>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{currentUser.full_name}</div>
                    <div className="text-xs text-slate-400 truncate">{currentUser.office}{currentUser.department ? ` | ${currentUser.department}` : ""}</div>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <div className="py-1">
                {visibleNavLinks.map(({ href, label }) => {
                  const isActive = pathname === href
                  return (
                    <a key={href} href={href}
                      className={"flex items-center px-4 py-2.5 text-sm font-semibold transition " + (
                        isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                      )}>
                      {label}
                    </a>
                  )
                })}
                <a href="/post"
                  className="flex items-center px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 transition">
                  + {t.nav_addpost}
                </a>
              </div>

              {/* Bottom actions */}
              {currentUser && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Ngôn ngữ</span>
                    <div className="flex items-center gap-0.5 rounded-full border border-slate-200 bg-slate-50 p-1">
                      <button onClick={() => setLang("vi")}
                        className={"rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition " + (lang === "vi" ? "bg-white shadow-sm text-slate-800" : "text-slate-400")}>VN</button>
                      <button onClick={() => setLang("ja")}
                        className={"rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition " + (lang === "ja" ? "bg-white shadow-sm text-slate-800" : "text-slate-400")}>JP</button>
                    </div>
                  </div>
                  <button onClick={handleLogout}
                    className="w-full rounded-full bg-red-50 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition">
                    {t.nav_logout}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Shared file input */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
    </nav>
  )
}
