"use client"

import type React from "react"

import { useEffect } from "react"
import { Text, StyleSheet, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated"

interface SplashScreenProps {
  onFinish?: () => void
  timeout?: number
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, timeout = 3000 }) => {
  // Animation pour le logo
  const rotation = useSharedValue(0)
  const scale = useSharedValue(0.8)

  useEffect(() => {
    // Animation de rotation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
    )

    // Animation de pulsation
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      -1,
      true,
    )

    // Déclencher l'événement onFinish après le délai spécifié
    if (onFinish) {
      const timer = setTimeout(() => {
        onFinish()
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [rotation, scale, onFinish, timeout])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
    }
  })

  return (
    <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Text style={styles.logo}>⚔️</Text>
      </Animated.View>
      <Text style={styles.title}>Portail du Maître</Text>
      <ActivityIndicator size="large" color="#f59e0b" style={styles.loader} />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textShadowColor: "#f59e0b",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  loader: {
    marginTop: 20,
  },
})

export default SplashScreen

