import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

// Configuração do Firebase - use variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Verificar se as variáveis de ambiente estão configuradas
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
)

// Inicializar Firebase apenas se configurado e no cliente
let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let initialized = false

function initializeFirebase() {
  if (initialized) return

  if (!isFirebaseConfigured) {
    console.warn('Firebase não está configurado. Configure as variáveis de ambiente para persistir dados.')
    return
  }

  if (typeof window === 'undefined') {
    // Não inicializar no servidor durante SSR/SSG
    return
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }

    db = getFirestore(app)
    auth = getAuth(app)
    initialized = true
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error)
  }
}

// Getters para acessar os serviços de forma segura
export function getFirebaseApp(): FirebaseApp | null {
  if (!initialized && isFirebaseConfigured && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return app
}

export function getFirebaseDb(): Firestore | null {
  if (!initialized && isFirebaseConfigured && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return db
}

export function getFirebaseAuth(): Auth | null {
  if (!initialized && isFirebaseConfigured && typeof window !== 'undefined') {
    initializeFirebase()
  }
  return auth
}
