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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import * as Yup from 'yup';
import { Formik } from 'formik';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { StackNavigationProp } from '@react-navigation/stack';

// Types pour la navigation
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

// Props pour le composant
interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// Interface pour les valeurs du formulaire
interface LoginFormValues {
  email: string;
  password: string;
}

// Schéma de validation avec Yup
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Adresse email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Mot de passe requis'),
});

// Configuration de l'API
const api = axios.create({
  baseURL: 'https://votre-api.com', // Remplacez par votre URL d'API
  timeout: 10000,
});

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  // État pour gérer les messages d'erreur
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Valeurs pour l'animation
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  // Style d'animation pour le cercle énergétique
  const energyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Animation du cercle énergétique
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000 }),
        withTiming(0.9, { duration: 2000 })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 2000 }),
        withTiming(0.1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  // Fonction de connexion
  const handleLogin = async (
    values: LoginFormValues, 
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    // Réinitialiser le message d'erreur
    setErrorMessage(null);

    try {
      const response = await api.post('/login', {
        email: values.email,
        password: values.password,
      });
      
      // Connexion réussie
      if (response.data.token) {
        // Stocker le token, naviguer vers l'écran principal
        // Vous devrez implémenter la logique de stockage du token
        navigation.replace('Home');
      } else {
        setErrorMessage('Connexion échouée. Veuillez réessayer.');
      }
    } catch (error: any) {
      // Gestion des erreurs de connexion
      setErrorMessage(
        error.response?.data?.message || 
        'Erreur de connexion. Veuillez vérifier vos identifiants.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground
        source={require('../assets/login-background.jpg')} // Ajustez le chemin
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        >
          {/* Animation du cercle énergétique */}
          <Animated.View style={[styles.energyCircle, energyStyle]} />

          <View style={styles.formContainer}>
            <Text style={styles.title}>Portail du Maître</Text>
            <Text style={styles.subtitle}>
              Entrez dans le temple avec honneur
            </Text>

            {/* Affichage des messages d'erreur */}
            {errorMessage && (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            )}

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
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
                  {/* Champ Email */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
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

                  {/* Champ Mot de passe */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Entrez votre mot de passe"
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

                  {/* Bouton de connexion */}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    <LinearGradient
                      colors={['#f59e0b', '#ef4444', '#f59e0b']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradientButton}
                    >
                      {isSubmitting ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator color="#fff" />
                          <Text style={styles.buttonText}>Connexion...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Entrer</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Mot de passe oublié */}
                  <TouchableOpacity
                    style={styles.forgotPasswordLink}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Mot de passe oublié ?
                    </Text>
                  </TouchableOpacity>

                  {/* Lien vers l'inscription */}
                  <TouchableOpacity
                    style={styles.registerLink}
                    onPress={() => navigation.navigate('Register')}
                  >
                    <Text style={styles.registerText}>
                      Nouveau dans le temple ?{' '}
                      <Text style={styles.registerLinkText}>
                        Commencez votre voyage
                      </Text>
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
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  energyCircle: {
    position: 'absolute',
    width: Dimensions.get('window').width * 2,
    height: Dimensions.get('window').width * 2,
    borderRadius: Dimensions.get('window').width,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    top: -Dimensions.get('window').width,
    left: -Dimensions.get('window').width / 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#f59e0b',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  errorMessage: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 15,
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
  loginButton: {
    marginTop: 10,
    overflow: 'hidden',
    borderRadius: 8,
  },
  gradientButton: {
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
  forgotPasswordLink: {
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#f59e0b',
    textAlign: 'center',
    fontSize: 14,
  },
  registerLink: {
    marginTop: 16,
  },
  registerText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 14,
  },
  registerLinkText: {
    color: '#f59e0b',
  },
});

export default LoginScreen;