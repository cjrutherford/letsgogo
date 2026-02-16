import { createClient } from '@libsql/client'

export const db = createClient({
  url: import.meta.env.VITE_TURSO_DATABASE_URL || 'file:local.db',
  authToken: import.meta.env.VITE_TURSO_AUTH_TOKEN || '',
})

export interface User {
  id: string
  email: string
  created_at: string
}

export interface Progress {
  id?: string
  user_id: string
  lesson_id: string
  module_id: string
  completed: boolean
  score?: number
  completed_at?: string
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  slug: string
  order: number
}

export interface Module {
  id: string
  title: string
  slug: string
  description: string
  order: number
}
