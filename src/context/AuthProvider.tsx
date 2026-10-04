import { useEffect, useMemo, useState, type ReactNode } from 'react'
import * as auth from '../services/auth'
import type { User } from '../types'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    auth.getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signedOut,
      async signUp(name, email, password) {
        const u = await auth.signUp(name, email, password)
        setSignedOut(false)
        setUser(u)
        return u
      },
      async logIn(email, password) {
        const u = await auth.logIn(email, password)
        setSignedOut(false)
        setUser(u)
        return u
      },
      async logOut() {
        await auth.logOut()
        setSignedOut(true)
        setUser(null)
      },
      async updateUser(patch) {
        if (!user) throw new Error('Not logged in.')
        const u = await auth.updateUser(user.id, patch)
        setUser(u)
        return u
      },
      async deleteAccount() {
        if (!user) return
        await auth.deleteAccount(user.id)
        setSignedOut(true)
        setUser(null)
      },
    }),
    [user, loading, signedOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
