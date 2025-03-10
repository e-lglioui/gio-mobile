"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "expo-status-bar"
import * as Yup from "yup"
import { Formik } from "formik"
import type { StackNavigationProp } from "@react-navigation/stack"
import { useAuth } from "../../contexts/AuthContext"

// Types pour la navigation
type RootStackParamList = {
  Login: undefined
  ForgotPassword: undefined
}

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, "ForgotPassword">

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp
}

// Interface pour les valeurs du formulaire
interface ForgotPasswordFormValues {
  email: string
}

// Schéma de validation
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Adresse email invalide").required("Email requis"),
})

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  // Utiliser le contexte d'authentification
  const { forgotPassword, error: authError, clearError } = useAuth()

  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // Nettoyer les erreurs lors du montage et démontage du composant
  useEffect(() => {
    clearError()
    return () => clearError()
  }, [clearError])

  const handleForgotPassword = async (
    values: ForgotPasswordFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    try {
      setMessage(null)
      setLocalError(null)

      await forgotPassword(values.email)

      setIsSuccess(true)
      setMessage("Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation.")
    } catch (error: any) {
      setIsSuccess(false)
      setLocalError(error.message || "Une erreur est survenue. Veuillez réessayer plus tard.")
    } finally {
      setSubmitting(false)
    }
  }

  // Afficher l'erreur du contexte ou l'erreur locale
  const displayError = authError || localError

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ImageBackground source={require("../../assets/images/login.jpg")} style={styles.backgroundImage}>
        <LinearGradient colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)"]} style={styles.overlay}>
          <StatusBar style="light" />
          <View style={styles.formContainer}>
            <Text style={styles.title}>Récupération du Mantra</Text>
            <Text style={styles.subtitle}>Entrez votre email pour réinitialiser votre mot de passe</Text>

            {message && (
              <Text style={[styles.message, isSuccess ? styles.successMessage : styles.errorMessage]}>{message}</Text>
            )}

            {displayError && <Text style={styles.errorMessage}>{displayError}</Text>}

            <Formik
              initialValues={{ email: "" }}
              validationSchema={forgotPasswordSchema}
              onSubmit={handleForgotPassword}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Entrez votre email"
                      placeholderTextColor="#666"
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      value={values.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  <TouchableOpacity style={styles.button} onPress={() => handleSubmit()} disabled={isSubmitting}>
                    <LinearGradient
                      colors={["#f59e0b", "#ef4444", "#f59e0b"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      {isSubmitting ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#fff" />
                          <Text style={styles.buttonText}>Envoi...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Réinitialiser</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.backText}>Retour à la connexion</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "#f59e0b",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 30,
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
  },
  successMessage: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
  },
  errorMessage: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
  },
  input: {
    backgroundColor: "rgba(45, 45, 45, 0.5)",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
  },
  button: {
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 8,
  },
  gradientButton: {
    padding: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  backLink: {
    marginTop: 20,
  },
  backText: {
    color: "#f59e0b",
    textAlign: "center",
    fontSize: 14,
  },
})

export default ForgotPasswordScreen

