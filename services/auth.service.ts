import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { STORAGE_KEYS } from "../lib/supabase"

// Configuration de l'API
export const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL || "http://172.16.9.32:3000",
  timeout: 10000,
})

// Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  roles?: string[]
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface ApiError {
  message: string
  status?: number
  data?: any
}

class AuthService {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials)
  
      console.log("Réponse API Login:", response.data) // 🚀 Vérifie le contenu ici
  
      // Vérification des données avant stockage
      if (response.data && response.data.access_token && response.data.user) {
        await this.storeAuthData(response.data)
      } else {
        throw new Error("Réponse d'authentification invalide")
      }
  
      return response.data
    } catch (error: any) {
      console.error("Erreur de connexion:", error.response?.data || error)
      throw this.formatError(error, "Erreur de connexion. Veuillez vérifier vos identifiants.")
    }
  }
  
  // Inscription
  async register(userData: RegisterData): Promise<any> {
    try {
      const response = await apiClient.post("/auth/register", userData)
      return response.data
    } catch (error: any) {
      console.error("Erreur d'inscription:", error)
      throw this.formatError(error, "Erreur d'inscription. Veuillez réessayer.")
    }
  }

  // Déconnexion
  async logout() {
    try {
      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        throw new Error("No token found. User is not authenticated.");
      }
  
      // Send the token in the request headers for the logout
      await apiClient.post("/auth/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // After successful logout, remove the token and user data from AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  }
  
  // async logout(): Promise<void> {
  //   try {
  //     // Appeler l'API pour invalider le token côté serveur
  //     await apiClient.post("/auth/logout")
  //   } catch (error) {
  //     console.error("Erreur lors de la déconnexion:", error)
  //   } finally {
  //     // Supprimer les données locales même si l'API échoue
  //     const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  //     if (!token) {
  //       console.log('Utilisateur non connecté, impossible de se déconnecter.');
  //     }
  //     await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA)
  //   }
  // }

  // Récupérer l'utilisateur actuel
  // async getCurrentUser(): Promise<User | null> {
  //   try {
  //     const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
  //     return userData ? JSON.parse(userData) : null
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération de l'utilisateur:", error)
  //     return null
  //   }
  // }
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)
      console.log("Données récupérées:", userData) 
  
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error)
      return null
    }
  }
  

  // Vérifier si l'utilisateur est connecté
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      return !!token
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error)
      return false
    }
  }
// Rafraîchir le token
async refreshToken(): Promise<string | null> {
  try {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    if (!refreshToken) {
      throw new Error("No refresh token found")
    }

    const response = await apiClient.post<{ access_token: string }>("/auth/refresh-token", {
      refresh_token: refreshToken,
    })

    if (response.data && response.data.access_token) {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.access_token)
      return response.data.access_token
    } else {
      throw new Error("Invalid refresh token response")
    }
  } catch (error) {
    console.error("Error refreshing token:", error)
    await this.logout() // Logout user if refresh fails
    return null
  }
}

  
  private async storeAuthData(data: AuthResponse): Promise<void> {
    try {
      if (!data.access_token) {
        console.error("Tentative de stockage d'un token null ou undefined")
        throw new Error("Token d'authentification invalide")
      }
  
      if (!data.user) {
        console.error("Tentative de stockage de données utilisateur null ou undefined")
        throw new Error("Données utilisateur invalides")
      }
  
      console.log("Stockage des données d'authentification:", data) // ✅ Vérification
  
      // Stockage sécurisé des données
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access_token)
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user))
    } catch (error) {
      console.error("Erreur lors du stockage des données:", error)
    }
  }
  
  // Mot de passe oublié
  async forgotPassword(email: string): Promise<any> {
    try {
      const response = await apiClient.post("/auth/forgot-password", { email })
      return response.data
    } catch (error: any) {
      console.error("Erreur lors de la demande de réinitialisation du mot de passe:", error)
      throw this.formatError(error, "Erreur lors de la demande de réinitialisation du mot de passe.")
    }
  }

  // Réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<any> {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        password: newPassword,
      })
      return response.data
    } catch (error: any) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error)
      throw this.formatError(error, "Erreur lors de la réinitialisation du mot de passe.")
    }
  }

  // Formater les erreurs de manière cohérente
  private formatError(error: any, defaultMessage: string): ApiError {
    return {
      message: error.response?.data?.message || error.message || defaultMessage,
      status: error.response?.status,
      data: error.response?.data,
    }
  }
}

export const authService = new AuthService()

