import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik } from 'formik';

// Validation schema using Yup
const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Nom requis'),
  email: Yup.string()
    .email('Adresse email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .matches(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .matches(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .required('Mot de passe requis'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
    .required('Confirmation du mot de passe requise'),
});

// API service
const api = axios.create({
  baseURL: 'YOUR_API_BASE_URL', 
  timeout: 5000,
});

export default function RegisterScreen({ navigation }) {
  const [apiError, setApiError] = useState('');

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      setApiError('');
      const response = await api.post('/register', {
        username: values.username,
        email: values.email,
        password: values.password,
      });
      
      // Gérer la réponse du serveur
      if (response.data) {
        // Naviguer vers la page de connexion ou faire autre chose
        navigation.navigate('Login');
      }
    } catch (error) {
      setApiError(
        error.response?.data?.message || 
        'Une erreur est survenue lors de l\'inscription'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground
      source={require('./assets/login-bg.jpg')} // Ajoutez votre image de fond
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Commencez Votre Voyage</Text>
          <Text style={styles.subtitle}>
            Rejoignez le temple et maîtrisez votre voie
          </Text>

          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
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
              isSubmitting,
            }) => (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nom du Guerrier</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre nom"
                    placeholderTextColor="#666"
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    value={values.username}
                  />
                  {touched.username && errors.username && (
                    <Text style={styles.errorText}>{errors.username}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Parchemin Sacré (Email)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre email"
                    placeholderTextColor="#666"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mantra Secret (Mot de passe)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Créez votre mot de passe"
                    placeholderTextColor="#666"
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    secureTextEntry
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmez le Mantra Secret</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmez votre mot de passe"
                    placeholderTextColor="#666"
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                    secureTextEntry
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>

                {apiError ? (
                  <Text style={styles.apiError}>{apiError}</Text>
                ) : null}

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#ef4444', '#f59e0b']}
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
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.loginText}>
                    Déjà membre du temple?{' '}
                    <Text style={styles.loginLinkText}>
                      Retournez à l'entraînement
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(45, 45, 45, 0.5)',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
  apiError: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 8,
  },
  gradient: {
    padding: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginLink: {
    marginTop: 20,
  },
  loginText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#f59e0b',
  },
});