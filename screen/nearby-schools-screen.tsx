"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import * as Location from "expo-location"
import { useNavigation } from "@react-navigation/native"
import type { School } from "../services/school.service"
import SchoolListItem from "../components/school-list-item"
import type { NearbySchoolsScreenNavigationProp} from "../types/navigation"
interface SchoolWithDistance extends School {
  distance?: number
}

const NearbySchoolsScreen = () => {
  const navigation = useNavigation<NearbySchoolsScreenNavigationProp>()

  const [schools, setSchools] = useState<SchoolWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null)
  const [locationPermission, setLocationPermission] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState(false)
  const [maxDistance, setMaxDistance] = useState(10000) // 10km default

  // Request location permissions and get user location
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== "granted") {
          setLocationPermission(false)
          setError("Permission de localisation refusée")
          setLoading(false)
          return
        }

        setLocationPermission(true)

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        setUserLocation(location)

        // Fetch schools near user location
        fetchNearbySchools(location.coords.latitude, location.coords.longitude, maxDistance)
      } catch (err) {
        console.error("Error getting location:", err)
        setError("Erreur lors de la récupération de la localisation")
        setLoading(false)
      }
    }

    getLocationPermission()
  }, [])

  // Fetch schools near a specific location
  const fetchNearbySchools = async (latitude: number, longitude: number, distance = 10000) => {
    try {
      setLoading(true)

      // Call the API endpoint for nearby schools
      const response = await fetch(
        `http://172.16.9.32:3000/schools/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${distance}`,
        {
          headers: {
            "Content-Type": "application/json",
            // Add your auth token here if needed
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Calculate and add distance to each school
      const schoolsWithDistance = data.map((school: School) => {
        const distance = calculateDistance(latitude, longitude, school.location?.latitude, school.location?.longitude)
        return { ...school, distance }
      })

      // Sort by distance
      schoolsWithDistance.sort((a: SchoolWithDistance, b: SchoolWithDistance) => {
        return (a.distance || 0) - (b.distance || 0)
      })

      setSchools(schoolsWithDistance)
      setError(null)
    } catch (err) {
      console.error("Error fetching nearby schools:", err)
      setError("Impossible de charger les écoles à proximité")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2?: number, lon2?: number): number => {
    if (!lat2 || !lon2) return 999999 // Large number for sorting if no location

    const R = 6371 // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in kilometers
    return distance
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  // Format distance for display
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }

  // Handle refresh
  const handleRefresh = () => {
    if (!userLocation) {
      Alert.alert(
        "Localisation non disponible",
        "Impossible de trouver des écoles à proximité sans accès à votre position.",
      )
      return
    }

    setRefreshing(true)
    fetchNearbySchools(userLocation.coords.latitude, userLocation.coords.longitude, maxDistance)
  }

  // Change distance filter
  const changeDistanceFilter = (distance: number) => {
    setMaxDistance(distance)
    if (userLocation) {
      fetchNearbySchools(userLocation.coords.latitude, userLocation.coords.longitude, distance)
    }
  }

  // Navigate to school detail
  const navigateToSchoolDetail = (schoolId: string) => {
    navigation.navigate("SchoolDetail", { schoolId })
  }

  // Navigate to map view
  const navigateToMap = () => {
    navigation.navigate("Map")
  }

  // Render loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Recherche des écoles à proximité...</Text>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  // Render error state
  if (error && !locationPermission && schools.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.errorContainer}>
          <Feather name="alert-triangle" size={50} color="#f59e0b" />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>
            Veuillez autoriser l'accès à votre position pour trouver les écoles à proximité.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Retour</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#f59e0b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Écoles à proximité</Text>
          <TouchableOpacity style={styles.mapButton} onPress={navigateToMap}>
            <Feather name="map" size={24} color="#f59e0b" />
          </TouchableOpacity>
        </View>

        {/* Distance Filters */}
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>Distance maximale:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, maxDistance === 1000 && styles.activeFilterButton]}
              onPress={() => changeDistanceFilter(1000)}
            >
              <Text style={[styles.filterText, maxDistance === 1000 && styles.activeFilterText]}>1 km</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, maxDistance === 5000 && styles.activeFilterButton]}
              onPress={() => changeDistanceFilter(5000)}
            >
              <Text style={[styles.filterText, maxDistance === 5000 && styles.activeFilterText]}>5 km</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, maxDistance === 10000 && styles.activeFilterButton]}
              onPress={() => changeDistanceFilter(10000)}
            >
              <Text style={[styles.filterText, maxDistance === 10000 && styles.activeFilterText]}>10 km</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, maxDistance === 20000 && styles.activeFilterButton]}
              onPress={() => changeDistanceFilter(20000)}
            >
              <Text style={[styles.filterText, maxDistance === 20000 && styles.activeFilterText]}>20 km</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schools List */}
        <FlatList
          data={schools}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <SchoolListItem
              school={item}
              distance={item.distance ? formatDistance(item.distance) : undefined}
              onPress={() => navigateToSchoolDetail(item._id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="map-pin" size={50} color="#f59e0b" />
              <Text style={styles.emptyText}>Aucune école trouvée dans un rayon de {maxDistance / 1000} km</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => changeDistanceFilter(maxDistance + 10000)}>
                <Text style={styles.emptyButtonText}>Augmenter la distance</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  mapButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  filtersLabel: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderWidth: 1,
    borderColor: "#444",
  },
  activeFilterButton: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderColor: "#f59e0b",
  },
  filterText: {
    color: "#ccc",
    fontSize: 13,
  },
  activeFilterText: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    color: "#f59e0b",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "#f59e0b",
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  retryButtonText: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  emptyButtonText: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
})

export default NearbySchoolsScreen

