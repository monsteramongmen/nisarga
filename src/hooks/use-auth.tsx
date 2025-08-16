"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useToast } from "./use-toast"

interface AuthContextType {
  isAuthenticated: boolean
  login: (email: string, pass: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem("isAuthenticated")
      if (storedAuth === "true") {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Could not access localStorage", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (email: string, pass: string) => {
    if (email === "admin@catering.com" && pass === "Catering123") {
      try {
        localStorage.setItem("isAuthenticated", "true")
      } catch (error) {
        console.error("Could not access localStorage", error)
      }
      setIsAuthenticated(true)
      router.push("/dashboard")
      return true
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password.",
      })
      return false
    }
  }

  const logout = () => {
    try {
      localStorage.removeItem("isAuthenticated")
    } catch (error) {
      console.error("Could not access localStorage", error)
    }
    setIsAuthenticated(false)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
