import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { STORAGE_KEYS } from "../lib/supabase"
import type { Student } from "../types/student"

const API_URL = "http://172.16.9.32:3000/api"

class ProfileService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  private async getHeaders() {
    const token = await this.getAuthToken()
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  }

  async getStudentProfile(studentId: string): Promise<Student> {
    try {
      const headers = await this.getHeaders()
      const response = await axios.get(`${API_URL}/students/${studentId}`, { headers })
      return response.data
    } catch (error) {
      console.error("Error fetching student profile:", error)
      throw error
    }
  }

  async getStudentProgress(studentId: string): Promise<any> {
    try {
      const headers = await this.getHeaders()
      const response = await axios.get(`${API_URL}/progress/student/${studentId}`, { headers })
      return response.data
    } catch (error) {
      console.error("Error fetching student progress:", error)
      throw error
    }
  }

  async getStudentDashboard(studentId: string): Promise<any> {
    try {
      const headers = await this.getHeaders()
      const response = await axios.get(`${API_URL}/progress/dashboard/${studentId}`, { headers })
      return response.data
    } catch (error) {
      console.error("Error fetching student dashboard:", error)
      throw error
    }
  }

  // Vous pouvez ajouter d'autres méthodes ici pour interagir avec le backend
}

export const profileService = new ProfileService()

