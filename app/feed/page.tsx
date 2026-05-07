"use client"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import Navbar from "@/components/ui/navbar"
import { useAuthGuard } from "@/lib/useAuthGuard"

const categoryColor: Record<string, string> = {
  "M&A Support":    "bg-blue-50 text-blue-700 ring-blue-100",
  "Translation":    "bg-emerald-50 text-emerald-700 ring-emerald-100",
  "Creativity":     "bg-pink-50 text-pink-700 ring-pink-100",
  "Fast Support":   "bg-amber-50 text-amber-700 ring-amber-100",
  "M&A":            "bg-blue-50 text-blue-700 ring-blue-100",
  "Market Research":"bg-purple-50 text-purple-700 ring-purple-100",
  "Leadership":     "bg-indigo-50 text-indigo-700 ring-indigo-100",
  "Sales Support":  "bg-orange-50 text-orange-700 ring-orange-100",
  "Operations":     "bg-teal-50 text-teal-700 ring-teal-100",
}

const categoryBorder: Record<string, string> = {
  "M&A Support":    "border-l-blue-400",
  "Translation":    "border-l-emerald-400",
  "Creativity":     "border-l-pink-400",
  "Fast Support":   "border-l-amber-400",
  "M&A":            "border-l-blue-400",
  "Market Research":"border-l-purple-400",
  "Leadership":     "border-l-indigo-400",
  "Sales Support":  "border-l-orange-400",
  "Operations":     "border-l-teal-400",
}

const ALL_REACTIONS = ["👏", "🔥", "⭐", "❤️", "💪", "🎨"]

function getInitials(name: string): string {
  return name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
}

export default function FeedPage() {
  useAuthGuard()
  const { posts, currentUser, addReaction, removeReaction, loadUser, loadProfiles, loadPosts } = useStore()
  const [myReactions, setMyReactions] = useState<Record<string, string[]>>({})
  const [showPicker, setShowPicker] = useState<number | null>(null)
  const [toast, setToast] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState("")
  const [poppingReaction, setPoppingReaction] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem("kudoslink_reactions")
    if (saved) {
      try { setMyReactions(JSON.parse(saved)) } catch {}
    }
    Promise.all([loadUser(), loadProfiles(), loadPosts()]).finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleReact(postId: number, emoji: string) {
    const key = String(postId)
    const already = myReactions[key] || []
    let next: Record<string, string[]>
    if (already.includes(emoji)) {
      removeReaction(postId, emoji)
      next = { ...myReactions, [key]: already.filter(e => e !== emoji) }
    } else {
      addReaction(postId, emoji)
      next = { ...myReactions, [key]: [...already, emoji] }
      setToast("Reaction added!")
      setTimeout(() => setToast(""), 2000)
    }
    setMyReactions(next)
    localStorage.setItem("kudoslink_reactions", JSON.stringify(next))
    setShowPicker(null)
    // pop animation
    const key = `${postId}-${emoji}`
    setPoppingReaction(key)
    setTimeout(() => setPoppingReaction(null), 400)
  }

  // Sidebar: top 3 receivers by points this month
  const receiverPoints: Record<string, { points: number; office: string }> = {}
  for (const p of posts) {
    if (!receiverPoints[p.to]) receiverPoints[p.to] = { points: 0, office: p.toOffice }
    receiverPoints[p.to].points += p.points
  }
  const top3Receivers = Object.entries(receiverPoints)
    .sort((a, b) => b[1].points - a[1].points)
    .slice(0, 3)

  // Sidebar: category breakdown
  const categoryCounts: Record<string, number> = {}
  for (const p of posts) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1
  }
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxCount = topCategories[0]?.[1] || 1

  // All unique categories for filter bar
  const allCategories = Object.keys(categoryCounts).sort()

  // Filtered posts
  const filteredPosts = filterCategory ? posts.filter(p => p.category === filterCategory) : posts

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,#F8FAFC_34%,#FFFFFF_70%)]">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-80 w-80 rounded-full bg-blue-300/50 blur-3xl" />
        <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="absolute bottom-40 right-1/4 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E1_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E1_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.08]" />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-xl shadow-blue-100/50 backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/50 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="flex-1">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                News Feed
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                Share thanks. Make teamwork visible.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {posts.length} appreciations shared between Japan and Vietnam offices.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-2.5 ring-1 ring-blue-100">
                  <span className="text-base">💌</span>
                  <div>
                    <div className="text-xs text-blue-500 font-medium">You received</div>
                    <div className="text-lg font-bold text-blue-700 leading-tight">
                      {posts.filter(p => p.to === currentUser?.full_name).reduce((a, p) => a + p.points, 0)} pts
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 ring-1 ring-emerald-100">
                  <span className="text-base">📤</span>
                  <div>
                    <div className="text-xs text-emerald-500 font-medium">You sent</div>
                    <div className="text-lg font-bold text-emerald-700 leading-tight">
                      {posts.filter(p => p.from === currentUser?.full_name).length} posts
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <a href="/post" className="inline-flex shrink-0 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700">
              + Add Post
            </a>
          </div>
        </div>

        {/* Category filter bar */}
        {allCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory("")}
              className={"rounded-full px-4 py-2 text-xs font-bold ring-1 transition " + (
                filterCategory === ""
                  ? "bg-slate-900 text-white ring-slate-900"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              All ({posts.length})
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(filterCategory === cat ? "" : cat)}
                className={"rounded-full px-4 py-2 text-xs font-bold ring-1 transition " + (
                  filterCategory === cat
                    ? "bg-blue-600 text-white ring-blue-600"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                {cat} ({categoryCounts[cat]})
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Posts list */}
          <div className="space-y-5">
            {filteredPosts.length === 0 && (
              <div className="rounded-[2rem] border border-white/80 bg-white/85 p-12 text-center shadow-xl backdrop-blur-xl">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-slate-500 text-sm">
                  {filterCategory ? `No posts in "${filterCategory}" yet.` : "No posts yet. Be the first to appreciate someone!"}
                </p>
                <a href="/post" className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                  + Add Post
                </a>
              </div>
            )}

            {filteredPosts.map((p) => {
              const myR = myReactions[String(p.id)] || []
              const isForMe = p.to === currentUser?.full_name
              const toInitials = p.to.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
              return (
                <article
                  key={p.id}
                  className={"animate-fade-in-up relative overflow-hidden rounded-[2rem] border-l-4 border border-white/80 bg-white/90 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl " + (categoryBorder[p.category] || "border-l-slate-300") + (isForMe ? " ring-2 ring-blue-200 shadow-blue-100/60" : "")}
                  style={{ animationDelay: `${filteredPosts.indexOf(p) * 60}ms` }}
                >
                  {/* Background blob */}
                  <div className={"absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl " + (isForMe ? "bg-blue-200/50" : "bg-slate-100/80")} />

                  {/* Top: points badge strip */}
                  <div className={"flex items-center justify-between px-6 pt-5 pb-4 " + (isForMe ? "bg-gradient-to-r from-blue-50/60 to-transparent" : "")}>
                    <div className="flex items-center gap-3">
                      {/* From avatar */}
                      <div className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md " + p.fromColor}>
                        {p.fromAvatar}
                      </div>
                      {/* Arrow + to avatar */}
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">{p.from}</div>
                          <div className="text-xs text-slate-400">{p.fromOffice}</div>
                        </div>
                        <span className="text-slate-300 text-lg mx-1">→</span>
                        <div className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-md " + (isForMe ? "bg-gradient-to-br from-blue-500 to-indigo-500" : "bg-gradient-to-br from-slate-400 to-slate-500")}>
                          {toInitials}
                        </div>
                        <div>
                          <div className={"text-sm font-bold leading-tight " + (isForMe ? "text-blue-700" : "text-slate-900")}>{p.to}</div>
                          <div className="text-xs text-slate-400">{p.toOffice}</div>
                        </div>
                      </div>
                    </div>
                    {/* Points + For you badge */}
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <div className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-1.5 text-sm font-bold text-white shadow-md shadow-amber-100">
                        +{p.points} pts
                      </div>
                      {isForMe && (
                        <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">For you ✨</span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="relative px-6 pb-5">
                    <h3 className="text-base font-bold tracking-tight text-slate-950">{p.title}</h3>

                    {/* Message as quote */}
                    <blockquote className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                      <p className="text-sm leading-6 text-slate-600 before:content-['“'] before:text-slate-300 before:text-lg before:font-serif after:content-['”'] after:text-slate-300 after:text-lg after:font-serif">
                        {p.message}
                      </p>
                    </blockquote>

                    {/* Tags row */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className={"rounded-full px-3 py-1 text-xs font-bold ring-1 " + (categoryColor[p.category] || "bg-slate-50 text-slate-600 ring-slate-200")}>
                        {p.category}
                      </span>
                      {p.companyValueTitle && (
                        <span className="rounded-full bg-gradient-to-r from-purple-50 to-violet-50 px-3 py-1 text-xs font-bold text-purple-700 ring-1 ring-purple-200">
                          {p.companyValueTitle}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-slate-400">{p.time}</span>
                    </div>

                    {/* Reactions */}
                    <div className="relative mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {Object.entries(p.reactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(p.id, emoji)}
                          className={"flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition " + (myR.includes(emoji) ? "bg-blue-100 text-blue-700 ring-blue-200" : "bg-white text-slate-600 ring-slate-200 hover:bg-blue-50") + (poppingReaction === `${p.id}-${emoji}` ? " animate-reaction-pop" : "")}
                        >
                          <span>{emoji}</span>
                          <span>{count}</span>
                        </button>
                      ))}
                      <div className="relative">
                        <button
                          onClick={() => setShowPicker(showPicker === p.id ? null : p.id)}
                          className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 hover:bg-white hover:text-slate-700"
                        >
                          <span>+</span> React
                        </button>
                        {showPicker === p.id && (
                          <div className="absolute bottom-10 left-0 z-30 flex gap-1 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                            {ALL_REACTIONS.map(e => (
                              <button key={e} onClick={() => handleReact(p.id, e)} className="rounded-xl p-2 text-lg hover:bg-slate-100 transition">
                                {e}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            {/* Feed Summary */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
              <h2 className="text-base font-bold text-slate-950">Feed Summary</h2>
              <p className="mt-1 text-sm text-slate-500">Recognition activity</p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                  <span className="text-sm font-semibold text-blue-700">Total Posts</span>
                  <span className="text-lg font-bold text-blue-700">{posts.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-100">
                  <span className="text-sm font-semibold text-emerald-700">Points Given</span>
                  <span className="text-lg font-bold text-emerald-700">{posts.reduce((a, p) => a + p.points, 0)}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-100">
                  <span className="text-sm font-semibold text-amber-700">Latest Post</span>
                  <span className="text-sm font-bold text-amber-700">{posts[0]?.time || "-"}</span>
                </div>
              </div>
            </div>

            {/* Top 3 Receivers */}
            {top3Receivers.length > 0 && (
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
                <h2 className="text-base font-bold text-slate-950">Top Receivers</h2>
                <p className="mt-1 text-sm text-slate-500">Most appreciated members</p>
                <div className="mt-4 space-y-3">
                  {top3Receivers.map(([name, data], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
                        {getInitials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 truncate">{name}</span>
                          <span className="ml-2 shrink-0 text-xs font-bold text-amber-600">+{data.points}pts</span>
                        </div>
                        <div className="text-xs text-slate-400">{data.office}</div>
                      </div>
                      <div className="shrink-0 text-base">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {topCategories.length > 0 && (
              <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
                <h2 className="text-base font-bold text-slate-950">Top Categories</h2>
                <p className="mt-1 text-sm text-slate-500">Most used appreciation types</p>
                <div className="mt-4 space-y-3">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <button
                          onClick={() => setFilterCategory(filterCategory === cat ? "" : cat)}
                          className={"font-semibold transition hover:text-blue-600 " + (filterCategory === cat ? "text-blue-600" : "text-slate-700")}
                        >
                          {cat}
                        </button>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-blue-400 transition-all"
                          style={{ width: (count / maxCount) * 100 + "%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
