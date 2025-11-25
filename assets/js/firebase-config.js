// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBK4ps_iRDtR1yOGbnGblc42pOMNh2mZ3c",
  authDomain: "pablo-fotografia.firebaseapp.com",
  projectId: "pablo-fotografia",
  storageBucket: "pablo-fotografia.firebasestorage.app",
  messagingSenderId: "836776528100",
  appId: "1:836776528100:web:7489e971c6cabc711a84f1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
