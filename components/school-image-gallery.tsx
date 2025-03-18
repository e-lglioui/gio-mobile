"use client"

import type React from "react"
import { useState } from "react"
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { schoolService } from "../services/school.service"

interface SchoolImageGalleryProps {
  images: string[] | undefined
  defaultImage: any
  onImagePress?: (index: number) => void
}

const { width } = Dimensions.get("window")

const SchoolImageGallery: React.FC<SchoolImageGalleryProps> = ({ images, defaultImage, onImagePress }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({})
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({})

  // Handle case where images is undefined or empty
  const hasImages = images && images.length > 0

  // Handle scroll events to update active index
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset
    const viewSize = event.nativeEvent.layoutMeasurement
    const newIndex = Math.floor(contentOffset.x / viewSize.width)
    setActiveIndex(newIndex)
  }

  // Handle image loading state
  const setLoading = (index: number, isLoading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [index]: isLoading }))
  }

  // Handle image error state
  const setError = (index: number, hasError: boolean) => {
    setErrorStates((prev) => ({ ...prev, [index]: hasError }))
  }

  // If no images, show default image
  if (!hasImages) {
    return (
      <View style={styles.container}>
        <Image source={defaultImage} style={styles.image} />
        <View style={styles.noImagesOverlay}>
          <Feather name="image" size={40} color="#f59e0b" />
          <Text style={styles.noImagesText}>Aucune image disponible</Text>
        </View>
      </View>
    )
  }

  // If single image, show it without gallery controls
  if (images.length === 1) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: schoolService.getImageUrl(images[0]) }}
          defaultSource={defaultImage}
          style={styles.image}
          onLoadStart={() => setLoading(0, true)}
          onLoadEnd={() => setLoading(0, false)}
          onError={() => {
            console.error("Error loading image:", images[0])
            setError(0, true)
            setLoading(0, false)
          }}
        />

        {loadingStates[0] && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        )}

        {errorStates[0] && <Image source={defaultImage} style={styles.image} />}
      </View>
    )
  }

  // Multiple images - show gallery with pagination
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={onImagePress ? 0.8 : 1}
            onPress={() => onImagePress && onImagePress(index)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: schoolService.getImageUrl(image) }}
              defaultSource={defaultImage}
              style={styles.image}
              onLoadStart={() => setLoading(index, true)}
              onLoadEnd={() => setLoading(index, false)}
              onError={() => {
                console.error("Error loading image:", image)
                setError(index, true)
                setLoading(index, false)
              }}
            />

            {loadingStates[index] && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#f59e0b" />
              </View>
            )}

            {errorStates[index] && <Image source={defaultImage} style={styles.image} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination indicators */}
      {images.length > 1 && (
        <View style={styles.pagination}>
          {images.map((_, index) => (
            <View key={index} style={[styles.paginationDot, index === activeIndex && styles.paginationDotActive]} />
          ))}
        </View>
      )}

      {/* Image counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {activeIndex + 1} / {images.length}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  imageContainer: {
    width,
    height: 250,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  pagination: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#f59e0b",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  counter: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  counterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  noImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  noImagesText: {
    color: "#f59e0b",
    marginTop: 10,
    fontSize: 16,
  },
})

export default SchoolImageGallery

