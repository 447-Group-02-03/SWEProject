// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-GbksEysJPmeitMNbWH2kpv-HOypG0c4",
  authDomain: "swe-project447.firebaseapp.com",
  projectId: "swe-project447",
  storageBucket: "swe-project447.appspot.com",
  messagingSenderId: "664774713071",
  appId: "1:664774713071:web:e44f5f50d53fdc450b851a",
  measurementId: "G-T2HSN83332"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();