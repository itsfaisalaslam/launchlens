import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY)
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }

    localStorage.removeItem('launchlens_token')
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }

    localStorage.removeItem('launchlens_user')
  }, [user])

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
      } catch (error) {
        setToken('')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadCurrentUser()
  }, [token])

  const saveAuthData = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    setAuthError('')
  }

  const register = async (formData) => {
    setLoading(true)
    setAuthError('')

    try {
      const { data } = await api.post('/auth/register', formData)
      saveAuthData(data)
      return data
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Registration failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  const login = async (formData) => {
    setLoading(true)
    setAuthError('')

    try {
      const { data } = await api.post('/auth/login', formData)
      saveAuthData(data)
      return data
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Login failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    setAuthError('')
    setLoading(false)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const clearAuthError = () => {
    setAuthError('')
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      authError,
      isAuthenticated: Boolean(token && user),
      register,
      login,
      logout,
      clearAuthError,
    }),
    [authError, loading, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
