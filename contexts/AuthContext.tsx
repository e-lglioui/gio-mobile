"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { STORAGE_KEYS } from "../lib/supabase"
import { authService, type User } from "../services/auth.service"

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<any>
  error: string | null
  clearError: () => void
  refreshUser: () => Promise<void>
}

// Création du contexte avec une valeur par défaut undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode
}

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fonction pour charger l'utilisateur depuis le stockage local
  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true)
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)

      if (token) {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
        if (userData) {
          setUser(JSON.parse(userData))
          setIsAuthenticated(true)
        } else {
          // Token existe mais pas de données utilisateur
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'utilisateur:", err)
      setError("Erreur lors du chargement de l'utilisateur")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Charger l'utilisateur au montage du composant
  useEffect(() => {
    loadUser()
  }, [loadUser])

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await authService.login({ email, password })

      // Vérifier que la réponse contient bien un utilisateur
      if (response && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        throw new Error("Données d'authentification invalides")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Erreur de connexion"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction d'inscription
  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      await authService.register({ username, email, password })
      // Après l'inscription, on ne connecte pas automatiquement l'utilisateur
      // car il pourrait y avoir une étape de vérification d'email
    } catch (err: any) {
      const errorMessage = err.message || "Erreur d'inscription"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de mot de passe oublié
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)
      return await authService.forgotPassword(email)
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors de la réinitialisation du mot de passe"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (err: any) {
      const errorMessage = err.message || "Erreur de déconnexion"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour effacer les erreurs
  const clearError = () => {
    setError(null)
  }

  // Fonction pour rafraîchir les données utilisateur
  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const currentUser = await authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
      }
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des données utilisateur:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    error,
    clearError,
    refreshUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }

  return context
}

