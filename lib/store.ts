import { create } from "zustand"
import { supabase } from "./supabase"
import { avatarColor } from "./utils"
import type { RealtimeChannel } from "@supabase/supabase-js"
import type { Lang } from "./i18n"

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

export type Notification = {
  id: number
  user_id: string
  post_id: number
  from_name: string
  from_avatar?: string
  points: number
  title: string
  is_read: boolean
  created_at: string
}

export type CompanyValue = {
  id: string
  title: string
  description: string
  icon: string
  sort_order: number
  is_active: boolean
}

const PAGE_SIZE = 20

type Store = {
  currentUser: Profile | null
  isLoggedIn: boolean
  loadUser: () => Promise<void>
  logout: () => Promise<void>

  profiles: Profile[]
  loadProfiles: () => Promise<void>

  posts: Post[]
  postsHasMore: boolean
  postsLoading: boolean
  loadPosts: (reset?: boolean) => Promise<void>
  loadMorePosts: () => Promise<void>
  addPost: (post: Omit<Post, "id" | "time" | "reactions">) => Promise<void>
  addReaction: (postId: number, emoji: string) => Promise<void>
  removeReaction: (postId: number, emoji: string) => Promise<void>

  companyValues: CompanyValue[]
  loadCompanyValues: () => Promise<void>

  myBudget: number

  updateAvatar: (file: File) => Promise<{ error?: string }>

  // Notifications
  notifications: Notification[]
  unreadCount: number
  loadNotifications: () => Promise<void>
  markAllRead: () => Promise<void>
  markRead: (id: number) => Promise<void>

  // Language
  lang: Lang
  setLang: (lang: Lang) => void

  // Real-time
  realtimeChannel: RealtimeChannel | null
  newPostsAvailable: boolean
  subscribeRealtime: () => void
  unsubscribeRealtime: () => void
  dismissNewPosts: () => void
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
    fromColor: avatarColor(row.from_name),
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

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "vi"
  return (localStorage.getItem("ov_lang") as Lang) || "vi"
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
      // Load notifications in background
      get().loadNotifications()
    }
  },

  logout: async () => {
    get().unsubscribeRealtime()
    await supabase.auth.signOut()
    set({ currentUser: null, isLoggedIn: false })
  },

  profiles: [],

  loadProfiles: async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("points", { ascending: false })

    if (data) set({ profiles: data })
  },

  posts: [],
  postsHasMore: true,
  postsLoading: false,

  loadPosts: async (reset = true) => {
    if (get().companyValues.length === 0) await get().loadCompanyValues()
    const { companyValues } = get()

    const from = reset ? 0 : get().posts.length
    const to = from + PAGE_SIZE - 1

    set({ postsLoading: true })

    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to)

    set({ postsLoading: false })

    if (data) {
      const newPosts = data.map(row => dbToPost(row, companyValues))
      set({
        posts: reset ? newPosts : [...get().posts, ...newPosts],
        postsHasMore: data.length === PAGE_SIZE,
      })
    }
  },

  loadMorePosts: async () => {
    if (get().postsLoading || !get().postsHasMore) return
    await get().loadPosts(false)
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
    // Real-time will handle adding to feed for other users
    // For sender: add immediately to top
    set({ posts: [dbToPost(newRow, companyValues), ...get().posts] })

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

    // Insert notification for receiver
    if (receiverProfile) {
      await supabase.from("notifications").insert({
        user_id: receiverProfile.id,
        post_id: newRow.id,
        from_name: freshUser.full_name,
        from_avatar: freshUser.avatar || null,
        points: postData.points,
        title: postData.title,
      })
    }

    await get().loadUser()
    await get().loadProfiles()
  },

  addReaction: async (postId, emoji) => {
    const post = get().posts.find(p => p.id === postId)
    if (!post) return
    const newReactions = { ...post.reactions, [emoji]: (post.reactions[emoji] || 0) + 1 }
    await supabase.from("posts").update({ reactions: newReactions }).eq("id", postId)
    set({ posts: get().posts.map(p => p.id === postId ? { ...p, reactions: newReactions } : p) })
  },

  removeReaction: async (postId, emoji) => {
    const post = get().posts.find(p => p.id === postId)
    if (!post) return
    const newReactions = { ...post.reactions }
    newReactions[emoji] = Math.max(0, (newReactions[emoji] || 0) - 1)
    if (newReactions[emoji] === 0) delete newReactions[emoji]
    await supabase.from("posts").update({ reactions: newReactions }).eq("id", postId)
    set({ posts: get().posts.map(p => p.id === postId ? { ...p, reactions: newReactions } : p) })
  },

  companyValues: [],

  loadCompanyValues: async () => {
    const { data } = await supabase
      .from("company_values")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
    if (data) set({ companyValues: data })
  },

  myBudget: 300,

  // ─── Notifications ────────────────────────────────────────────────────────
  notifications: [],
  unreadCount: 0,

  loadNotifications: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30)
    if (data) {
      set({
        notifications: data as Notification[],
        unreadCount: data.filter((n: Notification) => !n.is_read).length,
      })
    }
  },

  markAllRead: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },

  markRead: async (id: number) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  // ─── Language ─────────────────────────────────────────────────────────────
  lang: getInitialLang(),
  setLang: (lang) => {
    if (typeof window !== "undefined") localStorage.setItem("ov_lang", lang)
    set({ lang })
  },

  // ─── Avatar upload ────────────────────────────────────────────────────────
  updateAvatar: async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not logged in" }

    const ext = file.name.split(".").pop() || "jpg"
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(path)

    // Add cache-busting so browser picks up the new image immediately
    const urlWithBust = publicUrl + "?t=" + Date.now()

    await supabase.from("profiles").update({ avatar: urlWithBust }).eq("id", user.id)
    await get().loadUser()
    await get().loadProfiles()
    return {}
  },

  // ─── Real-time ────────────────────────────────────────────────────────────
  realtimeChannel: null,
  newPostsAvailable: false,

  subscribeRealtime: () => {
    // Avoid duplicate subscriptions
    if (get().realtimeChannel) return

    const channel = supabase
      .channel("feed-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          const { companyValues, currentUser, posts } = get()
          if (companyValues.length === 0) await get().loadCompanyValues()

          const newPost = dbToPost(payload.new, get().companyValues)

          // If it's my own post — already added optimistically, skip
          if (newPost.from === currentUser?.full_name) return

          // If this post is already visible at top of feed — show banner
          const alreadyLoaded = posts.some(p => p.id === newPost.id)
          if (!alreadyLoaded) {
            set({ newPostsAvailable: true })
          }

          // Also refresh profiles so leaderboard stays accurate
          get().loadProfiles()
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => {
          get().loadProfiles()
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        async (payload) => {
          const { currentUser } = get()
          if (!currentUser) return
          // Only handle if this notification belongs to the current user
          if (payload.new.user_id !== currentUser.id) return
          const notif = payload.new as Notification
          set(s => ({
            notifications: [notif, ...s.notifications].slice(0, 30),
            unreadCount: s.unreadCount + 1,
          }))
        }
      )
      .subscribe()

    set({ realtimeChannel: channel })
  },

  unsubscribeRealtime: () => {
    const ch = get().realtimeChannel
    if (ch) {
      supabase.removeChannel(ch)
      set({ realtimeChannel: null })
    }
  },

  dismissNewPosts: () => set({ newPostsAvailable: false }),
}))
