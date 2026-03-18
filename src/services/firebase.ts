// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';

// export const firebaseConfig = {
//   apiKey: 'AIzaSyCmN8dxWdYnqmcVA17jLINw_LUaz771xYs',
//   authDomain: 'myplotsapp-295a7.firebaseapp.com',
//   projectId: 'myplotsapp-295a7',
//   storageBucket: 'myplotsapp-295a7.firebasestorage.app',
//   messagingSenderId: '202860526913',
//   appId: '1:202860526913:web:d74ea34e45c0856fce75c0',
// };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const { extra } = Constants.expoConfig || {};

export const firebaseConfig = {
  apiKey: extra?.firebaseApiKey,
  authDomain: extra?.firebaseAuthDomain,
  projectId: extra?.firebaseProjectId,
  storageBucket: extra?.firebaseStorageBucket,
  messagingSenderId: extra?.firebaseMessagingSenderId,
  appId: extra?.firebaseAppId,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);