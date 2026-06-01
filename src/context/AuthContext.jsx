import { createContext, useContext, useState, useEffect } from 'react'
import { login as loginApi, register as registerApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const saveAuth = (data) => {
    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.accessToken)
    setUser(data.user)
  }

  const login = async (credentials) => {
    const res = await loginApi(credentials)
    saveAuth(res.data.data)
    return res.data.data
  }

  const register = async (info) => {
    const res = await registerApi(info)
    saveAuth(res.data.data)
    return res.data.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const isAdmin    = user?.role === 'ADMIN'
  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
