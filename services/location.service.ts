import * as Location from "expo-location"
import { Alert } from "react-native"

class LocationService {
  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      return status === "granted"
    } catch (error) {
      console.error("Error requesting location permission:", error)
      return false
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestLocationPermission()

      if (!hasPermission) {
        Alert.alert(
          "Permission refusée",
          "Veuillez autoriser l'accès à votre position pour utiliser cette fonctionnalité.",
        )
        return null
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      return location
    } catch (error) {
      console.error("Error getting current location:", error)
      Alert.alert(
        "Erreur de localisation",
        "Impossible d'obtenir votre position actuelle. Veuillez vérifier vos paramètres de localisation.",
      )
      return null
    }
  }

  // Calculate distance between two points using the Haversine formula
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1)
    const dLon = this.deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in kilometers
    return distance
  }

  // Convert degrees to radians
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  // Format distance for display
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }
}

export const locationService = new LocationService()
export default locationService

