import { createContext, useContext, useEffect, useState } from 'react'
import api, { setAuthToken } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('launchlens_token') || '')
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('launchlens_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('launchlens_token')))
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    setAuthToken(token)

    if (token) {
      localStorage.setItem('launchlens_token', token)
    } else {
      localStorage.removeItem('launchlens_token')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('launchlens_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('launchlens_user')
    }
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
        logout()
      } finally {
        setLoading(false)
      }
    }

    loadCurrentUser()
  }, [token])

  const saveAuthData = (data) => {
    setToken(data.token)
    setUser(data.user)
    setAuthError('')
  }

  const register = async (formData) => {
    setLoading(true)
    setAuthError('')

    try {
      const { data } = await api.post('/api/auth/register', formData)
      saveAuthData(data)
      return data
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.'
      setAuthError(message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const login = async (formData) => {
    setLoading(true)
    setAuthError('')

    try {
      const { data } = await api.post('/api/auth/login', formData)
      saveAuthData(data)
      return data
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please try again.'
      setAuthError(message)
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
    setAuthToken('')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        isAuthenticated: Boolean(token && user),
        register,
        login,
        logout,
        clearAuthError: () => setAuthError(''),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
