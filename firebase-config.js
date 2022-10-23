// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
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
  apiKey: "AIzaSyCxYHZktxhHjS8nTvzQ5aqOhhgZmAwMcw0",
  authDomain: "info3170-bonsai-shop.firebaseapp.com",
  databaseURL: "https://info3170-bonsai-shop-default-rtdb.firebaseio.com",
  projectId: "info3170-bonsai-shop",
  storageBucket: "info3170-bonsai-shop.appspot.com",
  messagingSenderId: "483407942231",
  appId: "1:483407942231:web:801f76b24ab44306cd4912",
  measurementId: "G-7Y4KDNDZHF"
};


// Initialize Firebase
if (!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { 
  db, 
  auth, 
  firebase, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
};