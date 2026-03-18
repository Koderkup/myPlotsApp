import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmail } from '../src/services/emailAuth';
import { LinearGradient } from 'expo-linear-gradient';


const inputWebStyle = Platform.select({
  web: {
    outlineStyle: 'none' as any,
    outlineWidth: 0,
  },
  default: {},
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }

    setLoading(true);
    try {
      const user = await signInWithEmail(email, password);
      if (user) {
        console.log('Вход выполнен, перенаправляем...');
        router.replace('/');
      }
    } catch (error: any) {
      let message = 'Ошибка входа';
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        message = 'Неверный email или пароль';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Слишком много попыток. Попробуйте позже';
      }
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ title: 'Вход', headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <LinearGradient
          colors={['#007AFF', '#00C6FB']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.iconContainer}>
              <Ionicons name='home' size={60} color='#fff' />
            </View>
            <Text style={styles.title}>Мои Участки</Text>
            <Text style={styles.subtitle}>
              Управляйте своими участками легко и удобно
            </Text>
          </Animated.View>
        </LinearGradient>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <Text style={styles.welcomeBack}>Добро пожаловать!</Text>
          <Text style={styles.formSubtitle}>Войдите, чтобы продолжить</Text>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Ionicons
                name='mail-outline'
                size={20}
                color='#999'
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, inputWebStyle]}
                placeholder='Email'
                placeholderTextColor='#999'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                editable={!loading}
                selectionColor='#007AFF'
                underlineColorAndroid='transparent'
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name='lock-closed-outline'
                size={20}
                color='#999'
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, inputWebStyle]}
                placeholder='Пароль'
                placeholderTextColor='#999'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                selectionColor='#007AFF'
                underlineColorAndroid='transparent'
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color='#999'
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Войти</Text>
                  <Ionicons name='arrow-forward' size={20} color='#fff' />
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    // width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  welcomeBack: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
