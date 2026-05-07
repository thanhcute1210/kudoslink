import { create } from "zustand"
import { supabase } from "./supabase"

export type Post = {
  id: number
  from: string
  fromOffice: string
  fromAvatar: string
  fromColor: string
  to: string
  toOffice: string
  points: number
  category: string
  companyValueId?: string
  companyValueTitle?: string
  time: string
  title: string
  message: string
  reactions: Record<string, number>
}

export type Profile = {
  id: string
  full_name: string
  email: string
  role: "employee" | "manager" | "hr" | "admin"
  office: string
  department: string
  position?: string
  manager_id?: string
  is_active?: boolean
  points: number
  monthly_points: number
  budget_used: number
  giving_budget_monthly?: number
  avatar?: string
}

export type CompanyValue = {
  id: string
  title: string
  description: string
  icon: string
  sort_order: number
  is_active: boolean
}

type Store = {
  currentUser: Profile | null
  isLoggedIn: boolean
  loadUser: () => Promise<void>
  logout: () => Promise<void>

  profiles: Profile[]
  loadProfiles: () => Promise<void>

  posts: Post[]
  loadPosts: () => Promise<void>
  addPost: (post: Omit<Post, "id" | "time" | "reactions">) => Promise<void>
  addReaction: (postId: number, emoji: string) => Promise<void>
  removeReaction: (postId: number, emoji: string) => Promise<void>

  companyValues: CompanyValue[]
  loadCompanyValues: () => Promise<void>

  myBudget: number
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "Just now"
  if (diff < 3600) return Math.floor(diff / 60) + " min ago"
  if (diff < 86400) return Math.floor(diff / 3600) + " hours ago"
  if (diff < 172800) return "Yesterday"
  return Math.floor(diff / 86400) + " days ago"
}

function dbToPost(row: any, values: CompanyValue[]): Post {
  const value = values.find(v => v.id === row.company_value_id)
  return {
    id: row.id,
    from: row.from_name,
    fromOffice: row.from_office,
    fromAvatar: row.from_avatar,
    fromColor: row.from_color,
    to: row.to_name,
    toOffice: row.to_office,
    points: row.points,
    category: row.category,
    companyValueId: row.company_value_id,
    companyValueTitle: value ? value.icon + " " + value.title : undefined,
    time: timeAgo(row.created_at),
    title: row.title,
    message: row.message,
    reactions: row.reactions || {},
  }
}

export const useStore = create<Store>()((set, get) => ({
  currentUser: null,
  isLoggedIn: false,

  loadUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ currentUser: null, isLoggedIn: false })
      return
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profile) {
      set({
        currentUser: profile,
        isLoggedIn: true,
        myBudget: profile.giving_budget_monthly ?? 300,
      })
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ currentUser: null, isLoggedIn: false })
  },

  profiles: [],

  loadProfiles: async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("points", { ascending: false })

    if (data) {
      set({ profiles: data })
    }
  },

  posts: [],

  loadPosts: async () => {
    // Ensure company values are loaded so dbToPost can resolve them
    if (get().companyValues.length === 0) {
      await get().loadCompanyValues()
    }
    const { companyValues } = get()
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      set({ posts: data.map(row => dbToPost(row, companyValues)) })
    }
  },

  addPost: async (postData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: freshUser } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (!freshUser) return

    const { data: newRow, error: insertError } = await supabase
      .from("posts")
      .insert({
        from_name: freshUser.full_name,
        from_office: freshUser.office,
        from_avatar: freshUser.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
        from_color: "from-sky-500 to-blue-500",
        to_name: postData.to,
        to_office: postData.toOffice,
        points: postData.points,
        category: postData.category,
        title: postData.title,
        message: postData.message,
        company_value_id: postData.companyValueId || null,
        reactions: {},
      })
      .select()
      .single()

    if (!newRow || insertError) return

    const { companyValues } = get()
    set({ posts: [dbToPost(newRow, companyValues), ...get().posts] })

    // Find receiver once for all subsequent operations
    const receiverProfile = get().profiles.find(p => p.full_name === postData.to)

    if (receiverProfile) {
      await supabase.from("point_transactions").insert({
        from_user_id: freshUser.id,
        to_user_id: receiverProfile.id,
        post_id: newRow.id,
        company_value_id: postData.companyValueId || null,
        points: postData.points,
        transaction_type: "appreciation",
      })

      // Re-fetch receiver immediately before writing to shrink the race-condition window.
      // True atomicity requires a DB-side RPC with increment — consider adding one later.
      const { data: freshReceiver } = await supabase
        .from("profiles")
        .select("points, monthly_points")
        .eq("id", receiverProfile.id)
        .single()

      if (freshReceiver) {
        await supabase
          .from("profiles")
          .update({
            points: freshReceiver.points + postData.points,
            monthly_points: freshReceiver.monthly_points + postData.points,
          })
          .eq("id", receiverProfile.id)
      }
    }

    await supabase
      .from("profiles")
      .update({ budget_used: (freshUser.budget_used || 0) + postData.points })
      .eq("id", freshUser.id)

    await get().loadUser()
    await get().loadProfiles()
  },

  addReaction: async (postId, emoji) => {
    const post = get().posts.find(p => p.id === postId)
    if (!post) return

    const newReactions = {
      ...post.reactions,
      [emoji]: (post.reactions[emoji] || 0) + 1,
    }

    await supabase
      .from("posts")
      .update({ reactions: newReactions })
      .eq("id", postId)

    set({
      posts: get().posts.map(p =>
        p.id === postId ? { ...p, reactions: newReactions } : p
      ),
    })
  },

  removeReaction: async (postId, emoji) => {
    const post = get().posts.find(p => p.id === postId)
    if (!post) return

    const newReactions = { ...post.reactions }
    newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1)
    if (newReactions[emoji] === 0) delete newReactions[emoji]

    await supabase
      .from("posts")
      .update({ reactions: newReactions })
      .eq("id", postId)

    set({
      posts: get().posts.map(p =>
        p.id === postId ? { ...p, reactions: newReactions } : p
      ),
    })
  },

  companyValues: [],

  loadCompanyValues: async () => {
    const { data } = await supabase
      .from("company_values")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")

    if (data) {
      set({ companyValues: data })
    }
  },

  myBudget: 300,
}))