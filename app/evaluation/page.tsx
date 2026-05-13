"use client"
import Navbar from "@/components/ui/navbar"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuthGuard } from "@/lib/useAuthGuard"

type Evaluation = {
  id: string
  employee_id: string
  evaluator_id: string
  evaluation_period: string
  evaluation_type: string
  status: string
  final_score: number
  total_goal_score: number
  total_skill_a_score: number
  total_attitude_score: number
  created_at: string
  employee?: { full_name: string; office: string; department: string }
  evaluator?: { full_name: string }
}

const EVAL_TYPE_LABELS: Record<string, string> = {
  periodic: "Định kỳ 6 tháng",
  probation: "Thử việc",
  contract_change: "Thay đổi HĐ",
  salary_review: "Tăng lương",
}

const STATUS_VI: Record<string, string> = {
  draft: "Nháp",
  submitted: "Chờ phê duyệt",
  approved: "Đã phê duyệt",
  rejected: "Từ chối",
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-50 text-blue-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 4 ? "text-emerald-700 bg-emerald-50 ring-emerald-100"
    : score >= 3 ? "text-blue-700 bg-blue-50 ring-blue-100"
    : score >= 2 ? "text-amber-700 bg-amber-50 ring-amber-100"
    : "text-red-700 bg-red-50 ring-red-100"
  const label = score >= 4.5 ? "Xuất sắc" : score >= 4 ? "Tốt" : score >= 3 ? "Khá" : score >= 2 ? "Trung bình" : "Yếu"
  return (
    <span className={"rounded-full px-2.5 py-1 text-xs font-bold ring-1 " + color}>
      {score.toFixed(2)} — {label}
    </span>
  )
}

export default function EvaluationListPage() {
  useAuthGuard()
  const { currentUser, loadUser, profiles, loadProfiles } = useStore()
  const router = useRouter()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
    loadProfiles()
  }, [])

  useEffect(() => {
    if (!currentUser) return
    const allowed = ["manager", "hr", "admin"]
    if (!allowed.includes(currentUser.role)) {
      router.replace("/dashboard")
      return
    }
    loadEvaluations()
  }, [currentUser])

  async function loadEvaluations() {
    setLoading(true)
    const { data } = await supabase
      .from("evaluations")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      const enriched = data.map(ev => ({
        ...ev,
        employee: profiles.find(p => p.id === ev.employee_id),
        evaluator: profiles.find(p => p.id === ev.evaluator_id),
      }))
      setEvaluations(enriched)
    }
    setLoading(false)
  }

  const canCreate = currentUser?.role === "manager" || currentUser?.role === "hr" || currentUser?.role === "admin"

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#DBEAFE_0,#F8FAFC_34%,#FFFFFF_70%)] text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-7 shadow-xl backdrop-blur-xl">
          <div className="relative flex items-end justify-between gap-4 flex-wrap">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                Đánh giá hiệu suất — OVVN
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Danh sách đánh giá</h1>
              <p className="mt-1 text-sm text-slate-500">{evaluations.length} kết quả đánh giá</p>
            </div>
            {canCreate && (
              <button onClick={() => router.push("/evaluation/new")}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700">
                + Tạo đánh giá mới
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Đang tải...</div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-16 rounded-[2rem] border border-white/80 bg-white/85 shadow-xl backdrop-blur-xl">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-slate-500 text-sm">Chưa có đánh giá nào</p>
            {canCreate && (
              <button onClick={() => router.push("/evaluation/new")}
                className="mt-4 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
                Tạo đánh giá đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map(ev => (
              <div key={ev.id} className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-xl backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-bold text-white">
                      {(ev.employee?.full_name || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-950">{ev.employee?.full_name || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{ev.employee?.office} · {ev.employee?.department}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Đánh giá bởi: {ev.evaluator?.full_name || "Unknown"}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{ev.evaluation_period}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">{EVAL_TYPE_LABELS[ev.evaluation_type] || ev.evaluation_type}</span>
                    <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (STATUS_COLORS[ev.status] || "bg-slate-100 text-slate-600")}>{STATUS_VI[ev.status] || ev.status}</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-2xl bg-blue-50 px-3 py-2 text-center ring-1 ring-blue-100">
                    <div className="text-lg font-bold text-blue-700">{ev.total_goal_score?.toFixed(2) || "0.00"}</div>
                    <div className="text-xs text-blue-600">Mục tiêu (70%)</div>
                  </div>
                  <div className="rounded-2xl bg-purple-50 px-3 py-2 text-center ring-1 ring-purple-100">
                    <div className="text-lg font-bold text-purple-700">{ev.total_skill_a_score?.toFixed(2) || "0.00"}</div>
                    <div className="text-xs text-purple-600">Kỹ năng</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-3 py-2 text-center ring-1 ring-amber-100">
                    <div className="text-lg font-bold text-amber-700">{ev.total_attitude_score?.toFixed(2) || "0.00"}</div>
                    <div className="text-xs text-amber-600">Thái độ</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center ring-1 ring-emerald-100">
                    <div className="text-lg font-bold text-emerald-700">{ev.final_score?.toFixed(2) || "0.00"}</div>
                    <div className="text-xs text-emerald-600">Điểm tổng</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <ScoreBadge score={ev.final_score || 0} />
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{new Date(ev.created_at).toLocaleDateString("vi-VN")}</span>
                    <button
                      onClick={() => router.push(`/evaluation/${ev.id}`)}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 transition"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}