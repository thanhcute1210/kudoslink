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
    <nav className="sticky top-0 z-20 border-b border-white/70 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/leaderboard" className="text-xl font-bold tracking-tight text-blue-700 hover:text-blue-800 transition-colors">
          My OneValue
        </a>

        <div className="flex items-center gap-1 text-sm font-medium">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <a
                key={href}
                href={href}
                className={
                  "rounded-full px-4 py-2 transition-all " +
                  (isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200 font-bold"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700")
                }
              >
                {label}
              </a>
            )
          })}

          <a href="/post" className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-md hover:bg-blue-700 ml-1">
            + Add Post
          </a>

          {currentUser && (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-2">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-700">{currentUser.full_name}</div>
                <div className="text-xs text-slate-400">{currentUser.role}</div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-full px-3 py-2 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
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
