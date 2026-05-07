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
    <nav className="sticky top-0 z-20 border-b border-white/60 bg-white/75 shadow-sm backdrop-blur-xl">
      {/* Subtle top shimmer line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">

        {/* Logo */}
        <a href="/leaderboard" className="group flex items-center gap-3">
          {/* Icon mark */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-200/60 transition-transform group-hover:scale-105">
            {/* Sparkle dots */}
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white/90 shadow-sm" />
            <span className="text-base font-black text-white">M</span>
          </div>

          {/* Text */}
          <div className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-base font-black tracking-tight text-transparent">
              My OneValue
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              JP × VN
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
                className={
                  "rounded-full px-4 py-2 transition-all duration-150 " +
                  (isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 font-bold"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700")
                }
              >
                {label}
              </a>
            )
          })}

          <a
            href="/post"
            className="ml-1 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:shadow-lg hover:shadow-blue-300/50 hover:scale-[1.03]"
          >
            <span className="text-base leading-none">+</span> Add Post
          </a>

          {currentUser && (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              {/* User avatar bubble */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white shadow-sm">
                {currentUser.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-700 leading-tight">{currentUser.full_name}</div>
                <div className="text-[10px] text-slate-400">{currentUser.role || "member"}</div>
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
