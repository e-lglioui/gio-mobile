"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { SchoolsScreenNavigationProp } from "../../types/navigation"
import { type School, schoolService } from "../../services/school.service"
import { useAuth } from "../../contexts/AuthContext"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { STORAGE_KEYS } from "../../lib/supabase"

const SchoolsScreen = () => {
  const navigation = useNavigation<SchoolsScreenNavigationProp>()
  const { user, isAuthenticated, logout } = useAuth()
  const [schools, setSchools] = useState<School[]>([])
  const [filteredSchools, setFilteredSchools] = useState<School[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

 

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true)
        setError(null)

        // Debug: Check authentication status
        console.log("User authenticated:", isAuthenticated)
        console.log("Current user:", user?.id)

        // Check if token exists before making the request
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        if (!token) {
          setError("Vous n'êtes pas authentifié. Veuillez vous reconnecter.")
          setLoading(false)
          return
        }

        const data = await schoolService.getAllSchools()
        setSchools(data)
        setFilteredSchools(data)
      } catch (error: any) {
        console.error("Erreur lors de la récupération des écoles:", error)

        // Handle 401 errors specifically
        if (error.response && error.response.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.")
          // Optionally force logout
          logout()
        } else {
          setError("Impossible de charger les écoles. Veuillez réessayer.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSchools()
  }, [isAuthenticated, user])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSchools(schools)
    } else {
      const filtered = schools.filter(
        (school) =>
          school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          school.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredSchools(filtered)
    }
  }, [searchQuery, schools])

  const renderSchoolItem = ({ item }: { item: School }) => (
    <TouchableOpacity
      style={styles.schoolCard}
      onPress={() => navigation.navigate("SchoolDetail", { schoolId: item._id })}
    >
      <View style={styles.schoolImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            style={styles.schoolImage}
            defaultSource={require("../../assets/images/default-school.jpg")}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="home" size={40} color="#f59e0b" />
          </View>
        )}
        <View style={styles.studentCountBadge}>
          <Text style={styles.studentCountText}>{item.dashboard?.studentCount || 0} étudiants</Text>
        </View>
      </View>

      <View style={styles.schoolInfo}>
        <Text style={styles.schoolName}>{item.name}</Text>
        <View style={styles.infoRow}>
          <Feather name="map-pin" size={14} color="#f59e0b" />
          <Text style={styles.schoolAddress}>{item.address}</Text>
        </View>

        {item.contactNumber && (
          <View style={styles.infoRow}>
            <Feather name="phone" size={14} color="#f59e0b" />
            <Text style={styles.schoolContact}>{item.contactNumber}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Feather name="clock" size={14} color="#f59e0b" />
          <Text style={styles.schoolHours}>
            {item.schedule?.openingTime || "08:00"} - {item.schedule?.closingTime || "18:00"}
          </Text>
        </View>

        {item.description && (
          <Text style={styles.schoolDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.background}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une école..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
         
          <TouchableOpacity style={styles.filterButton}>
            <Feather name="filter" size={16} color="#f59e0b" />
            <Text style={styles.filterText}>Filtrer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Feather name="map" size={16} color="#f59e0b" />
            <Text style={styles.filterText}>Carte</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={50} color="#f59e0b" />
            <Text style={styles.errorText}>{error}</Text>
            {!isAuthenticated && (
              <TouchableOpacity style={styles.retryButton} onPress={() => navigation.navigate("Login")}>
                <Text style={styles.retryButtonText}>Se reconnecter</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredSchools}
            renderItem={renderSchoolItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="alert-circle" size={50} color="#f59e0b" />
                <Text style={styles.emptyText}>Aucune école trouvée</Text>
              </View>
            }
          />
        )}
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
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#444",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 16,
    justifyContent: "flex-end",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  filterText: {
    color: "#f59e0b",
    marginLeft: 6,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  schoolCard: {
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#444",
  },
  schoolImageContainer: {
    position: "relative",
    height: 150,
  },
  schoolImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  studentCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  studentCountText: {
    color: "#f59e0b",
    fontSize: 12,
    fontWeight: "bold",
  },
  schoolInfo: {
    padding: 12,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "#f59e0b",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  schoolAddress: {
    color: "#ccc",
    marginLeft: 6,
    fontSize: 14,
  },
  schoolContact: {
    color: "#ccc",
    marginLeft: 6,
    fontSize: 14,
  },
  schoolHours: {
    color: "#ccc",
    marginLeft: 6,
    fontSize: 14,
  },
  schoolDescription: {
    color: "#aaa",
    marginTop: 8,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  errorText: {
    color: "#f59e0b",
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
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
})

export default SchoolsScreen

