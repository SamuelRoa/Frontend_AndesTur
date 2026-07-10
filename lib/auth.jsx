'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth as authApi } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')
      if (storedToken && storedUser) {
        try {
          const res = await authApi.getProfile()
          setToken(storedToken)
          setUser(res.data)
          localStorage.setItem('auth_user', JSON.stringify(res.data))
        } catch (err) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    const { token: newToken, data: userData } = res
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (userData) => {
    const res = await authApi.register(userData)
    const { token: newToken, data: newUser } = res
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('auth_user', JSON.stringify(updated))
  }, [user])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
