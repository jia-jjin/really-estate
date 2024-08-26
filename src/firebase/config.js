// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIrJmUODt-uwp4K8TuathhbLjrRHjI3Xs",
  authDomain: "really-estate-20da2.firebaseapp.com",
  projectId: "really-estate-20da2",
  storageBucket: "really-estate-20da2.appspot.com",
  messagingSenderId: "962401934906",
  appId: "1:962401934906:web:fdece93b0acfd76c965f03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const db = getFirestore(app)

export const auth = getAuth(app)

export const provider = new GoogleAuthProvider()
