import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { STORAGE_KEYS } from "../lib/supabase"
import { authService } from "./auth.service"

const apiClient = axios.create({
  baseURL: "http://192.168.0.109:3000",
  timeout: 10000,
})

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    } catch (error) {
      console.error("Error adding auth token to request:", error)
      return config
    }
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        // Attempt to refresh the token
        const newToken = await authService.refreshToken()
        if (newToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken)
          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError)
        // If refresh fails, log out the user
        await authService.logout()
        // You might want to redirect to the login screen here
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient

