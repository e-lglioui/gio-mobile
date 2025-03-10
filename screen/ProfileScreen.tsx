"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";

// Types pour la navigation
type RootStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  SchoolDetail: { schoolId: string };
  ClassDetail: { classId: string };
  Certifications: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, "Profile">;

// Interface pour les props du composant
interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

// Types des données
interface Rank {
  name: string;
  achievedDate: string;
  color: string;
}

interface Certification {
  title: string;
  issueDate: string;
  issuedBy: string;
  imageUrl?: string;
}

interface TrainingClass {
  _id: string;
  name: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  };
  instructor: string;
  attendanceRate: number;
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  startDate: string;
  profileImage?: string;
  school: {
    _id: string;
    name: string;
  };
  currentRank: Rank;
  rankHistory: Rank[];
  certifications: Certification[];
  classes: TrainingClass[];
  attendanceRate: number;
  progressMetrics: {
    technicalSkills: number;
    physicalCondition: number;
    discipline: number;
    philosophy: number;
    overall: number;
  };
  nextEvaluation?: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info"); // info, classes, certifications, progress

  // Animation values
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const progressAnimation = useSharedValue(0);

  // Fetch student profile data
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        // Remplacer par l'ID réel de l'étudiant (peut venir du contexte d'authentification)
        const studentId = user?.id || "mock-student-id";
        const response = await axios.get(`/api/students/${studentId}`);
        setStudentProfile(response.data);
        setError(null);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        setError("Impossible de charger les informations du profil. Veuillez réessayer.");
        
        // Données fictives pour démonstration
        setStudentProfile({
          _id: "mock-student-id",
          firstName: "Mei",
          lastName: "Zhang",
          email: "mei.zhang@example.com",
          phoneNumber: "+33 6 12 34 56 78",
          birthDate: "1995-05-15",
          startDate: "2022-09-01",
          profileImage: "https://example.com/profile.jpg",
          school: {
            _id: "school-123",
            name: "Temple du Dragon Doré"
          },
          currentRank: {
            name: "Ceinture Bleue",
            achievedDate: "2023-06-15",
            color: "#3b82f6"
          },
          rankHistory: [
            {
              name: "Ceinture Blanche",
              achievedDate: "2022-09-01",
              color: "#f9fafb" 
            },
            {
              name: "Ceinture Jaune",
              achievedDate: "2022-12-10",
              color: "#fcd34d"
            },
            {
              name: "Ceinture Bleue",
              achievedDate: "2023-06-15",
              color: "#3b82f6"
            }
          ],
          certifications: [
            {
              title: "Fondamentaux du Kung Fu",
              issueDate: "2022-12-10",
              issuedBy: "Maître Wong"
            },
            {
              title: "Techniques avancées de la forme du Tigre",
              issueDate: "2023-06-15",
              issuedBy: "Grand Maître Chen"
            }
          ],
          classes: [
            {
              _id: "class-1",
              name: "Kung Fu traditionnel",
              schedule: {
                day: "Lundi",
                startTime: "18:00",
                endTime: "20:00"
              },
              instructor: "Maître Wong",
              attendanceRate: 90
            },
            {
              _id: "class-2",
              name: "Formes et techniques",
              schedule: {
                day: "Mercredi",
                startTime: "19:00",
                endTime: "21:00"
              },
              instructor: "Maître Liu",
              attendanceRate: 85
            },
            {
              _id: "class-3",
              name: "Combat et applications",
              schedule: {
                day: "Samedi",
                startTime: "10:00",
                endTime: "12:00"
              },
              instructor: "Grand Maître Chen",
              attendanceRate: 95
            }
          ],
          attendanceRate: 90,
          progressMetrics: {
            technicalSkills: 75,
            physicalCondition: 80,
            discipline: 90,
            philosophy: 70,
            overall: 78
          },
          nextEvaluation: "2024-05-15"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  // Animation setup
  useEffect(() => {
    // Pulse animation for energy circle
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(0.95, { duration: 2000 })
      ),
      -1,
      true
    );
    
    // Fade in animation
    opacity.value = withTiming(0.3, { duration: 1000 });
    
    // Progress bar animation
    if (studentProfile) {
      progressAnimation.value = withTiming(studentProfile.progressMetrics.overall / 100, {
        duration: 1500
      });
    }
    
    return () => {
      // Clean up animations if needed
    };
  }, [scale, opacity, progressAnimation, studentProfile]);

  // Animation styles
  const energyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerOpacity = interpolate(
      scrollY.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    );
    
    return {
      opacity: headerOpacity,
      transform: [
        { 
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [-20, 0],
            Extrapolation.CLAMP
          ) 
        }
      ]
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progressAnimation.value, [0, 1], [0, 100])}%`,
    };
  });

  // Format date function
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Handle scroll events
  const handleScroll = (event: any) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.loadingContainer}>
          <Animated.View style={[styles.energyCircle, energyStyle]} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
          <ActivityIndicator size="large" color="#f59e0b" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error || !studentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.errorContainer}>
          <Feather name="alert-triangle" size={50} color="#f59e0b" />
          <Text style={styles.errorText}>{error || "Profil non trouvé"}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.background}>
        {/* Animated energy circle */}
        <Animated.View style={[styles.energyCircle, energyStyle]} />
        
        {/* Animated header for scrolling */}
        <Animated.View style={[styles.animatedHeader, headerAnimatedStyle]}>
          <LinearGradient
            colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)"]}
            style={styles.headerGradient}
          >
            <TouchableOpacity style={styles.backArrow} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color="#f59e0b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profil de l'Élève</Text>
          </LinearGradient>
        </Animated.View>
        
        {/* Main content scroll view */}
        <ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Profile header section */}
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {studentProfile.profileImage ? (
                <Image 
                  source={{ uri: studentProfile.profileImage }} 
                  style={styles.profileImage} 
                  defaultSource={require('../assets/images/default-avatar.jpg')}
                />
              ) : (
                <View style={styles.profileImageFallback}>
                  <Text style={styles.profileImageFallbackText}>
                    {studentProfile.firstName.charAt(0)}{studentProfile.lastName.charAt(0)}
                  </Text>
                </View>
              )}
              
              <View style={[styles.rankBadge, { backgroundColor: studentProfile.currentRank.color }]}>
                <Text style={styles.rankText}>{studentProfile.currentRank.name}</Text>
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{studentProfile.firstName} {studentProfile.lastName}</Text>
              <TouchableOpacity 
                style={styles.schoolLink}
                onPress={() => navigation.navigate('SchoolDetail', { schoolId: studentProfile.school._id })}
              >
                <Feather name="home" size={14} color="#f59e0b" />
                <Text style={styles.schoolName}>{studentProfile.school.name}</Text>
              </TouchableOpacity>
              
              <View style={styles.joinedInfo}>
                <Text style={styles.joinedLabel}>Membre depuis:</Text>
                <Text style={styles.joinedDate}>{formatDate(studentProfile.startDate)}</Text>
              </View>
              
              <View style={styles.overallProgressContainer}>
                <View style={styles.progressLabelContainer}>
                  <Text style={styles.progressLabel}>Progression globale</Text>
                  <Text style={styles.progressPercentage}>{studentProfile.progressMetrics.overall}%</Text>
                </View>
                <View style={styles.progressBarBackground}>
                  <Animated.View style={[styles.progressBarFill, progressBarStyle]} />
                </View>
              </View>
            </View>
          </View>
          
          {/* Quick stats */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.statBox}>
              <Feather name="calendar" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>{studentProfile.attendanceRate}%</Text>
              <Text style={styles.statLabel}>Présence</Text>
            </View>
            
            <View style={styles.statBox}>
              <Feather name="award" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>{studentProfile.certifications.length}</Text>
              <Text style={styles.statLabel}>Certifications</Text>
            </View>
            
            <View style={styles.statBox}>
              <Feather name="book-open" size={20} color="#f59e0b" />
              <Text style={styles.statValue}>{studentProfile.classes.length}</Text>
              <Text style={styles.statLabel}>Cours</Text>
            </View>
          </View>
          
          {/* Navigation tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "info" && styles.activeTab]}
              onPress={() => setActiveTab("info")}
            >
              <Text style={[styles.tabText, activeTab === "info" && styles.activeTabText]}>
                Info
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === "classes" && styles.activeTab]}
              onPress={() => setActiveTab("classes")}
            >
              <Text style={[styles.tabText, activeTab === "classes" && styles.activeTabText]}>
                Cours
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === "progress" && styles.activeTab]}
              onPress={() => setActiveTab("progress")}
            >
              <Text style={[styles.tabText, activeTab === "progress" && styles.activeTabText]}>
                Progrès
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === "certifications" && styles.activeTab]}
              onPress={() => setActiveTab("certifications")}
            >
              <Text style={[styles.tabText, activeTab === "certifications" && styles.activeTabText]}>
                Grades
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab content */}
          <View style={styles.tabContent}>
            {/* Personal Information Tab */}
            {activeTab === "info" && (
              <View>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Informations personnelles</Text>
                  
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <Feather name="mail" size={16} color="#f59e0b" />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{studentProfile.email}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Feather name="phone" size={16} color="#f59e0b" />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Téléphone</Text>
                        <Text style={styles.infoValue}>{studentProfile.phoneNumber}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Feather name="calendar" size={16} color="#f59e0b" />
                      <View style={styles.infoTextContainer}>
                        <Text style={styles.infoLabel}>Date de naissance</Text>
                        <Text style={styles.infoValue}>{formatDate(studentProfile.birthDate)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Prochaine évaluation</Text>
                  
                  {studentProfile.nextEvaluation ? (
                    <View style={styles.evaluationCard}>
                      <Feather name="clock" size={24} color="#f59e0b" />
                      <View style={styles.evaluationTextContainer}>
                        <Text style={styles.evaluationDate}>{formatDate(studentProfile.nextEvaluation)}</Text>
                        <Text style={styles.evaluationNote}>Préparez-vous pour le prochain grade</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>Aucune évaluation planifiée</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {/* Classes Tab */}
            {activeTab === "classes" && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Mes cours</Text>
                
                {studentProfile.classes.length > 0 ? (
                  <View>
                    {studentProfile.classes.map((classItem, index) => (
                      <TouchableOpacity 
                        key={classItem._id} 
                        style={styles.classCard}
                        onPress={() => navigation.navigate('ClassDetail', { classId: classItem._id })}
                      >
                        <View style={styles.classHeader}>
                          <Text style={styles.className}>{classItem.name}</Text>
                          <View style={[
                            styles.attendanceBadge, 
                            { backgroundColor: classItem.attendanceRate >= 90 ? '#22c55e' : classItem.attendanceRate >= 75 ? '#f59e0b' : '#ef4444' }
                          ]}>
                            <Text style={styles.attendanceText}>{classItem.attendanceRate}%</Text>
                          </View>
                        </View>
                        
                        <View style={styles.classDetails}>
                          <View style={styles.classDetailRow}>
                            <Feather name="user" size={14} color="#f59e0b" />
                            <Text style={styles.classDetailText}>{classItem.instructor}</Text>
                          </View>
                          
                          <View style={styles.classDetailRow}>
                            <Feather name="clock" size={14} color="#f59e0b" />
                            <Text style={styles.classDetailText}>
                              {classItem.schedule.day} • {classItem.schedule.startTime} - {classItem.schedule.endTime}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Feather name="calendar" size={40} color="#444" />
                    <Text style={styles.emptyStateText}>Aucun cours inscrit</Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Progress Tab */}
            {activeTab === "progress" && (
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Progression des compétences</Text>
                
                <View style={styles.skillProgressContainer}>
                  <View style={styles.skillProgressItem}>
                    <View style={styles.skillLabelContainer}>
                      <Text style={styles.skillLabel}>Technique</Text>
                      <Text style={styles.skillValue}>{studentProfile.progressMetrics.technicalSkills}%</Text>
                    </View>
                    <View style={styles.skillProgressBarBg}>
                      <View style={[styles.skillProgressBarFill, { 
                        width: `${studentProfile.progressMetrics.technicalSkills}%`,
                        backgroundColor: '#3b82f6'
                      }]} />
                    </View>
                  </View>
                  
                  <View style={styles.skillProgressItem}>
                    <View style={styles.skillLabelContainer}>
                      <Text style={styles.skillLabel}>Condition physique</Text>
                      <Text style={styles.skillValue}>{studentProfile.progressMetrics.physicalCondition}%</Text>
                    </View>
                    <View style={styles.skillProgressBarBg}>
                      <View style={[styles.skillProgressBarFill, { 
                        width: `${studentProfile.progressMetrics.physicalCondition}%`,
                        backgroundColor: '#22c55e'
                      }]} />
                    </View>
                  </View>
                  
                  <View style={styles.skillProgressItem}>
                    <View style={styles.skillLabelContainer}>
                      <Text style={styles.skillLabel}>Discipline</Text>
                      <Text style={styles.skillValue}>{studentProfile.progressMetrics.discipline}%</Text>
                    </View>
                    <View style={styles.skillProgressBarBg}>
                      <View style={[styles.skillProgressBarFill, { 
                        width: `${studentProfile.progressMetrics.discipline}%`,
                        backgroundColor: '#f59e0b'
                      }]} />
                    </View>
                  </View>
                  
                  <View style={styles.skillProgressItem}>
                    <View style={styles.skillLabelContainer}>
                      <Text style={styles.skillLabel}>Philosophie</Text>
                      <Text style={styles.skillValue}>{studentProfile.progressMetrics.philosophy}%</Text>
                    </View>
                    <View style={styles.skillProgressBarBg}>
                      <View style={[styles.skillProgressBarFill, { 
                        width: `${studentProfile.progressMetrics.philosophy}%`,
                        backgroundColor: '#a855f7'
                      }]} />
                    </View>
                  </View>
                </View>
                
                <View style={styles.noteCard}>
                  <Feather name="info" size={20} color="#f59e0b" />
                  <Text style={styles.noteText}>
                    Les évaluations sont mises à jour après chaque session d'évaluation par les maîtres.
                  </Text>
                </View>
              </View>
            )}
            
            {/* Certifications and Ranks Tab */}
            {activeTab === "certifications" && (
              <View>
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Progression des grades</Text>
                  
                  <View style={styles.rankProgressContainer}>
                    {studentProfile.rankHistory.map((rank, index) => (
                      <View key={index} style={styles.rankMilestone}>
                        <View style={[styles.rankDot, { backgroundColor: rank.color }]} />
                        <View style={styles.rankMilestoneContent}>
                          <Text style={styles.rankName}>{rank.name}</Text>
                          <Text style={styles.rankDate}>{formatDate(rank.achievedDate)}</Text>
                        </View>
                        {index < studentProfile.rankHistory.length - 1 && (
                          <View style={styles.rankConnector} />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Certifications</Text>
                  
                  {studentProfile.certifications.length > 0 ? (
                    <View style={styles.certificationsContainer}>
                      {studentProfile.certifications.map((cert, index) => (
                        <View key={index} style={styles.certificationCard}>
                          <View style={styles.certificationIconContainer}>
                            <Feather name="award" size={24} color="#f59e0b" />
                          </View>
                          <View style={styles.certificationContent}>
                            <Text style={styles.certificationTitle}>{cert.title}</Text>
                            <Text style={styles.certificationDetails}>
                              Délivré par {cert.issuedBy} • {formatDate(cert.issueDate)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyState}>
                      <Feather name="award" size={40} color="#444" />
                      <Text style={styles.emptyStateText}>Aucune certification obtenue</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
          
          {/* Action buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <LinearGradient
                colors={["#f59e0b", "#ef4444", "#f59e0b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionGradient}
              >
                <Feather name="edit-2" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Modifier le profil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          {/* Footer space */}
          <View style={styles.footer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

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
    energyCircle: {
      position: "absolute",
      width: Dimensions.get("window").width * 2,
      height: Dimensions.get("window").width * 2,
      borderRadius: Dimensions.get("window").width,
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      top: -Dimensions.get("window").width,
      left: -Dimensions.get("window").width / 2,
      zIndex: -1,
    },
    animatedHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      height: 60,
    },
    headerGradient: {
      flexDirection: "row",
      alignItems: "center",
      height: 60,
      paddingHorizontal: 16,
    },
    headerTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      marginLeft: 16,
      textShadowColor: "#f59e0b",
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 5,
    },
    backArrow: {
      padding: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    loadingText: {
      color: "#f59e0b",
      fontSize: 18,
      marginBottom: 16,
      fontWeight: "bold",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    errorText: {
      color: "#f59e0b",
      fontSize: 16,
      marginVertical: 16,
      textAlign: "center",
    },
    backButton: {
      backgroundColor: "rgba(245, 158, 11, 0.2)",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.5)",
    },
    backButtonText: {
      color: "#f59e0b",
      fontWeight: "bold",
    },
    profileHeader: {
      flexDirection: "row",
      padding: 16,
      paddingTop: 24,
    },
    profileImageContainer: {
      position: "relative",
      marginRight: 16,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: "#f59e0b",
    },
    profileImageFallback: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(245, 158, 11, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "#f59e0b",
    },
    profileImageFallbackText: {
      color: "#f59e0b",
      fontSize: 32,
      fontWeight: "bold",
    },
    rankBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#000",
    },
    rankText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    profileInfo: {
      flex: 1,
      justifyContent: "center",
    },
    profileName: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 4,
    },
    schoolLink: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    schoolName: {
      color: "#f59e0b",
      fontSize: 14,
      marginLeft: 6,
    },
    joinedInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    joinedLabel: {
      color: "#aaa",
      fontSize: 12,
      marginRight: 4,
    },
    joinedDate: {
      color: "#ddd",
      fontSize: 12,
    },
    overallProgressContainer: {
      marginTop: 4,
    },
    progressLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    progressLabel: {
      color: "#aaa",
      fontSize: 12,
    },
    progressPercentage: {
      color: "#f59e0b",
      fontSize: 12,
      fontWeight: "bold",
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 3,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#f59e0b",
      borderRadius: 3,
    },
    quickStatsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      marginVertical: 16,
    },
    statBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.3)",
    },
    statValue: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      marginVertical: 4,
    },
    statLabel: {
      color: "#aaa",
      fontSize: 12,
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    activeTab: {
      borderBottomColor: "#f59e0b",
    },
    tabText: {
      color: "#aaa",
      fontWeight: "500",
    },
    activeTabText: {
      color: "#f59e0b",
      fontWeight: "bold",
    },
    tabContent: {
      paddingHorizontal: 16,
    },
    infoSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 12,
    },
    infoCard: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.2)",
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    infoTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    infoLabel: {
      color: "#aaa",
      fontSize: 12,
    },
    infoValue: {
      color: "#fff",
      fontSize: 14,
      marginTop: 2,
    },
    evaluationCard: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.2)",
      flexDirection: "row",
      alignItems: "center",
    },
    evaluationTextContainer: {
      marginLeft: 16,
    },
    evaluationDate: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    evaluationNote: {
      color: "#aaa",
      fontSize: 12,
      marginTop: 4,
    },
    emptyState: {
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.1)",
    },
    emptyStateText: {
      color: "#aaa",
      marginTop: 10,
    },
    classCard: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.2)",
    },
    classHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    className: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    attendanceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    attendanceText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
    },
    classDetails: {
      marginTop: 4,
    },
    classDetailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    classDetailText: {
      color: "#ddd",
      fontSize: 12,
      marginLeft: 8,
    },
    skillProgressContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.2)",
    },
    skillProgressItem: {
      marginBottom: 16,
    },
    skillLabelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    skillLabel: {
      color: "#ddd",
      fontSize: 14,
    },
    skillValue: {
      color: "#f59e0b",
      fontSize: 14,
      fontWeight: "bold",
    },
    skillProgressBarBg: {
      height: 8,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 4,
      overflow: "hidden",
    },
    skillProgressBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    noteCard: {
      flexDirection: "row",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      borderRadius: 8,
      padding: 12,
      marginTop: 16,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.2)",
      alignItems: "flex-start",
    },
    noteText: {
      color: "#ddd",
      fontSize: 12,
      marginLeft: 10,
      flex: 1,
    },
    rankProgressContainer: {
      paddingVertical: 8,
    },
    rankMilestone: {
      flexDirection: "row",
      position: "relative",
      marginBottom: 20,
    },
    rankDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: "#000",
      marginRight: 12,
      marginTop: 4,
    },
    rankConnector: {
      position: "absolute",
      left: 9,
      top: 24,
      width: 2,
      height: 30,
      backgroundColor: "rgba(245, 158, 11, 0.5)",
    },
    rankMilestoneContent: {
      flex: 1,
    },
    rankName: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    rankDate: {
      color: "#aaa",
      fontSize: 12,
      marginTop: 2,
    },
    certificationsContainer: {
      marginTop: 8,
    },
    certificationCard: {
      flexDirection: "row",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.2)",
      alignItems: "center",
    },
    certificationIconContainer: {
      marginRight: 12,
    },
    certificationContent: {
      flex: 1,
    },
    certificationTitle: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
    },
    certificationDetails: {
      color: "#aaa",
      fontSize: 12,
      marginTop: 2,
    },
    actionContainer: {
      padding: 16,
      marginTop: 8,
    },
    actionButton: {
      borderRadius: 8,
      overflow: "hidden",
    },
    actionGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    actionButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
      marginLeft: 8,
    },
    footer: {
      height: 40,
    }
  });
  export default ProfileScreen;