import type { User } from '../types'
import { delay, readJson, writeJson } from './mockBackend'

/**
 * MOCK AUTH — accounts are stored in this browser's localStorage only.
 * This is NOT secure and is just for building the UI. Replace these functions with a
 * real provider (Supabase Auth, Firebase Auth, Clerk, Auth0...) keeping the same signatures.
 */

interface StoredUser {
  user: User
  passwordHash: string
}

const USERS_KEY = 'wtd:mock:users'
const SESSION_KEY = 'wtd:mock:session'

async function hash(password: string, email: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, [])
}

function saveUsers(users: StoredUser[]) {
  writeJson(USERS_KEY, users)
}

export async function getCurrentUser(): Promise<User | null> {
  const id = readJson<string | null>(SESSION_KEY, null)
  return getUsers().find((u) => u.user.id === id)?.user ?? null
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  await delay()
  const users = getUsers()
  const normalised = email.trim().toLowerCase()
  if (users.some((u) => u.user.email === normalised)) {
    throw new Error('An account with that email already exists.')
  }
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
  const user: User = { id: crypto.randomUUID(), name: name.trim(), email: normalised, createdAt: new Date().toISOString() }
  saveUsers([...users, { user, passwordHash: await hash(password, normalised) }])
  writeJson(SESSION_KEY, user.id)
  return user
}

export async function logIn(email: string, password: string): Promise<User> {
  await delay()
  const normalised = email.trim().toLowerCase()
  const match = getUsers().find((u) => u.user.email === normalised)
  if (!match || match.passwordHash !== (await hash(password, normalised))) {
    throw new Error('Incorrect email or password.')
  }
  writeJson(SESSION_KEY, match.user.id)
  return match.user
}

export async function logOut(): Promise<void> {
  localStorage.removeItem(SESSION_KEY)
}

export async function updateUser(id: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
  await delay(150)
  const users = getUsers()
  const index = users.findIndex((u) => u.user.id === id)
  if (index === -1) throw new Error('Account not found.')
  if (patch.email) {
    patch.email = patch.email.trim().toLowerCase()
    if (users.some((u, i) => i !== index && u.user.email === patch.email)) {
      throw new Error('An account with that email already exists.')
    }
  }
  const updated = { ...users[index].user, ...patch }
  users[index] = { ...users[index], user: updated }
  saveUsers(users)
  return updated
}

export async function deleteAccount(id: string): Promise<void> {
  await delay()
  saveUsers(getUsers().filter((u) => u.user.id !== id))
  localStorage.removeItem(`wtd:mock:trips:${id}`)
  localStorage.removeItem(`wtd:mock:library:${id}`)
  localStorage.removeItem(SESSION_KEY)
}
