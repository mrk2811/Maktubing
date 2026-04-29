import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGn9OAxSaRDSQsydd_IPaVbUV6SABv9ug",
  authDomain: "maktub-40f66.firebaseapp.com",
  projectId: "maktub-40f66",
  storageBucket: "maktub-40f66.firebasestorage.app",
  messagingSenderId: "373733220278",
  appId: "1:373733220278:web:bc19fc7171d917c4d92b17",
  measurementId: "G-498983W157",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
