import type React from "react"
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import type { RootStackParamList } from "../types/navigation" // Assure-toi que ce fichier contient bien "NearbySchools"

// Définition du type pour la navigation
type NavigationProp = StackNavigationProp<RootStackParamList, "NearbySchools">

interface NearbyButtonProps {
  style?: any
}

const NearbyButton: React.FC<NearbyButtonProps> = ({ style }) => {
  const navigation = useNavigation<NavigationProp>()

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.navigate("NearbySchools")}>
      <Feather name="navigation" size={16} color="#f59e0b" />
      <Text style={styles.buttonText}>À proximité</Text>
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

export default NearbyButton
