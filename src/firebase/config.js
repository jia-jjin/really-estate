// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

require("dotenv").config();

const {FIREBASE_API_KEY, MESSAGE_SENDER_ID, APP_ID} = process.env;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "really-estate-20da2.firebaseapp.com",
  projectId: "really-estate-20da2",
  storageBucket: "really-estate-20da2.appspot.com",
  messagingSenderId: MESSAGE_SENDER_ID,
  appId: APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const db = getFirestore(app)

export const auth = getAuth(app)

export const provider = new GoogleAuthProvider()
