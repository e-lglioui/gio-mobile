import type React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation" // Vérifie ce chemin

// Définition du type de navigation
type NavigationProp = StackNavigationProp<RootStackParamList, "Map">

interface MapButtonProps {
  style?: any
}

const MapButton: React.FC<MapButtonProps> = ({ style }) => {
  // Utilisation du useNavigation avec le bon type
  const navigation = useNavigation<NavigationProp>()

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate("Map")}>
      <Feather name="map" size={16} color="#f59e0b" />
      <Text style={styles.buttonText}>Carte</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#444",
  },
  buttonText: {
    color: "#f59e0b",
    marginLeft: 6,
    fontSize: 14,
  },
})

export default MapButton
