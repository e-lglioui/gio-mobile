import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Feather } from "@expo/vector-icons"
import { type School, schoolService } from "../services/school.service"

interface SchoolListItemProps {
  school: School
  distance?: string
  onPress: () => void
}

const SchoolListItem: React.FC<SchoolListItemProps> = ({ school, distance, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
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

          {distance && (
            <View style={styles.distanceBadge}>
              <Feather name="navigation" size={10} color="#fff" />
              <Text style={styles.distanceText}>{distance}</Text>
            </View>
          )}
        </View>
      </View>

      <Feather name="chevron-right" size={20} color="#666" style={styles.chevron} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#444",
  },
  imageContainer: {
    width: 70,
    height: 70,
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
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  distanceText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 3,
  },
  chevron: {
    alignSelf: "center",
    marginLeft: 8,
  },
})

export default SchoolListItem

