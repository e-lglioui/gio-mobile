import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { STORAGE_KEYS } from "../lib/supabase"

// Types
export interface Schedule {
  openingTime: string
  closingTime: string
  operatingDays: string[]
}
export interface Location {
  latitude: number
  longitude: number
  address?: string
}

export interface Dashboard {
  studentCount: number
  instructorCount?: number
  classCount?: number
}

export interface School {
  _id: string
  name: string
  address: string
  description: string
  images: string[]
  contactNumber: string
  schedule: Schedule
  dashboard: Dashboard
  instructors?: string[]
  students?: string[]
  martialArts?: string[]
  location?: Location 
  distance?: number 
}

// Create an axios instance with default config
const schoolApiClient = axios.create({
  baseURL: "http://192.168.0.109:3000",
  timeout: 10000,
})

// Add a request interceptor to add the token to all requests
schoolApiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      console.log("Token retrieved for API request:", token ? "Token exists" : "No token found")

      if (token) {
        // Make sure headers object exists
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
        console.log("Authorization header set:", `Bearer ${token.substring(0, 10)}...`)
      } else {
        console.warn("No authentication token found in AsyncStorage")
      }
      return config
    } catch (error) {
      console.error("Error adding auth token to request:", error)
      return config
    }
  },
  (error) => {
    console.error("Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Add a response interceptor to log errors
schoolApiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error Response:", {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      })

      // If we get a 401, the token might be expired
      if (error.response.status === 401) {
        console.warn("Authentication failed - token may be expired or invalid")
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("API No Response:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("API Request Error:", error.message)
    }
    return Promise.reject(error)
  },
)

class SchoolService {
  private baseUrl: string

  constructor() {
    this.baseUrl = "/schools"
  }

  // Helper method to check authentication status
  async checkAuthStatus(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA)

      console.log("Auth check - Token exists:", !!token)
      console.log("Auth check - User data exists:", !!userData)

      if (userData) {
        const user = JSON.parse(userData)
        console.log("Auth check - User ID:", user.id)
      }

      return !!token && !!userData
    } catch (error) {
      console.error("Error checking auth status:", error)
      return false
    }
  }

  // Get all schools
  async getAllSchools(): Promise<School[]> {
    try {
      // Check auth status before making the request
      const isAuthenticated = await this.checkAuthStatus()
      if (!isAuthenticated) {
        console.warn("Attempting to fetch schools without authentication")
      }

      console.log("Fetching schools from:", this.baseUrl)
      const response = await schoolApiClient.get(this.baseUrl)
      console.log("Schools fetched successfully:", response.data.length)
      return response.data
    } catch (error) {
      console.error("Error fetching schools:", error)
      throw error
    }
  }

  // Get school by ID
  async getSchoolById(id: string): Promise<School> {
    try {
      const response = await schoolApiClient.get(`${this.baseUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching school with ID ${id}:`, error)
      throw error
    }
  }

  // Create a new school
  async createSchool(schoolData: Omit<School, "_id">): Promise<School> {
    try {
      const response = await schoolApiClient.post(this.baseUrl, schoolData)
      return response.data
    } catch (error) {
      console.error("Error creating school:", error)
      throw error
    }
  }

  // Update a school
  async updateSchool(id: string, schoolData: Partial<School>): Promise<School> {
    try {
      const response = await schoolApiClient.put(`${this.baseUrl}/${id}`, schoolData)
      return response.data
    } catch (error) {
      console.error(`Error updating school with ID ${id}:`, error)
      throw error
    }
  }

  // Delete a school
  async deleteSchool(id: string): Promise<void> {
    try {
      await schoolApiClient.delete(`${this.baseUrl}/${id}`)
    } catch (error) {
      console.error(`Error deleting school with ID ${id}:`, error)
      throw error
    }
  }

  // Add instructor to school
  async addInstructorToSchool(schoolId: string, instructorId: string): Promise<School> {
    try {
      const response = await schoolApiClient.put(`${this.baseUrl}/${schoolId}/instructors/${instructorId}`)
      return response.data
    } catch (error) {
      console.error(`Error adding instructor to school:`, error)
      throw error
    }
  }

  // Add student to school
  async addStudentToSchool(schoolId: string, studentId: string): Promise<School> {
    try {
      const response = await schoolApiClient.put(`${this.baseUrl}/${schoolId}/students/${studentId}`)
      return response.data
    } catch (error) {
      console.error(`Error adding student to school:`, error)
      throw error
    }
  }

// getImageUrl(imagePath: string): string {
//   // Vérifier si l'URL est déjà complète (commence par http:// ou https://)
//   if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
//     return imagePath;
//   }
  
//   // Sinon, construire l'URL complète
//   const baseApiUrl = "http://172.16.9.32:3000";
//   console.log('${baseApiUrl}/upload/images/${imagePath}')
  
//   return `${baseApiUrl}/upload/images/${imagePath}`;
// }



getImageUrl(imagePath: string): string
{
  // Handle null or undefined paths
  if (!imagePath) {
    console.warn("Empty image path provided")
    return ''
  }

  try {
    // Remove any leading slash from the image path
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath

    // Check if the URL is already complete (starts with http:// or https://)
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath
    }

    // Extract just the filename if it's a full path like "/images/filename.jpg"
    const filename = cleanPath.includes("/") ? cleanPath.substring(cleanPath.lastIndexOf("/") + 1) : cleanPath

    // Construct the complete URL
    const baseApiUrl = "http://172.16.9.32:3000"
    const fullUrl = `${baseApiUrl}/upload/${filename}`

    return fullUrl
  } catch (error) {
    console.error("Error formatting image URL:", error)
    return ''
  }
}





}

export const schoolService = new SchoolService()
export default schoolService

