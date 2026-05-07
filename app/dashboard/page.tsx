"use client"
import Navbar from "@/components/ui/navbar"
import { useStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { useAuthGuard } from "@/lib/useAuthGuard"

export default function DashboardPage() {
  useAuthGuard()
  const { currentUser, profiles, posts, loadUser, loadProfiles, loadPosts, myBudget } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadUser(), loadProfiles(), loadPosts()]).finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recentPosts = posts.slice(0, 3)
  const top5 = [...profiles].sort((a, b) => b.points - a.points).slice(0, 5)
  const myRank = [...profiles].sort((a, b) => b.points - a.points).findIndex(p => p.id === currentUser?.id) + 1
  const budgetLeft = myBudget - (currentUser?.budget_used || 0)

  function getColor(index: number): string {
    const colors = [
      "from-purple-500 to-indigo-500",
      "from-blue-500 to-cyan-500",
      "from-sky-500 to-blue-500",
      "from-teal-500 to-emerald-500",
      "from-orange-400 to-amber-500",
      "from-pink-500 to-rose-500",
    ]
    return colors[index % colors.length]
  }

  function getInitials(name: string): string {
    return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,#F8FAFC_32%,#FFFFFF_68%)]">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,#F8FAFC_32%,#FFFFFF_68%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-32 right-0 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E1_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E1_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.18]" />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {/* Hero - My Profile */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-xl shadow-blue-100/50 backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/50 blur-2xl" />
          <div className="relative flex items-center gap-6">
            <div className={"flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-lg " + getColor(myRank)}>
              {getInitials(currentUser?.full_name || "?")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  {currentUser?.full_name || "Loading..."}
                </h1>
                <span className={"inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 " + (
                  currentUser?.role === "admin" ? "bg-purple-50 text-purple-700 ring-purple-100" :
                  currentUser?.role === "manager" ? "bg-amber-50 text-amber-700 ring-amber-100" :
                  "bg-blue-50 text-blue-700 ring-blue-100"
                )}>
                  {currentUser?.role}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {currentUser?.office} Office · {currentUser?.department}
              </p>
              <p className="mt-1 text-sm text-slate-400">{currentUser?.email}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-700">{currentUser?.points.toLocaleString() || 0}</div>
              <div className="text-sm text-slate-400">total points</div>
              <div className="mt-1 text-sm font-semibold text-amber-600">Rank #{myRank > 0 ? myRank : "-"}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Points", value: currentUser?.points.toLocaleString() || "0", trend: "All time earned", icon: "✨" },
            { label: "Global Rank", value: myRank > 0 ? "#" + myRank : "-", trend: "Current position", icon: "🏆" },
            { label: "Posts Received", value: posts.filter(p => p.to === currentUser?.full_name).length.toString(), trend: "Appreciations for you", icon: "💌" },
            { label: "Budget Left", value: budgetLeft + "/" + myBudget, trend: (currentUser?.budget_used || 0) + " pts given", icon: "🎁" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-2 text-lg ring-1 ring-blue-100">{s.icon}</div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Live</span>
              </div>
              <div className="text-sm font-medium text-slate-500">{s.label}</div>
              <div className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{s.value}</div>
              <div className="mt-2 text-sm font-semibold text-emerald-600">{s.trend}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My appreciation received */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-100/80 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Appreciation Received</h2>
                  <p className="text-sm text-slate-500">Posts sent to you</p>
                </div>
              </div>
              <div className="space-y-3">
                {posts.filter(p => p.to === currentUser?.full_name).length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">No appreciations yet</div>
                )}
                {posts.filter(p => p.to === currentUser?.full_name).map((p) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                    <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white " + p.fromColor}>
                      {p.fromAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-950">{p.from}</div>
                      <div className="text-xs text-slate-500 truncate">{p.title}</div>
                    </div>
                    <div className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                      +{p.points}pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recent posts in feed */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
            <div className="absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-emerald-100/80 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Latest News Feed</h2>
                  <p className="text-sm text-slate-500">Recent appreciations</p>
                </div>
                <a href="/feed" className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all →</a>
              </div>
              <div className="space-y-4">
                {recentPosts.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm">
                    <div className="mb-2 flex items-start justify-between gap-4">
                      <div className="text-sm">
                        <span className="font-bold text-slate-950">{p.from}</span>
                        <span className="mx-2 text-slate-400">→</span>
                        <span className="font-bold text-slate-950">{p.to}</span>
                      </div>
                      <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 ring-1 ring-amber-200">+{p.points}pts</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-700 line-clamp-2">{p.message}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">{p.category}</span>
                      <span className="text-xs font-medium text-slate-400">{p.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}