import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAuth } from "../contexts/AuthContext"
import HomeScreenButton from "../components/HomeScreenButton"

const HomeScreen = () => {
  const { user } = useAuth()

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.background}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Bonjour, {user?.name || "Maître"}</Text>
            <Text style={styles.subtitle}>Bienvenue dans votre espace martial</Text>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Gestion des écoles</Text>

            <HomeScreenButton title="Écoles" icon="home" screenName="Schools" description="Gérer vos écoles et dojos" />

            <HomeScreenButton
              title="Profil"
              icon="user"
              screenName="Profile"
              description="Voir et modifier votre profil"
            />

            <HomeScreenButton
              title="Paramètres"
              icon="settings"
              screenName="Settings"
              description="Configurer votre application"
            />
          </View>
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
  header: {
    padding: 20,
    marginTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textShadowColor: "#f59e0b",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
  },
  menuSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f59e0b",
    marginBottom: 16,
  },
})

export default HomeScreen

