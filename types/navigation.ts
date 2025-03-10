import type { StackNavigationProp } from "@react-navigation/stack"
import type { RouteProp } from "@react-navigation/native"

// Types pour la navigation globale
export type RootStackParamList = {
  Splash: undefined
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  Home: undefined
  Profile: undefined
  Settings: undefined
  Schools: undefined
  SchoolDetail: { schoolId: string }
}

// Types pour chaque écran
export type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, "Splash">
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, "Login">
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, "Register">
export type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, "ForgotPassword">
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">
export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, "Profile">
export type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Settings">
export type SchoolsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Schools">
export type SchoolDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, "SchoolDetail">

// Route props types
export type SchoolDetailScreenRouteProp = RouteProp<RootStackParamList, "SchoolDetail">

// Interface pour les props de navigation
export interface NavigationProps {
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>
}

