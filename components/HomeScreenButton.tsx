import type React from "react"
import { TouchableOpacity, Text, StyleSheet, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { HomeScreenNavigationProp } from "../types/navigation"

interface HomeScreenButtonProps {
  title: string
  icon: keyof typeof Feather.glyphMap
  screenName: "Schools" | "Profile" | "Settings"
  description?: string
}

const HomeScreenButton: React.FC<HomeScreenButtonProps> = ({ title, icon, screenName, description }) => {
  const navigation = useNavigation<HomeScreenNavigationProp>()

  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={() => navigation.navigate(screenName)}>
      <LinearGradient colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]} style={styles.gradient}>
        <View style={styles.iconContainer}>
          <Feather name={icon} size={24} color="#f59e0b" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <Feather name="chevron-right" size={20} color="#f59e0b" />
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  description: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },
})

export default HomeScreenButton

