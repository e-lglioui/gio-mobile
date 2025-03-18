import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { type School, schoolService } from "../services/school.service"

interface SchoolMapCardProps {
  school: School
  onPress: () => void
  onClose: () => void
}

const SchoolMapCard: React.FC<SchoolMapCardProps> = ({ school, onPress, onClose }) => {
  // Format distance if available
  const formatDistance = (distance?: number) => {
    if (!distance) return null

    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`
    }
    return `${distance.toFixed(1)} km`
  }

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9} onPress={onPress}>
      <LinearGradient colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0.9)"]} style={styles.cardGradient}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Feather name="x" size={16} color="#f59e0b" />
        </TouchableOpacity>

        <View style={styles.cardContent}>
          {/* School Image */}
          <View style={styles.imageContainer}>
            {school.images && school.images.length > 0 ? (
              <Image
                source={{ uri: schoolService.getImageUrl(school.images[0]) }}
                style={styles.image}
                defaultSource={require("../assets/images/default-school.jpg")}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="home" size={24} color="#f59e0b" />
              </View>
            )}
          </View>

          {/* School Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.schoolName} numberOfLines={1}>
              {school.name}
            </Text>

            <View style={styles.infoRow}>
              <Feather name="map-pin" size={12} color="#f59e0b" />
              <Text style={styles.schoolAddress} numberOfLines={1}>
                {school.address}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="users" size={12} color="#f59e0b" />
                <Text style={styles.statText}>{school.dashboard?.studentCount || 0} étudiants</Text>
              </View>

              {school.distance && (
                <View style={styles.statItem}>
                  <Feather name="navigation" size={12} color="#f59e0b" />
                  <Text style={styles.statText}>{formatDistance(school.distance)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.viewDetailsText}>Appuyez pour voir les détails</Text>
          <Feather name="chevron-right" size={16} color="#f59e0b" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  schoolName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  schoolAddress: {
    color: "#ccc",
    fontSize: 12,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    color: "#ccc",
    fontSize: 12,
    marginLeft: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingVertical: 8,
  },
  viewDetailsText: {
    color: "#f59e0b",
    fontSize: 12,
    marginRight: 4,
  },
})

export default SchoolMapCard

