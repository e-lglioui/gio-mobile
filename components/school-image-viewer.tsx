"use client"

import type React from "react"
import { useState } from "react"
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { schoolService } from "../services/school.service"

interface SchoolImageViewerProps {
  images: string[]
  initialIndex: number
  visible: boolean
  onClose: () => void
}

const { width, height } = Dimensions.get("window")

const SchoolImageViewer: React.FC<SchoolImageViewerProps> = ({ images, initialIndex, visible, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [loading, setLoading] = useState(true)

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setLoading(true)
    }
  }

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setLoading(true)
    }
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={styles.container}>
        <Image
          source={{ uri: schoolService.getImageUrl(images[currentIndex]) }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        )}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>

        {currentIndex > 0 && (
          <TouchableOpacity style={styles.navButtonLeft} onPress={goToPrevious}>
            <Feather name="chevron-left" size={40} color="#fff" />
          </TouchableOpacity>
        )}

        {currentIndex < images.length - 1 && (
          <TouchableOpacity style={styles.navButtonRight} onPress={goToNext}>
            <Feather name="chevron-right" size={40} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={styles.counter}>
          <Feather name="image" size={16} color="#fff" style={styles.counterIcon} />
          <View style={styles.counterTextContainer}>
            <View style={styles.counterTextBackground}>
              <View style={[styles.counterProgress, { width: `${((currentIndex + 1) / images.length) * 100}%` }]} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width,
    height: height * 0.8,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonLeft: {
    position: "absolute",
    left: 10,
    height: 80,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navButtonRight: {
    position: "absolute",
    right: 10,
    height: 80,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  counter: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: width * 0.8,
  },
  counterIcon: {
    marginRight: 10,
  },
  counterTextContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  counterTextBackground: {
    flex: 1,
    borderRadius: 2,
    overflow: "hidden",
  },
  counterProgress: {
    height: "100%",
    backgroundColor: "#f59e0b",
  },
})

export default SchoolImageViewer

