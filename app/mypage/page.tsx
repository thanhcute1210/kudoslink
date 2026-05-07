"use client"
import Navbar from "@/components/ui/navbar"
import { useStore } from "@/lib/store"
import { useEffect, useState } from "react"

function getBadge(points: number): string {
  if (points >= 5000) return "Legend"
  if (points >= 2000) return "Platinum"
  if (points >= 1000) return "Gold"
  if (points >= 400) return "Silver"
  return "Bronze"
}

const badgeStyle: Record<string, string> = {
  Legend: "bg-purple-50 text-purple-700 ring-purple-200",
  Platinum: "bg-blue-50 text-blue-700 ring-blue-200",
  Gold: "bg-amber-50 text-amber-700 ring-amber-200",
  Silver: "bg-slate-100 text-slate-600 ring-slate-200",
  Bronze: "bg-orange-50 text-orange-700 ring-orange-200",
}

function getInitials(name: string): string {
  return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
}

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

const categoryColor: Record<string, string> = {
  "M&A Support": "bg-blue-50 text-blue-700 ring-blue-100",
  "Translation": "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Creativity": "bg-pink-50 text-pink-700 ring-pink-100",
  "Fast Support": "bg-amber-50 text-amber-700 ring-amber-100",
  "M&A": "bg-blue-50 text-blue-700 ring-blue-100",
  "Market Research": "bg-purple-50 text-purple-700 ring-purple-100",
  "Leadership": "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "Sales Support": "bg-orange-50 text-orange-700 ring-orange-100",
  "Operations": "bg-teal-50 text-teal-700 ring-teal-100",
}

export default function MyPage() {
  const { currentUser, profiles, posts, companyValues, loadUser, loadProfiles, loadPosts, loadCompanyValues, myBudget } = useStore()
  const [tab, setTab] = useState<"received" | "sent">("received")

  useEffect(() => {
    loadUser()
    loadProfiles()
    loadPosts()
    loadCompanyValues()
  }, [])

  const received = posts.filter(p => p.to === currentUser?.full_name)
  const sent = posts.filter(p => p.from === currentUser?.full_name)

  const totalReceived = received.reduce((a, p) => a + p.points, 0)
  const totalSent = sent.reduce((a, p) => a + p.points, 0)
  const myRank = [...profiles].sort((a, b) => b.points - a.points).findIndex(p => p.id === currentUser?.id) + 1
  const remaining = myBudget - (currentUser?.budget_used || 0)
  const badge = getBadge(currentUser?.points || 0)

  // Company value breakdown (based on received appreciations)
  const valueBreakdown = companyValues.map(v => {
    const tagged = received.filter(p => p.companyValueId === v.id)
    return { ...v, count: tagged.length, points: tagged.reduce((a, p) => a + p.points, 0) }
  }).filter(v => v.count > 0).sort((a, b) => b.points - a.points)
  const maxValuePoints = valueBreakdown[0]?.points || 1

  const myIndex = [...profiles].sort((a, b) => b.points - a.points).findIndex(p => p.id === currentUser?.id)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,#F8FAFC_34%,#FFFFFF_70%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E1_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E1_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.16]" />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">

        {/* Hero profile */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-xl shadow-blue-100/50 backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/50 blur-2xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div className={"flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold text-white shadow-lg " + getColor(myIndex >= 0 ? myIndex : 0)}>
              {getInitials(currentUser?.full_name || "?")}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                  {currentUser?.full_name || "Loading..."}
                </h1>
                <span className={"inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 " + (
                  currentUser?.role === "admin" ? "bg-purple-50 text-purple-700 ring-purple-100" :
                  currentUser?.role === "manager" ? "bg-amber-50 text-amber-700 ring-amber-100" :
                  currentUser?.role === "hr" ? "bg-teal-50 text-teal-700 ring-teal-100" :
                  "bg-blue-50 text-blue-700 ring-blue-100"
                )}>
                  {currentUser?.role}
                </span>
                <span className={"inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 " + badgeStyle[badge]}>
                  {badge}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                <span>{currentUser?.office} Office</span>
                <span>·</span>
                <span>{currentUser?.department}</span>
                {currentUser?.position && <><span>·</span><span>{currentUser.position}</span></>}
              </div>
              <div className="mt-1 text-sm text-slate-400">{currentUser?.email}</div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-700">{(currentUser?.points || 0).toLocaleString()}</div>
                <div className="text-sm text-slate-400">total points received</div>
              </div>
              <div className="rounded-full bg-amber-50 px-4 py-1.5 text-sm font-bold text-amber-700 ring-1 ring-amber-100">
                Rank #{myRank > 0 ? myRank : "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Points Received", value: totalReceived.toLocaleString(), sub: "All time", icon: "✨", color: "text-blue-700" },
            { label: "Monthly Points", value: (currentUser?.monthly_points || 0).toLocaleString(), sub: "This month", icon: "📅", color: "text-emerald-600" },
            { label: "Appreciations Received", value: received.length.toString(), sub: "Total posts for you", icon: "💌", color: "text-pink-600" },
            { label: "Appreciations Sent", value: sent.length.toString(), sub: totalSent + " pts given", icon: "🎁", color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 px-3 py-2 text-lg ring-1 ring-blue-100">{s.icon}</div>
              </div>
              <div className="text-sm font-medium text-slate-500">{s.label}</div>
              <div className={"mt-1 text-3xl font-bold tracking-tight " + s.color}>{s.value}</div>
              <div className="mt-2 text-xs font-semibold text-slate-400">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Company Value Breakdown */}
          <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-100/60 blur-3xl" />
            <div className="relative">
              <h2 className="text-lg font-bold text-slate-950">Company Value Score</h2>
              <p className="mt-1 text-sm text-slate-500">Points received per company value</p>

              {valueBreakdown.length === 0 ? (
                <div className="mt-8 py-6 text-center text-sm text-slate-400">
                  No tagged appreciations yet
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  {valueBreakdown.map((v) => (
                    <div key={v.id}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <span className="text-base">{v.icon}</span>
                          {v.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-400">{v.count} post{v.count !== 1 ? "s" : ""}</span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                            +{v.points} pts
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                          style={{ width: Math.round((v.points / maxValuePoints) * 100) + "%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Budget Card */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-100/60 blur-2xl" />
              <div className="relative">
                <h2 className="text-base font-bold text-slate-950">Giving Budget</h2>
                <p className="mt-1 text-xs text-slate-400">Monthly allowance to give</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500">Used</span>
                    <span className="font-bold text-slate-700">{currentUser?.budget_used || 0} / {myBudget} pts</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                      style={{ width: Math.min(((currentUser?.budget_used || 0) / myBudget) * 100, 100) + "%" }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between">
                    <span className="text-xs text-slate-400">Remaining</span>
                    <span className="text-sm font-bold text-emerald-600">{remaining} pts</span>
                  </div>
                </div>
                <a
                  href="/post"
                  className="mt-5 flex w-full items-center justify-center rounded-2xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
                >
                  + Send Appreciation
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
              <div className="relative">
                <h2 className="text-base font-bold text-slate-950">Quick Links</h2>
                <div className="mt-4 space-y-2">
                  <a href="/feed" className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-100 transition">
                    <span>📰</span> News Feed
                  </a>
                  <a href="/leaderboard" className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-100 hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-100 transition">
                    <span>🏆</span> Leaderboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appreciation History */}
        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-xl backdrop-blur-xl">
          <div className="relative border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">Appreciation History</h2>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setTab("received")}
                className={"rounded-full px-4 py-2 text-sm font-bold transition ring-1 " + (
                  tab === "received"
                    ? "bg-blue-600 text-white ring-blue-600 shadow-md"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-blue-50"
                )}
              >
                Received ({received.length})
              </button>
              <button
                onClick={() => setTab("sent")}
                className={"rounded-full px-4 py-2 text-sm font-bold transition ring-1 " + (
                  tab === "sent"
                    ? "bg-blue-600 text-white ring-blue-600 shadow-md"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-blue-50"
                )}
              >
                Sent ({sent.length})
              </button>
            </div>
          </div>

          <div className="relative divide-y divide-slate-100">
            {(tab === "received" ? received : sent).length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                {tab === "received" ? "No appreciations received yet" : "No appreciations sent yet"}
              </div>
            )}
            {(tab === "received" ? received : sent).map((p) => (
              <div key={p.id} className="px-6 py-5 hover:bg-blue-50/30 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-sm " + p.fromColor}>
                      {p.fromAvatar}
                    </div>
                    <div>
                      <div className="text-sm leading-6">
                        <span className="font-bold text-slate-950">{p.from}</span>
                        <span className="mx-2 text-slate-400">→</span>
                        <span className="font-bold text-slate-950">{p.to}</span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{p.fromOffice}</span>
                        <span className="text-slate-300">·</span>
                        <span>{p.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 ring-1 ring-amber-200">
                    +{p.points} pts
                  </div>
                </div>

                <div className="mt-3 ml-13 pl-[52px]">
                  <div className="text-sm font-bold text-slate-900">{p.title}</div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{p.message}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={"rounded-full px-3 py-1 text-xs font-bold ring-1 " + (categoryColor[p.category] || "bg-slate-50 text-slate-600 ring-slate-200")}>
                      {p.category}
                    </span>
                    {p.companyValueTitle && (
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100">
                        {p.companyValueTitle}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
