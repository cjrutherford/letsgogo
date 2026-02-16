import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface LocalUser {
  id: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: LocalUser | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const STORAGE_KEY = 'golearn_user'
const CREDENTIALS_KEY = 'golearn_credentials'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const signUp = async (email: string, _password: string) => {
    const credentials = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || '{}')
    
    if (credentials[email]) {
      throw new Error('User already exists')
    }

    const newUser: LocalUser = {
      id: uuidv4(),
      email,
      createdAt: new Date().toISOString(),
    }

    credentials[email] = { password: _password, userId: newUser.id }
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
  }

  const signIn = async (email: string, password: string) => {
    const credentials = JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || '{}')
    const stored = credentials[email]

    if (!stored || stored.password !== password) {
      throw new Error('Invalid credentials')
    }

    const loggedInUser: LocalUser = {
      id: stored.userId,
      email,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
    setUser(loggedInUser)
  }

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
