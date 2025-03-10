"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  SafeAreaView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated"
import { useRoute, useNavigation } from "@react-navigation/native"
import type { SchoolDetailScreenRouteProp, SchoolDetailScreenNavigationProp } from "../../types/navigation"
import { type School, schoolService } from "../../services/school.service"

const SchoolDetailScreen: React.FC = () => {
  const route = useRoute<SchoolDetailScreenRouteProp>()
  const navigation = useNavigation<SchoolDetailScreenNavigationProp>()
  const { schoolId } = route.params
  const [school, setSchool] = useState<School | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("info") // info, students, instructors, classes

  // Animation values
  const scale = useSharedValue(0.95)
  const opacity = useSharedValue(0)
  const scrollY = useSharedValue(0)

  // Fetch school data
  useEffect(() => {
    const fetchSchoolDetail = async () => {
      try {
        setLoading(true)
        const data = await schoolService.getSchoolById(schoolId)
        setSchool(data)
        setError(null)
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'école:", error)
        setError("Impossible de charger les détails de l'école. Veuillez réessayer.")
      } finally {
        setLoading(false)
      }
    }

    fetchSchoolDetail()
  }, [schoolId])

  // Animation setup
  useEffect(() => {
    // Pulse animation for energy circle
    scale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 2000 }), withTiming(0.95, { duration: 2000 })),
      -1,
      true,
    )

    // Fade in animation
    opacity.value = withTiming(0.3, { duration: 1000 })

    return () => {
      // Clean up animations if needed
    }
  }, [scale, opacity])

  // Animation styles
  const energyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerOpacity = interpolate(scrollY.value, [0, 100], [0, 1], Extrapolation.CLAMP)

    return {
      opacity: headerOpacity,
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, 100], [-20, 0], Extrapolation.CLAMP),
        },
      ],
    }
  })

  // Handle scroll events
  const handleScroll = (event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y
  }

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.loadingContainer}>
          <Animated.View style={[styles.energyCircle, energyStyle]} />
          <Text style={styles.loadingText}>Chargement du temple...</Text>
          <ActivityIndicator size="large" color="#f59e0b" />
        </LinearGradient>
      </SafeAreaView>
    )
  }

  // Render error state
  if (error || !school) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.errorContainer}>
          <Feather name="alert-triangle" size={50} color="#f59e0b" />
          <Text style={styles.errorText}>{error || "École non trouvée"}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Retour aux écoles</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  // Format operating days
  const formatOperatingDays = (days: string[]) => {
    if (!days || days.length === 0) return "Non spécifié"
    return days.join(", ")
  }

  // Render main content
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.background}>
        {/* Animated energy circle */}
        <Animated.View style={[styles.energyCircle, energyStyle]} />

        {/* Animated header for scrolling */}
        <Animated.View style={[styles.animatedHeader, headerAnimatedStyle]}>
          <LinearGradient colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)"]} style={styles.headerGradient}>
            <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="#f59e0b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{school.name}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Main content scroll view */}
        <ScrollView style={styles.scrollView} onScroll={handleScroll} scrollEventThrottle={16}>
          {/* School hero image */}
          <View style={styles.imageContainer}>
            {school.images && school.images.length > 0 ? (
              <ImageBackground
                source={{ uri: school.images[0] }}
                style={styles.heroImage}
                defaultSource={require("../../assets/images/default-school.jpg")}
              >
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.9)"]} style={styles.imageGradient}>
                  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Feather name="arrow-left" size={24} color="#fff" />
                  </TouchableOpacity>

                  <View style={styles.schoolInfoOverlay}>
                    <Text style={styles.schoolName}>{school.name}</Text>
                    <View style={styles.infoRow}>
                      <Feather name="map-pin" size={14} color="#f59e0b" />
                      <Text style={styles.schoolAddress}>{school.address}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            ) : (
              <View style={styles.fallbackImage}>
                <Feather name="home" size={60} color="#f59e0b" />
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.schoolInfoOverlay}>
                  <Text style={styles.schoolName}>{school.name}</Text>
                  <View style={styles.infoRow}>
                    <Feather name="map-pin" size={14} color="#f59e0b" />
                    <Text style={styles.schoolAddress}>{school.address}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Dashboard stats */}
          <View style={styles.dashboardContainer}>
            <View style={styles.statCard}>
              <Feather name="users" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{school.dashboard?.studentCount || 0}</Text>
              <Text style={styles.statLabel}>Étudiants</Text>
            </View>

            <View style={styles.statCard}>
              <Feather name="award" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{school.dashboard?.instructorCount || 0}</Text>
              <Text style={styles.statLabel}>Maîtres</Text>
            </View>

            <View style={styles.statCard}>
              <Feather name="calendar" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{school.dashboard?.classCount || 0}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
          </View>

          {/* Navigation tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "info" && styles.activeTab]}
              onPress={() => setActiveTab("info")}
            >
              <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "students" && styles.activeTab]}
              onPress={() => setActiveTab("students")}
            >
              <Text style={[styles.tabText, activeTab === "students" && styles.activeTabText]}>Étudiants</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "instructors" && styles.activeTab]}
              onPress={() => setActiveTab("instructors")}
            >
              <Text style={[styles.tabText, activeTab === "instructors" && styles.activeTabText]}>Maîtres</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "classes" && styles.activeTab]}
              onPress={() => setActiveTab("classes")}
            >
              <Text style={[styles.tabText, activeTab === "classes" && styles.activeTabText]}>Classes</Text>
            </TouchableOpacity>
          </View>

          {/* Tab content */}
          <View style={styles.tabContent}>
            {activeTab === "info" && (
              <View>
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{school.description || "Aucune description disponible."}</Text>
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Horaires</Text>
                  <View style={styles.scheduleCard}>
                    <View style={styles.scheduleRow}>
                      <Feather name="clock" size={16} color="#f59e0b" />
                      <Text style={styles.scheduleText}>
                        {school.schedule?.openingTime || "08:00"} - {school.schedule?.closingTime || "18:00"}
                      </Text>
                    </View>

                    <View style={styles.scheduleRow}>
                      <Feather name="calendar" size={16} color="#f59e0b" />
                      <Text style={styles.scheduleText}>
                        {formatOperatingDays(school.schedule?.operatingDays || [])}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Contact</Text>
                  <TouchableOpacity style={styles.contactButton}>
                    <LinearGradient
                      colors={["#f59e0b", "#ef4444", "#f59e0b"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.contactGradient}
                    >
                      <Feather name="phone" size={16} color="#fff" />
                      <Text style={styles.contactButtonText}>{school.contactNumber || "Non spécifié"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {school.martialArts && school.martialArts.length > 0 && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Arts Martiaux Enseignés</Text>
                    <View style={styles.stylesList}>
                      {school.martialArts.map((style, index) => (
                        <View key={index} style={styles.styleChip}>
                          <Text style={styles.styleChipText}>{style}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {activeTab === "students" && (
              <View style={styles.sectionContainer}>
                <View style={styles.headerWithButton}>
                  <Text style={styles.sectionTitle}>Étudiants</Text>
                </View>

                {school.students && school.students.length > 0 ? (
                  <Text style={styles.placeholder}>Liste des étudiants à implémenter</Text>
                ) : (
                  <View style={styles.emptyState}>
                    <Feather name="users" size={40} color="#444" />
                    <Text style={styles.emptyStateText}>Aucun étudiant inscrit</Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === "instructors" && (
              <View style={styles.sectionContainer}>
                <View style={styles.headerWithButton}>
                  <Text style={styles.sectionTitle}>Maîtres</Text>
                </View>

                {school.instructors && school.instructors.length > 0 ? (
                  <Text style={styles.placeholder}>Liste des maîtres à implémenter</Text>
                ) : (
                  <View style={styles.emptyState}>
                    <Feather name="award" size={40} color="#444" />
                    <Text style={styles.emptyStateText}>Aucun maître assigné</Text>
                  </View>
                )}
              </View>
            )}

            {activeTab === "classes" && (
              <View style={styles.sectionContainer}>
                <View style={styles.headerWithButton}>
                  <Text style={styles.sectionTitle}>Classes</Text>
                </View>

                <View style={styles.emptyState}>
                  <Feather name="calendar" size={40} color="#444" />
                  <Text style={styles.emptyStateText}>Aucune classe programmée</Text>
                </View>
              </View>
            )}
          </View>

        

          {/* Footer space */}
          <View style={styles.footer} />
        </ScrollView>
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
  },
  scrollView: {
    flex: 1,
  },
  energyCircle: {
    position: "absolute",
    width: Dimensions.get("window").width * 2,
    height: Dimensions.get("window").width * 2,
    borderRadius: Dimensions.get("window").width,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    top: -Dimensions.get("window").width,
    left: -Dimensions.get("window").width / 2,
    zIndex: -1,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 60,
  },
  headerGradient: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    textShadowColor: "#f59e0b",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  backArrow: {
    padding: 4,
  },
  imageContainer: {
    width: "100%",
    height: 250,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  fallbackImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  schoolInfoOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  schoolName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  schoolAddress: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dashboardContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 8,
    margin: 16,
    marginTop: -40,
    elevation: 5,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  statNumber: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: {
    color: "#aaa",
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "rgba(245, 158, 11, 0.3)",
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
  },
  tabText: {
    color: "#aaa",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#f59e0b",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    color: "#ddd",
    fontSize: 15,
    lineHeight: 22,
  },
  scheduleCard: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
    padding: 16,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scheduleText: {
    color: "#ddd",
    marginLeft: 12,
    fontSize: 15,
  },
  contactButton: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  contactGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  stylesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  styleChip: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.5)",
  },
  styleChipText: {
    color: "#f59e0b",
    fontWeight: "500",
  },
  headerWithButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  addButtonText: {
    color: "#f59e0b",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 8,
  },
  emptyStateText: {
    color: "#666",
    marginTop: 12,
    fontSize: 16,
  },
  placeholder: {
    color: "#aaa",
    padding: 20,
    textAlign: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  actionGradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
  footer: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    color: "#f59e0b",
    fontSize: 18,
    marginBottom: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    color: "#f59e0b",
    fontSize: 16,
    marginVertical: 16,
    textAlign: "center",
  },
})

export default SchoolDetailScreen;