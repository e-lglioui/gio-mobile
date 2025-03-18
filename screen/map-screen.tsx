"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  SafeAreaView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import MapView, { Marker, Callout, PROVIDER_GOOGLE, type Region } from "react-native-maps"
import * as Location from "expo-location"
import { useNavigation } from "@react-navigation/native"
import { type School, schoolService } from "../services/school.service"
import SchoolMapCard from "../components/school-map-card"
import { useAuth } from "../contexts/AuthContext"
import type { MapScreenNavigationProp  } from "../types/navigation"
const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

const MapScreen = () => {
   const navigation = useNavigation<MapScreenNavigationProp >()
  const { isAuthenticated } = useAuth()
  const mapRef = useRef<MapView>(null)

  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null)
  const [locationPermission, setLocationPermission] = useState<boolean>(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [initialRegion, setInitialRegion] = useState<Region>({
    latitude: 48.8566, // Default to Paris
    longitude: 2.3522,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  })

  // Request location permissions and get user location
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== "granted") {
          setLocationPermission(false)
          setError("Permission de localisation refusée")
          // Load schools without user location
          fetchSchools()
          return
        }

        setLocationPermission(true)

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })

        setUserLocation(location)
        setInitialRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        })

        // Fetch schools near user location
        fetchNearbySchools(location.coords.latitude, location.coords.longitude)
      } catch (err) {
        console.error("Error getting location:", err)
        setError("Erreur lors de la récupération de la localisation")
        // Load all schools as fallback
        fetchSchools()
      }
    }

    getLocationPermission()
  }, [])

  // Fetch all schools for map
  const fetchSchools = async () => {
    try {
      setLoading(true)
      const data = await schoolService.getAllSchools()

      // Filter schools that have location data
      const schoolsWithLocation = data.filter(
        (school) =>
          school.location &&
          typeof school.location.latitude === "number" &&
          typeof school.location.longitude === "number",
      )

      setSchools(schoolsWithLocation)
      setError(null)
    } catch (err) {
      console.error("Error fetching schools:", err)
      setError("Impossible de charger les écoles")
    } finally {
      setLoading(false)
    }
  }

  // Fetch schools near a specific location
  const fetchNearbySchools = async (latitude: number, longitude: number, maxDistance = 10000) => {
    try {
      setLoading(true)

      // Call the API endpoint for nearby schools
      const response = await fetch(
        `http://172.16.9.32:3000/schools/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=${maxDistance}`,
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
      setSchools(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching nearby schools:", err)
      setError("Impossible de charger les écoles à proximité")
      // Fallback to all schools
      fetchSchools()
    } finally {
      setLoading(false)
    }
  }

  // Center map on user location
  const centerOnUserLocation = () => {
    if (!userLocation || !mapRef.current) return

    mapRef.current.animateToRegion(
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      },
      1000,
    )
  }

  // Handle marker press
  const handleMarkerPress = (school: School) => {
    setSelectedSchool(school)
  }

  // Navigate to school detail
  const navigateToSchoolDetail = (schoolId: string) => {
    navigation.navigate("SchoolDetail", { schoolId })
  }

  // Handle map ready event
  const onMapReady = () => {
    setMapReady(true)
  }

  // Render loading state
  if (loading && !mapReady) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Chargement de la carte...</Text>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation={locationPermission}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          onMapReady={onMapReady}
        >
          {schools.map((school) => (
            <Marker
              key={school._id}
              coordinate={{
                latitude: school.location?.latitude || 0,
                longitude: school.location?.longitude || 0,
              }}
              title={school.name}
              description={school.address}
              onPress={() => handleMarkerPress(school)}
            >
              <View style={styles.customMarker}>
                <View style={styles.markerIconContainer}>
                  <Feather name="home" size={16} color="#fff" />
                </View>
                <View style={styles.markerTriangle} />
              </View>

              <Callout tooltip onPress={() => navigateToSchoolDetail(school._id)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{school.name}</Text>
                  <Text style={styles.calloutAddress}>{school.address}</Text>
                  <Text style={styles.calloutStudents}>{school.dashboard?.studentCount || 0} étudiants</Text>
                  <Text style={styles.calloutAction}>Appuyez pour voir les détails</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={20} color="#f59e0b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={centerOnUserLocation} disabled={!locationPermission}>
            <Feather name="navigation" size={20} color={locationPermission ? "#f59e0b" : "#666"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              if (userLocation) {
                fetchNearbySchools(userLocation.coords.latitude, userLocation.coords.longitude)
              } else {
                Alert.alert(
                  "Localisation non disponible",
                  "Impossible de trouver des écoles à proximité sans accès à votre position.",
                )
              }
            }}
            disabled={!locationPermission}
          >
            <Feather name="refresh-cw" size={20} color={locationPermission ? "#f59e0b" : "#666"} />
          </TouchableOpacity>
        </View>

        {/* Selected School Card */}
        {selectedSchool && (
          <View style={styles.selectedSchoolContainer}>
            <SchoolMapCard
              school={selectedSchool}
              onPress={() => navigateToSchoolDetail(selectedSchool._id)}
              onClose={() => setSelectedSchool(null)}
            />
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#f59e0b",
    marginTop: 10,
    fontSize: 16,
  },
  mapControls: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "column",
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  customMarker: {
    alignItems: "center",
  },
  markerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#f59e0b",
    alignSelf: "center",
    marginTop: -2,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  calloutTitle: {
    color: "#f59e0b",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  calloutAddress: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 4,
  },
  calloutStudents: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 6,
  },
  calloutAction: {
    color: "#f59e0b",
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
  selectedSchoolContainer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
  },
  errorContainer: {
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  errorText: {
    color: "#f59e0b",
    textAlign: "center",
  },
})

export default MapScreen

