"use client"
import { useEffect } from "react"
import { useStore } from "@/lib/store"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const { currentUser, logout, loadUser } = useStore()
  const pathname = usePathname()

  useEffect(() => {
    if (!currentUser) loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    await logout()
    window.location.href = "/login"
  }

  const navLinks = [
    { href: "/feed", label: "News Feed" },
    { href: "/leaderboard", label: "Dashboard" },
    { href: "/dashboard", label: "My Page" },
  ]

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white shadow-sm">
      {/* Brand accent line top */}
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: "linear-gradient(to right, #24243F, #27D6D8)" }} />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">

        {/* Logo — OneValue style */}
        <a href="/leaderboard" className="group flex items-center gap-3">
          {/* SVG logo mark replicating OneValue's navy + cyan triangle */}
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="8" fill="#24243F"/>
            {/* Cyan triangle accent */}
            <polygon points="22,8 34,8 34,20" fill="#27D6D8"/>
            {/* Letter O shape */}
            <text x="6" y="26" fontSize="18" fontWeight="800" fill="white" fontFamily="sans-serif">OV</text>
          </svg>

          {/* Text */}
          <div className="flex flex-col leading-none">
            <span className="text-base font-black tracking-tight" style={{ color: "#24243F" }}>
              My OneValue
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Vietnam × Japan
            </span>
          </div>
        </a>

        {/* Nav links */}
        <div className="flex items-center gap-1 text-sm font-medium">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <a
                key={href}
                href={href}
                className={"rounded-full px-4 py-2 transition-all duration-150 font-semibold " + (
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                {label}
              </a>
            )
          })}

          {/* Add Post CTA */}
          <a
            href="/post"
            className="ml-2 flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
          >
            + Add Post
          </a>

          {currentUser && (
            <div className="ml-3 flex items-center gap-2 border-l border-slate-200 pl-3">
              {/* Avatar */}
              {currentUser.avatar ? (
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm ring-2 ring-blue-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentUser.avatar} alt={currentUser.full_name} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
                  {currentUser.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="text-right">
                <div className="text-xs font-bold leading-tight text-slate-700">
                  {currentUser.full_name}
                </div>
                <div className="text-[10px] text-slate-400">{currentUser.office}</div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full px-3 py-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
