"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, RefreshControl } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedScrollHandler } from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import type { ProfileScreenNavigationProp } from "../types/navigation"
import { useAuth } from "../contexts/AuthContext"
import type { Student } from "../types/student"
import { profileService } from "../services/profile.service"

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>()
  const { user } = useAuth()
  const [studentProfile, setStudentProfile] = useState<Student | null>(null)
  const [studentProgress, setStudentProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("info")

  // Animation values
  const scale = useSharedValue(0.95)
  const opacity = useSharedValue(0)
  const scrollY = useSharedValue(0)
  const progressAnimation = useSharedValue(0)

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const studentId = user?.id || "mock-student-id"
      const profileData = await profileService.getStudentProfile(studentId)
      const progressData = await profileService.getStudentProgress(studentId)
      setStudentProfile(profileData)
      setStudentProgress(progressData)
    } catch (error) {
      console.error("Erreur lors de la récupération des données du profil:", error)
      setError("Impossible de charger les informations du profil. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchProfileData()
    setRefreshing(false)
  }, [fetchProfileData])

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  // ... (rest of the component remains the same)

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.errorContainer}>
          <Feather name="alert-triangle" size={50} color="#f59e0b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.background}>
        <Animated.ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
        >
          {/* Add your profile content here, using studentProfile and studentProgress data */}
        </Animated.ScrollView>
      </LinearGradient>
    </SafeAreaView>
  )
}

// ... (styles remain the same)

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#f59e0b",
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#f59e0b",
    marginTop: 10,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.5)",
    marginTop: 20,
  },
  retryButtonText: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
})

export default ProfileScreen

