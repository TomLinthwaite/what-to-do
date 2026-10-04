import { createContext } from 'react'
import type { User } from '../types'

export interface AuthContextValue {
  user: User | null
  loading: boolean
  /** True after the user deliberately logs out or deletes their account (until they log in again). */
  signedOut: boolean
  signUp: (name: string, email: string, password: string) => Promise<User>
  logIn: (email: string, password: string) => Promise<User>
  logOut: () => Promise<void>
  updateUser: (patch: Partial<Omit<User, 'id' | 'createdAt'>>) => Promise<User>
  deleteAccount: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
