import React, { useState, useEffect, useCallback, memo } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as Yup from "yup";
import { Formik } from "formik";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import type { RegisterScreenNavigationProp } from "../../types/navigation";

// Interface for form values
interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Initial form values
const initialValues: RegisterFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// Validation schema using Yup
const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .required("Nom requis"),
  email: Yup.string()
    .email("Adresse email invalide")
    .required("Email requis"),
  password: Yup.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .matches(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .matches(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .required("Mot de passe requis"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("Confirmation du mot de passe requise"),
});

// Memoized input component for better performance
const FormInput = memo(({ 
  label, 
  error, 
  touched, 
  ...props 
}: { 
  label: string;
  error?: string;
  touched?: boolean;
  [key: string]: any;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor="#666"
      {...props}
    />
    {touched && error && <Text style={styles.errorText}>{error}</Text>}
  </View>
));

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, error: authError, clearError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors on mount and unmount
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  // Handle register submission
  const handleRegister = useCallback(async (
    values: RegisterFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    setLocalError(null);

    try {
      await register(values.username, values.email, values.password);
      // Registration successful, navigate to login page
      navigation.navigate("Login");
    } catch (error: any) {
      setLocalError(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  }, [register, navigation]);

  // Display either context error or local error
  const displayError = authError || localError;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground 
        source={require("../../assets/images/login.jpg")} 
        style={styles.container}
      >
        <StatusBar style="light" />
        <LinearGradient 
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.8)"]} 
          style={styles.overlay}
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Commencez Votre Voyage</Text>
            <Text style={styles.subtitle}>Rejoignez le temple et maîtrisez votre voie</Text>

            {displayError && <Text style={styles.apiError}>{displayError}</Text>}

            <Formik
              initialValues={initialValues}
              validationSchema={registerSchema}
              onSubmit={handleRegister}
            >
              {({ 
                handleChange, 
                handleBlur, 
                handleSubmit, 
                values, 
                errors, 
                touched, 
                isSubmitting 
              }) => (
                <View style={styles.form}>
                  <FormInput
                    label="Nom du Guerrier"
                    placeholder="Entrez votre nom"
                    onChangeText={handleChange("username")}
                    onBlur={handleBlur("username")}
                    value={values.username}
                    error={errors.username}
                    touched={touched.username}
                  />

                  <FormInput
                    label="Parchemin Sacré (Email)"
                    placeholder="Entrez votre email"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                    touched={touched.email}
                  />

                  <FormInput
                    label="Mantra Secret (Mot de passe)"
                    placeholder="Créez votre mot de passe"
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    secureTextEntry
                    error={errors.password}
                    touched={touched.password}
                  />

                  <FormInput
                    label="Confirmez le Mantra Secret"
                    placeholder="Confirmez votre mot de passe"
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    value={values.confirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                  />

                  <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => handleSubmit()} 
                    disabled={isSubmitting}
                  >
                    <LinearGradient
                      colors={["#f59e0b", "#ef4444", "#f59e0b"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradient}
                    >
                      {isSubmitting ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#fff" />
                          <Text style={styles.buttonText}>Inscription...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Commencer l'Entraînement</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.loginLink} 
                    onPress={() => navigation.navigate("Login")}
                  >
                    <Text style={styles.loginText}>
                      Déjà membre du temple? <Text style={styles.loginLinkText}>Retournez à l'entraînement</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </LinearGradient>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  apiError: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 15,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 10,
    borderRadius: 5,
  },
  button: {
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 8,
  },
  gradient: {
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
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: "#999",
    textAlign: "center",
    fontSize: 14,
  },
  loginLinkText: {
    color: "#f59e0b",
  },
});

export default RegisterScreen;