"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setError("")
    if (!email) { setError("Please enter your email"); return }
    if (!password) { setError("Please enter your password"); return }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,#F8FAFC_34%,#FFFFFF_70%)] flex items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#CBD5E1_1px,transparent_1px),linear-gradient(to_bottom,#CBD5E1_1px,transparent_1px)] bg-[size:56px_56px] opacity-[0.16]" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-2xl shadow-blue-100/70 backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-amber-200/50 blur-3xl" />

        <div className="relative">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-bold text-white shadow-lg">
              K
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">KudosLink</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">JP × VN Office</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}