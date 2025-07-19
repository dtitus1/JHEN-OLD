import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  subscription_tier: 'free' | 'premium' | 'elite' | 'admin'
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = profile?.subscription_tier === 'admin'

  useEffect(() => {
    // Only initialize auth if Supabase is available
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            const newProfile = {
              id: userId,
              email: userData.user.email || '',
              full_name: userData.user.user_metadata?.full_name || null,
              subscription_tier: 'free' as const
            }
            setProfile(newProfile)
          }
        }
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Set a default profile for demo purposes
      if (user) {
        const isAdminUser = user.email?.includes('admin') || user.email?.includes('jhen')
        setProfile({
          id: userId,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          subscription_tier: isAdminUser ? 'admin' : 'free'
        })
      }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      toast.error('Authentication service not available. Please configure Supabase.')
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      throw error
    }

    toast.success('Account created successfully!')
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      toast.error('Authentication service not available. Please configure Supabase.')
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
      throw error
    }

    toast.success('Welcome back!')
  }

  const signOut = async () => {
    if (!supabase) {
      toast.error('Authentication service not available.')
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
      throw error
    }
    toast.success('Signed out successfully')
  }

  const resetPassword = async (email: string) => {
    if (!supabase) {
      toast.error('Authentication service not available.')
      throw new Error('Supabase not configured')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      toast.error(error.message)
      throw error
    }
    toast.success('Password reset email sent!')
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}