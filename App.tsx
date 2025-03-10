import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "./contexts/AuthContext"
import LoginScreen from "./screen/Auth/loginScreen"
import RegisterScreen from "./screen/Auth/RegisterScreen"
import HomeScreen from "./screen/HomeScreen"
import ForgotPasswordScreen from "./screen/Auth/ForgotPasswordScreen"
import SplashScreen from "./screen/Auth/SplashScreen"
import SchoolsScreen from "./screen/schools/SchoolsScreen"
import SchoolDetailScreen from "./screen/schools/SchoolDetailScreen"
import ProfileScreen from "./screen/ProfileScreen"
import { useAuth } from "./contexts/AuthContext"
import type { RootStackParamList } from "./types/navigation"

const Stack = createStackNavigator<RootStackParamList>()

// Composant de navigation qui gère les routes en fonction de l'état d'authentification
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    // Afficher un écran de chargement pendant la vérification de l'authentification
    return <SplashScreen />
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          // Routes pour les utilisateurs authentifiés
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Schools" component={SchoolsScreen} />
            <Stack.Screen name="SchoolDetail" component={SchoolDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          // Routes pour les utilisateurs non authentifiés
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  )
}

