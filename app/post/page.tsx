"use client"
import Navbar from "@/components/ui/navbar"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useAuthGuard } from "@/lib/useAuthGuard"
import { ConfettiTrigger } from "@/components/ui/confetti"
import { useT } from "@/lib/useT"

const categories = [
  "M&A", "Market Research", "Fast Support", "Translation",
  "Leadership", "Creativity", "Sales Support", "Operations"
]
const pointOptions = [10, 20, 30, 50, 100]

export default function PostPage() {
  useAuthGuard()
  const t = useT()
  const { profiles, loadProfiles, loadUser, addPost, currentUser, myBudget, companyValues, loadCompanyValues } = useStore()
  const router = useRouter()
  const remaining = myBudget - (currentUser?.budget_used || 0)

  const [selectedPoints, setSelectedPoints] = useState(30)
  const [to, setTo] = useState("")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("M&A")
  const [selectedValueId, setSelectedValueId] = useState("")
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUser()
    loadProfiles()
    loadCompanyValues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit() {
    setError("")
    if (!to) { setError(t.post_err_to); return }
    if (!title) { setError(t.post_err_title); return }
    if (!message) { setError(t.post_err_msg); return }
    if (selectedPoints > remaining) {
      setError(t.post_err_budget + " " + remaining + " pts")
      return
    }

    setLoading(true)

    const receiver = profiles.find(p => p.full_name === to)
    if (!receiver) { setError(t.post_err_found); setLoading(false); return }

    await addPost({
      from: currentUser?.full_name || "",
      fromOffice: currentUser?.office || "",
      fromAvatar: (currentUser?.full_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      fromColor: "from-sky-500 to-blue-500",
      to: receiver.full_name,
      toOffice: receiver.office,
      points: selectedPoints,
      category,
      title,
      message,
      companyValueId: selectedValueId || undefined,
    })

    setLoading(false)
    setSubmitted(true)
    // confetti fires via ConfettiTrigger when submitted becomes true
  }

  const otherProfiles = profiles.filter(p => p.id !== currentUser?.id)

  if (submitted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 px-6">
        <ConfettiTrigger active={submitted} />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 left-10 h-80 w-80 rounded-full bg-blue-300/50 blur-3xl" />
          <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-emerald-300/35 blur-3xl" />
          <div className="absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-violet-300/30 blur-3xl" />
        </div>
        <div className="animate-fade-in-up relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-blue-100 text-5xl shadow-inner">
            🎉
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t.post_success}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            <span className="font-bold">{to}</span> {t.post_received}{" "}
            <span className="font-bold text-amber-600">+{selectedPoints} pts</span>
          </p>
          {selectedValueId && (
            <p className="mt-1 text-xs text-slate-500">
              {t.post_value_label}: {companyValues.find(v => v.id === selectedValueId)?.icon} {companyValues.find(v => v.id === selectedValueId)?.title}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">{t.post_updated}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button onClick={() => router.push("/feed")} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#27D6D8]/20 hover:bg-blue-700">
              {t.post_view_feed}
            </button>
            <button onClick={() => router.push("/leaderboard")} className="rounded-full bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100">
              {t.post_see_lb}
            </button>
            <button
              onClick={() => { setSubmitted(false); setTo(""); setTitle(""); setMessage(""); setSelectedPoints(30); setSelectedValueId("") }}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              {t.post_send_another}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-80 w-80 rounded-full bg-blue-300/50 blur-3xl" />
        <div className="absolute top-40 right-0 h-96 w-96 rounded-full bg-emerald-300/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-amber-300/35 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E1_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E1_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.08]" />
      </div>

      <Navbar />

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-xl backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-200/50 blur-2xl" />
          <div className="relative">
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">{t.post_tag}</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{t.post_title}</h1>
            <p className="mt-3 text-sm text-slate-600">
              {t.post_sending_as}: <span className="font-bold">{currentUser?.full_name}</span> · {currentUser?.office}
            </p>
            <div className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
              {t.post_remaining}: {remaining} / {myBudget} pts
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
            <div className="relative space-y-5">

              {/* To */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{t.post_to}</label>
                <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                  <option value="">{t.post_to_ph}</option>
                  {otherProfiles.map((p) => (
                    <option key={p.id} value={p.full_name}>{p.full_name} ({p.office} · {p.department})</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{t.post_title_label}</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.post_title_ph} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{t.post_msg}</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.post_msg_ph} rows={5} className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{t.post_category}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Company Value */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  {t.post_value} <span className="text-slate-400 font-normal">{t.post_optional}</span>
                </label>
                <select value={selectedValueId} onChange={(e) => setSelectedValueId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                  <option value="">{t.post_value_ph}</option>
                  {companyValues.map((v) => (
                    <option key={v.id} value={v.id}>{v.icon} {v.title}</option>
                  ))}
                </select>
              </div>

              {/* Points */}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{t.post_points}</label>
                <div className="flex flex-wrap gap-2">
                  {pointOptions.map((p) => (
                    <button key={p} onClick={() => setSelectedPoints(p)} disabled={p > remaining}
                      className={"rounded-full px-4 py-2 text-sm font-bold ring-1 transition " + (
                        selectedPoints === p ? "bg-blue-600 text-white ring-blue-600 shadow-md" :
                        p > remaining ? "opacity-40 cursor-not-allowed bg-white text-slate-400 ring-slate-200" :
                        "bg-white text-slate-600 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
                      )}>
                      {p} pts
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100">{error}</div>
              )}

              <button onClick={handleSubmit} disabled={loading} className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-[#27D6D8]/20 transition hover:bg-blue-700 disabled:opacity-60">
                {loading ? t.post_submitting : t.post_submit + selectedPoints + " pts"}
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            {/* Company Values Preview */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
              <h2 className="text-base font-bold text-slate-950">{t.post_values_title}</h2>
              <p className="mt-1 text-xs text-slate-400">{t.post_values_sub}</p>
              <div className="mt-4 space-y-2">
                {companyValues.map((v) => (
                  <button key={v.id} onClick={() => setSelectedValueId(selectedValueId === v.id ? "" : v.id)}
                    className={"w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition ring-1 " + (
                      selectedValueId === v.id
                        ? "bg-blue-50 text-blue-700 ring-blue-200 font-semibold"
                        : "bg-slate-50 text-slate-600 ring-slate-200 hover:bg-blue-50 hover:text-blue-700"
                    )}>
                    <span className="text-base">{v.icon}</span>
                    <span>{v.title}</span>
                    {selectedValueId === v.id && <span className="ml-auto text-blue-500">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Point guide */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
              <h2 className="text-base font-bold text-slate-950">{t.post_guide}</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between rounded-2xl bg-blue-50 px-4 py-3 text-blue-700 ring-1 ring-blue-100">
                  <span className="font-semibold">{t.post_small}</span><span className="font-bold">10–20 pts</span>
                </div>
                <div className="flex justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700 ring-1 ring-emerald-100">
                  <span className="font-semibold">{t.post_strong}</span><span className="font-bold">30–50 pts</span>
                </div>
                <div className="flex justify-between rounded-2xl bg-amber-50 px-4 py-3 text-amber-700 ring-1 ring-amber-100">
                  <span className="font-semibold">{t.post_beyond}</span><span className="font-bold">100 pts</span>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
              <h2 className="text-base font-bold text-slate-950">{t.post_budget}</h2>
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">{t.post_used}</span>
                  <span className="font-bold text-slate-700">{currentUser?.budget_used || 0} / {myBudget} pts</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: Math.min(((currentUser?.budget_used || 0) / myBudget) * 100, 100) + "%" }} />
                </div>
                <div className="mt-2 text-xs text-slate-400 text-right">{remaining} {t.post_left}</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
