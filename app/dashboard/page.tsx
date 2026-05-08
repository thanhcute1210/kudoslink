"use client"
import Navbar from "@/components/ui/navbar"
import { useStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { useAuthGuard } from "@/lib/useAuthGuard"
import { useCountUp } from "@/lib/useCountUp"

const BADGES = [
  { name: "Bronze",   min: 0,    max: 400,  color: "bg-orange-100 text-orange-700 ring-orange-200" },
  { name: "Silver",   min: 400,  max: 1000, color: "bg-slate-100 text-slate-600 ring-slate-300" },
  { name: "Gold",     min: 1000, max: 2000, color: "bg-amber-100 text-amber-700 ring-amber-200" },
  { name: "Platinum", min: 2000, max: 5000, color: "bg-blue-100 text-blue-700 ring-blue-200" },
  { name: "Legend",   min: 5000, max: Infinity, color: "bg-purple-100 text-purple-700 ring-purple-200" },
]

function getBadgeInfo(points: number) {
  const current = [...BADGES].reverse().find(b => points >= b.min) || BADGES[0]
  const next = BADGES.find(b => b.min > points)
  const progress = next ? ((points - current.min) / (next.min - current.min)) * 100 : 100
  return { current, next, progress }
}

function getInitials(name: string): string {
  return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
}

function getColor(index: number): string {
  const colors = [
    "from-purple-500 to-indigo-500", "from-blue-500 to-cyan-500",
    "from-sky-500 to-blue-500", "from-teal-500 to-emerald-500",
    "from-orange-400 to-amber-500", "from-pink-500 to-rose-500",
  ]
  return colors[index % colors.length]
}

export default function DashboardPage() {
  useAuthGuard()
  const { currentUser, profiles, posts, loadUser, loadProfiles, loadPosts, myBudget } = useStore()
  const [isLoading, setIsLoading] = useState(true)
  const [barsMounted, setBarsMounted] = useState(false)

  useEffect(() => {
    Promise.all([loadUser(), loadProfiles(), loadPosts()]).finally(() => {
      setIsLoading(false)
      setTimeout(() => setBarsMounted(true), 100)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const myRank = [...profiles].sort((a, b) => b.points - a.points).findIndex(p => p.id === currentUser?.id) + 1
  const budgetLeft = myBudget - (currentUser?.budget_used || 0)
  const budgetPercent = Math.min(((currentUser?.budget_used || 0) / myBudget) * 100, 100)
  const postsReceived = posts.filter(p => p.to === currentUser?.full_name)
  const postsSent = posts.filter(p => p.from === currentUser?.full_name)
  const { current: badge, next: nextBadge, progress: badgeProgress } = getBadgeInfo(currentUser?.points || 0)

  const animatedPoints = useCountUp(isLoading ? 0 : (currentUser?.points || 0))
  const animatedMonthly = useCountUp(isLoading ? 0 : (currentUser?.monthly_points || 0))
  const animatedBudget = useCountUp(isLoading ? 0 : budgetLeft)

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#f0fafa]">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-[#27D6D8]" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f0f9ff] via-white to-[#f0fafa] text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-80 w-80 rounded-full bg-blue-300/50 blur-3xl" />
        <div className="absolute top-32 right-0 h-96 w-96 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute bottom-40 right-10 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E1_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E1_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.08]" />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">

        {/* Hero */}
        <div className="animate-fade-in-up relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-7 shadow-xl shadow-blue-100/50 backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-300/40 blur-2xl" />
          <div className="relative flex items-center gap-6">
            <div className={"flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-2xl font-bold text-white shadow-lg " + getColor(myRank)}>
              {getInitials(currentUser?.full_name || "?")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">{currentUser?.full_name}</h1>
                <span className={"inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 " + (
                  currentUser?.role === "admin" ? "bg-purple-50 text-purple-700 ring-purple-100" :
                  currentUser?.role === "manager" ? "bg-amber-50 text-amber-700 ring-amber-100" :
                  "bg-blue-50 text-blue-700 ring-blue-100"
                )}>{currentUser?.role}</span>
                <span className={"inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 " + badge.color}>{badge.name}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {currentUser?.office} Office · {currentUser?.department}
                {currentUser?.position && <> · {currentUser.position}</>}
              </p>
              <p className="mt-1 text-sm text-slate-400">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Monthly Points */}
          <div className="animate-fade-in-up rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: "60ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-2 text-lg ring-1 ring-blue-100">📅</div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Live</span>
            </div>
            <div className="text-sm font-medium text-slate-500">Monthly Points</div>
            <div className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{animatedMonthly.toLocaleString()}</div>
            <div className="mt-2 text-sm font-semibold text-slate-400">Total: {animatedPoints.toLocaleString()} pts</div>
          </div>

          {/* Global Rank */}
          <div className="animate-fade-in-up rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: "120ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-2 text-lg ring-1 ring-blue-100">🏆</div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Live</span>
            </div>
            <div className="text-sm font-medium text-slate-500">Global Rank</div>
            <div className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{myRank > 0 ? "#" + myRank : "-"}</div>
            <div className="mt-2 text-sm font-semibold text-slate-400">among {profiles.length} members</div>
          </div>

          {/* Posts */}
          <div className="animate-fade-in-up rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: "180ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-2 text-lg ring-1 ring-blue-100">💌</div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Live</span>
            </div>
            <div className="text-sm font-medium text-slate-500">Received</div>
            <div className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{postsReceived.length}</div>
            <div className="mt-2 text-sm font-semibold text-slate-400">Sent {postsSent.length} appreciations</div>
          </div>

          {/* Budget — animated bar */}
          <div className="animate-fade-in-up rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: "240ms" }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-2 text-lg ring-1 ring-blue-100">🎁</div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">Live</span>
            </div>
            <div className="text-sm font-medium text-slate-500">Budget Left</div>
            <div className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {animatedBudget} <span className="text-base font-medium text-slate-400">/ {myBudget}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-[#27D6D8] transition-[width] duration-1000 ease-out"
                style={{ width: (barsMounted ? budgetPercent : 0) + "%" }}
              />
            </div>
            <div className="mt-1.5 text-xs text-slate-400">{currentUser?.budget_used || 0} pts given this month</div>
          </div>
        </div>

        {/* Next Badge Progress */}
        <div className="animate-fade-in-up mb-8 overflow-hidden rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl" style={{ animationDelay: "280ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-950">Badge Progress</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {nextBadge
                  ? `${nextBadge.min - (currentUser?.points || 0)} pts to ${nextBadge.name}`
                  : "You've reached the highest badge! 🎉"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={"rounded-full px-3 py-1 text-xs font-bold ring-1 " + badge.color}>{badge.name}</span>
              {nextBadge && (
                <>
                  <span className="text-slate-300 text-sm">→</span>
                  <span className={"rounded-full px-3 py-1 text-xs font-bold ring-1 opacity-50 " + (BADGES.find(b => b.name === nextBadge.name)?.color || "")}>{nextBadge.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-[width] duration-1000 ease-out"
              style={{ width: (barsMounted ? badgeProgress : 0) + "%" }}
            />
          </div>
          <div className="mt-1.5 text-xs text-slate-400 text-right">{Math.round(badgeProgress)}%</div>
        </div>

        {/* Appreciation Received + Sent */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="animate-fade-in-up relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl" style={{ animationDelay: "320ms" }}>
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-amber-200/60 blur-3xl" />
            <div className="relative">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">Appreciation Received</h2>
                <p className="text-sm text-slate-500">{postsReceived.length} posts sent to you</p>
              </div>
              <div className="space-y-3">
                {postsReceived.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">No appreciations yet</div>
                )}
                {postsReceived.map((p) => (
                  <a key={p.id} href={`/feed#post-${p.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:shadow-md hover:border-blue-200 hover:bg-[#e0fafa]/50 group">
                    <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white " + p.fromColor}>
                      {p.fromAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-950 group-hover:text-[#24243F] transition-colors">{p.from}</div>
                      <div className="text-xs text-slate-500 truncate">{p.title}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{p.time}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                        +{p.points}pts
                      </div>
                      <span className="text-slate-300 group-hover:text-blue-400 transition-colors text-sm">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl" style={{ animationDelay: "380ms" }}>
            <div className="absolute -right-24 bottom-0 h-60 w-60 rounded-full bg-emerald-200/60 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Appreciation Sent</h2>
                  <p className="text-sm text-slate-500">{postsSent.length} posts you've sent</p>
                </div>
                <a href="/post" className="rounded-full bg-[#24243F] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1a1a30] transition">
                  + Send
                </a>
              </div>
              <div className="space-y-3">
                {postsSent.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">You haven't sent any appreciations yet</div>
                )}
                {postsSent.map((p) => (
                  <a key={p.id} href={`/feed#post-${p.id}`} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm transition hover:shadow-md hover:border-emerald-200 hover:bg-emerald-50/50 group">
                    <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white " + p.fromColor}>
                      {getInitials(p.to)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-950 group-hover:text-emerald-700 transition-colors">{p.to}</div>
                      <div className="text-xs text-slate-500 truncate">{p.title}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{p.time}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                        +{p.points}pts
                      </div>
                      <span className="text-slate-300 group-hover:text-emerald-400 transition-colors text-sm">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
