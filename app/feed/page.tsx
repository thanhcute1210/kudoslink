"use client"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import Navbar from "@/components/ui/navbar"

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

const ALL_REACTIONS = ["👏", "🔥", "⭐", "❤️", "💪", "🎨"]

export default function FeedPage() {
 const { posts, addReaction, removeReaction, loadUser, loadProfiles, loadPosts } = useStore()
  const [myReactions, setMyReactions] = useState<Record<string, string[]>>({})
  const [showPicker, setShowPicker] = useState<number | null>(null)
  const [toast, setToast] = useState("")

  useEffect(() => {
  loadUser()
  loadProfiles()
  loadPosts()
}, [])

  function handleReact(postId: number, emoji: string) {
    const key = String(postId)
    const already = myReactions[key] || []
    if (already.includes(emoji)) {
      removeReaction(postId, emoji)
      setMyReactions({ ...myReactions, [key]: already.filter(e => e !== emoji) })
    } else {
      addReaction(postId, emoji)
      setMyReactions({ ...myReactions, [key]: [...already, emoji] })
      setToast("Reaction added!")
      setTimeout(() => setToast(""), 2000)
    }
    setShowPicker(null)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,#F8FAFC_34%,#FFFFFF_70%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E1_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E1_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.16]" />
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}

      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-xl shadow-blue-100/50 backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/50 blur-2xl" />
          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                News Feed
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
                Share thanks. Make teamwork visible.
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {posts.length} appreciations shared between Japan and Vietnam offices.
              </p>
            </div>
            <a href="/post" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700">
              + Add Post
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            {posts.length === 0 && (
              <div className="rounded-[2rem] border border-white/80 bg-white/85 p-12 text-center shadow-xl backdrop-blur-xl">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-slate-500 text-sm">No posts yet. Be the first to appreciate someone!</p>
                <a href="/post" className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                  + Add Post
                </a>
              </div>
            )}
            {posts.map((p) => {
              const myR = myReactions[String(p.id)] || []
              return (
                <article key={p.id} className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5">
                  <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />
                  <div className="relative">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm " + p.fromColor}>
                          {p.fromAvatar}
                        </div>
                        <div>
                          <div className="text-sm leading-6">
                            <span className="font-bold text-slate-950">{p.from}</span>
                            <span className="mx-2 text-slate-400">→</span>
                            <span className="font-bold text-slate-950">{p.to}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">{p.fromOffice}</span>
                            <span className="text-slate-300">to</span>
                            <span className="rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">{p.toOffice}</span>
                            <span className="text-slate-300">·</span>
                            <span>{p.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700 ring-1 ring-amber-200">
                        +{p.points} pts
                      </div>
                    </div>

                    <h3 className="text-lg font-bold tracking-tight text-slate-950">{p.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{p.message}</p>

                    <div className="mt-4">
                      <span className={"rounded-full px-3 py-1 text-xs font-bold ring-1 " + (categoryColor[p.category] || "bg-slate-50 text-slate-600 ring-slate-200")}>
                        {p.category}
                      </span>
                    </div>

                    <div className="relative mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                      {Object.entries(p.reactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReact(p.id, emoji)}
                          className={"flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition " + (myR.includes(emoji) ? "bg-blue-100 text-blue-700 ring-blue-200" : "bg-white text-slate-600 ring-slate-200 hover:bg-blue-50")}
                        >
                          <span>{emoji}</span>
                          <span>{count}</span>
                        </button>
                      ))}
                      <div className="relative">
                        <button
                          onClick={() => setShowPicker(showPicker === p.id ? null : p.id)}
                          className="flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-500 ring-1 ring-slate-200 hover:bg-white"
                        >
                          + React
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

          <aside className="space-y-4">
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

            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
              <h2 className="text-base font-bold text-slate-950">Culture Tip</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Specific appreciation is stronger than generic praise. Mention the task, the impact, and why it helped the team.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}