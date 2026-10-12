import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { normalizeRole } from './roles'

const AuthContext = createContext(null)
const STORAGE_KEY = 'mealmatrices.auth.v1'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
    return JSON.parse(decodeURIComponent(Array.from(json, (character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')))
  } catch {
    return null
  }
}

function roleFromClaims(claims) {
  const values = [claims?.role, claims?.userRole, claims?.authorities, claims?.roles, claims?.scope]
    .flat()
    .map((value) => (typeof value === 'object' && value !== null ? value.authority : value))
    .filter((value) => typeof value === 'string')
  for (const value of values) {
    const role = value.split(/\s+/).map(normalizeRole).find(Boolean)
    if (role) return role
  }
  return null
}

function normalizeUser(userData, role) {
  const user = userData && typeof userData === 'object' ? userData : {}
  return {
    ...user,
    fullName: user.fullName || user.name || user.displayName || '',
    institutionalId: user.institutionalId || user.rollNumber || user.grNumber || user.username || '',
    role,
    roomNumber: user.roomNumber || user.roomNo || '',
    hostelBlock: user.hostelBlock || user.block || '',
    messSubscription: user.messSubscription || '',
  }
}

function readStoredSession() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage
    const stored = JSON.parse(storage.getItem(STORAGE_KEY) || 'null')
    if (!stored?.token || !stored?.user) return null
    const claims = decodeJwt(stored.token)
    if (claims?.exp && claims.exp * 1000 <= Date.now()) {
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    const role = roleFromClaims(claims)
    if (!role) {
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return {
      token: stored.token,
      user: normalizeUser(stored.user, role),
      rememberMe: storage === localStorage,
      isDemo: stored.isDemo === true,
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    throw error
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })
  const responseText = await response.text()
  let result = null
  if (responseText) {
    try {
      result = JSON.parse(responseText)
    } catch {
      result = { message: responseText }
    }
  }
  if (!response.ok) {
    throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`)
  }
  return result
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession)

  const persistSession = useCallback((nextSession, rememberMe = nextSession.rememberMe !== false) => {
    const storage = rememberMe ? localStorage : sessionStorage
    const stored = { ...nextSession, rememberMe }
    storage.setItem(STORAGE_KEY, JSON.stringify(stored))
    const otherStorage = rememberMe ? sessionStorage : localStorage
    otherStorage.removeItem(STORAGE_KEY)
    setSession(stored)
  }, [])

  const login = useCallback(async (credentials) => {
    const { rememberMe = true, ...loginPayload } = credentials
    const response = await requestJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginPayload),
    })
    const authResult = response?.data || response
    const rawToken = authResult?.token || authResult?.accessToken || authResult?.jwt
    const token = typeof rawToken === 'string' ? rawToken.replace(/^Bearer\s+/i, '') : rawToken
    if (typeof token !== 'string' || !token) {
      throw new Error('The authentication service did not return a JWT token.')
    }
    const claims = decodeJwt(token)
    const role = roleFromClaims(claims)
    if (!role) {
      throw new Error('The authentication token does not contain a supported role.')
    }
    if (claims?.exp && claims.exp * 1000 <= Date.now()) {
      throw new Error('The authentication service returned an expired session. Please try again.')
    }
    const user = normalizeUser(authResult?.user || authResult?.profile || claims, role)
    const nextSession = { token, user, rememberMe: rememberMe !== false, isDemo: false }
    persistSession(nextSession, nextSession.rememberMe)
    return nextSession
  }, [persistSession])

  const demoLogin = useCallback((role) => {
    const demoAccounts = {
      STUDENT: {
        fullName: 'Amaan Siddiqui',
        institutionalId: 'DEMO-STU-2042',
        roomNumber: 'B-204',
        hostelBlock: 'Block B',
        messSubscription: 'Full-Board Veg (Standard Plan)',
      },
      STAFF: {
        fullName: 'Chef Ramesh Kumar',
        institutionalId: 'DEMO-STAFF-01',
        roomNumber: '',
        hostelBlock: '',
        messSubscription: '',
      },
      ADMIN: {
        fullName: 'Demo Warden',
        institutionalId: 'DEMO-ADMIN-01',
        roomNumber: '',
        hostelBlock: '',
        messSubscription: '',
      },
    }
    const account = demoAccounts[normalizeRole(role)]
    if (!account) throw new Error('Choose a valid demo role.')
    const claims = { role: normalizeRole(role), exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60 }
    const token = `demo.${btoa(JSON.stringify(claims))}.demo`
    const nextSession = {
      token,
      user: normalizeUser({ ...account, isDemo: true }, claims.role),
      rememberMe: true,
      isDemo: true,
    }
    persistSession(nextSession)
    return nextSession
  }, [persistSession])

  const register = useCallback(async (registration) => {
    return requestJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(registration),
    })
  }, [])

  const updateProfile = useCallback(async (profileChanges) => {
    if (!session?.token) throw new Error('You must be signed in to update your profile.')
    if (session.isDemo) {
      const user = normalizeUser({
        ...session.user,
        fullName: profileChanges.fullName || session.user.fullName,
      }, session.user.role)
      persistSession({ ...session, user }, session.rememberMe)
      return user
    }
    const response = await requestJson('/api/users/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${session.token}` },
      body: JSON.stringify(profileChanges),
    })
    const updated = response?.user || response?.profile || response?.data || response || {}
    const user = normalizeUser({
      ...session.user,
      fullName: updated.fullName || updated.name || profileChanges.fullName || session.user.fullName,
      institutionalId: session.user.institutionalId,
      roomNumber: session.user.roomNumber,
      hostelBlock: session.user.hostelBlock,
      messSubscription: session.user.messSubscription,
    }, session.user.role)
    persistSession({ ...session, user }, session.rememberMe)
    return user
  }, [persistSession, session])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  useEffect(() => {
    if (!session?.token) return undefined
    const expiration = decodeJwt(session.token)?.exp
    if (!expiration) return undefined
    const expiresAt = expiration * 1000
    let timer
    const checkExpiration = () => {
      const remaining = expiresAt - Date.now()
      if (remaining <= 0) logout()
      else timer = window.setTimeout(checkExpiration, Math.min(remaining, 2_147_000_000))
    }
    timer = window.setTimeout(checkExpiration, Math.max(0, expiresAt - Date.now()))
    return () => window.clearTimeout(timer)
  }, [logout, session?.token])

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || null,
    role: session?.user?.role || null,
    login,
    register,
    demoLogin,
    updateProfile,
    logout,
    isDemo: Boolean(session?.isDemo),
    isAuthenticated: Boolean(session?.token && session?.user),
  }), [demoLogin, login, logout, register, session, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider.')
  return context
}
