// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
 } from "firebase/auth";
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCoKd57rYjIKicHLJs5CcnCFDrlgerseIY",
  authDomain: "info6132-week07.firebaseapp.com",
  projectId: "info6132-week07",
  storageBucket: "info6132-week07.appspot.com",
  messagingSenderId: "1057853694483",
  appId: "1:1057853694483:web:24754f22a8e70a62c615e6"
};

// Initialize Firebase
if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { 
  db, 
  auth,
  storage, 
  firebase, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
};