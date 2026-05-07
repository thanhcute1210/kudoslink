"use client"
import Navbar from "@/components/ui/navbar"
import { useStore } from "@/lib/store"
import { useEffect } from "react"

const badgeColor: Record<string, string> = {
  Legend: "text-purple-700 bg-purple-50 ring-purple-100",
  Platinum: "text-blue-700 bg-blue-50 ring-blue-100",
  Gold: "text-amber-700 bg-amber-50 ring-amber-100",
  Silver: "text-slate-600 bg-slate-100 ring-slate-200",
  Bronze: "text-orange-700 bg-orange-50 ring-orange-100",
}

function getBadge(points: number): string {
  if (points >= 5000) return "Legend"
  if (points >= 2000) return "Platinum"
  if (points >= 1000) return "Gold"
  if (points >= 400) return "Silver"
  return "Bronze"
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
    "from-green-500 to-emerald-500",
    "from-yellow-400 to-amber-500",
  ]
  return colors[index % colors.length]
}

export default function LeaderboardPage() {
  const { profiles, loadProfiles } = useStore()

  useEffect(() => {
    loadProfiles()
  }, [])

  const sorted = [...profiles].sort((a, b) => b.points - a.points)
  const top3 = sorted.slice(0, 3)
  const totalMonthly = profiles.reduce((a, p) => a + p.monthly_points, 0)

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
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-xl shadow-blue-100/50 backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/50 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                Company Dashboard
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                Recognition Dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                Live ranking updated from Supabase in real time.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 ring-1 ring-amber-100">
                May 2026
              </span>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
                All offices
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[
            { label: "Top Score", value: sorted[0] ? sorted[0].points.toLocaleString() + " pts" : "-", sub: sorted[0] ? sorted[0].full_name + " · " + sorted[0].office : "-", icon: "🏆" },
            { label: "Points This Month", value: "+" + totalMonthly.toLocaleString(), sub: "Total distributed", icon: "📈" },
            { label: "Active Members", value: profiles.length.toString(), sub: "Japan x Vietnam", icon: "🤝" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-0.5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-xl ring-1 ring-blue-100">
                {item.icon}
              </div>
              <div className="text-sm font-medium text-slate-500">{item.label}</div>
              <div className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{item.value}</div>
              <div className="mt-2 text-sm font-semibold text-slate-500">{item.sub}</div>
            </div>
          ))}
        </div>

        {top3.length >= 1 && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {[top3[1], top3[0], top3[2]].map((e, i) => e && (
              <div key={e.id} className={"relative overflow-hidden rounded-[2rem] border bg-white/85 p-6 text-center shadow-xl backdrop-blur-xl transition hover:-translate-y-1 " + (i === 1 ? "border-amber-200 shadow-amber-100" : "border-white/80")}>
                <div className={"absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl " + (i === 1 ? "bg-amber-200/60" : "bg-blue-200/40")} />
                <div className="relative">
                  <div className={"mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-lg " + getColor(i)}>
                    {getInitials(e.full_name)}
                  </div>
                  <div className="mb-2 text-3xl">{i === 1 ? "🥇" : i === 0 ? "🥈" : "🥉"}</div>
                  <div className="text-lg font-bold text-slate-950">{e.full_name}</div>
                  <div className="mt-1 text-sm text-slate-500">{e.office} · {e.department}</div>
                  <div className="mt-4 text-3xl font-bold text-blue-700">{e.points.toLocaleString()}</div>
                  <div className="text-xs font-medium text-slate-400">total points</div>
                  <span className={"mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 " + badgeColor[getBadge(e.points)]}>
                    {getBadge(e.points)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 shadow-xl backdrop-blur-xl">
          <div className="relative border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-slate-950">Full Ranking</h2>
            <p className="mt-1 text-sm text-slate-500">Live from Supabase</p>
          </div>
          <div className="relative overflow-x-auto">
            <div className="grid min-w-[640px] grid-cols-6 border-b border-slate-100 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              <div>Rank</div>
              <div className="col-span-2">Employee</div>
              <div>Office</div>
              <div>Monthly</div>
              <div>Total pts</div>
            </div>
            {sorted.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Loading...</div>
            )}
            {sorted.map((e, index) => (
              <div key={e.id} className="grid min-w-[640px] grid-cols-6 items-center border-b border-slate-100 px-6 py-4 transition last:border-0 hover:bg-blue-50/50">
                <div className={"text-sm font-bold " + (index === 0 ? "text-amber-600" : index === 1 ? "text-slate-500" : index === 2 ? "text-orange-600" : "text-slate-400")}>
                  #{index + 1}
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <div className={"flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-sm " + getColor(index)}>
                    {getInitials(e.full_name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-950">{e.full_name}</div>
                    <div className="text-xs text-slate-500">{e.department}</div>
                  </div>
                </div>
                <div>
                  <span className={"rounded-full px-2.5 py-1 text-xs font-bold ring-1 " + (e.office === "Japan" ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100")}>
                    {e.office}
                  </span>
                </div>
                <div className="text-sm font-bold text-emerald-600">+{e.monthly_points}</div>
                <div className="font-bold text-blue-700">{e.points.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}