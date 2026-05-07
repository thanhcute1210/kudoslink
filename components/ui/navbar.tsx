"use client"
import { useEffect } from "react"
import { useStore } from "@/lib/store"

export default function Navbar() {
  const { currentUser, logout, loadUser } = useStore()

  useEffect(() => {
    if (!currentUser) loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleLogout() {
    await logout()
    window.location.href = "/login"
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-white/70 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <span className="text-xl font-bold tracking-tight text-blue-700">KudosLink</span>
          <span className="ml-2 text-sm font-medium text-slate-500">JP x VN Office</span>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <a href="/mypage" className="rounded-full px-4 py-2 text-slate-600 hover:bg-white hover:shadow-sm">
            My Page
          </a>
          <a href="/dashboard" className="rounded-full px-4 py-2 text-slate-600 hover:bg-white hover:shadow-sm">
            My Stats
          </a>
          <a href="/leaderboard" className="rounded-full px-4 py-2 text-slate-600 hover:bg-white hover:shadow-sm">
            Dashboard
          </a>
          <a href="/feed" className="rounded-full px-4 py-2 text-slate-600 hover:bg-white hover:shadow-sm">
            News Feed
          </a>
          <a href="/post" className="rounded-full bg-blue-600 px-4 py-2 text-white shadow-md hover:bg-blue-700">
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