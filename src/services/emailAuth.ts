import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { firebaseConfig } from './firebase';

// Инициализируем Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const auth = getAuth();

// Вход по email и паролю
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    console.log('Попытка входа с email:', email);
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log('Успешный вход:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('Ошибка входа:', error.code, error.message);
    throw error;
  }
};

// Регистрация нового пользователя (если понадобится)
export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<User | null> => {
  try {
    console.log('Регистрация нового пользователя:', email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log('Успешная регистрация:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    console.error('Ошибка регистрации:', error.code, error.message);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('Выход выполнен успешно');
  } catch (error) {
    console.error('Ошибка выхода:', error);
  }
};

export const getCurrentUser = (): User | null => auth.currentUser;
export { auth };
