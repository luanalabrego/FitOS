import {
  signInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase'

// Gerar ID local para quando Firebase não está disponível
function generateLocalUserId(): string {
  const stored = localStorage.getItem('fitos_local_user_id')
  if (stored) return stored

  const newId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  localStorage.setItem('fitos_local_user_id', newId)
  return newId
}

/**
 * Fazer login anônimo
 * Cria um usuário anônimo que persiste entre sessões
 */
export async function signInAnonymousUser(): Promise<User | null> {
  const auth = getFirebaseAuth()
  if (!auth) {
    console.warn('Firebase Auth não disponível')
    return null
  }

  try {
    const result = await signInAnonymously(auth)
    return result.user
  } catch (error) {
    console.error('Erro ao fazer login anônimo:', error)
    throw error
  }
}

/**
 * Obter o usuário atual
 */
export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth()
  if (!auth) return null
  return auth.currentUser
}

/**
 * Observar mudanças no estado de autenticação
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth()
  if (!auth) {
    // Se não há auth, chamar callback com null e retornar função vazia
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

/**
 * Obter o ID do usuário atual (ou criar um novo se não existir)
 * Fallback para ID local quando Firebase não está configurado
 */
export async function ensureUser(): Promise<string> {
  // Se Firebase não está configurado, usar ID local
  if (!isFirebaseConfigured || typeof window === 'undefined') {
    if (typeof window !== 'undefined') {
      return generateLocalUserId()
    }
    return 'server_render'
  }

  const currentUser = getCurrentUser()

  if (currentUser) {
    return currentUser.uid
  }

  try {
    const user = await signInAnonymousUser()
    if (user) {
      return user.uid
    }
  } catch (error) {
    console.error('Erro na autenticação, usando ID local:', error)
  }

  // Fallback para ID local
  return generateLocalUserId()
}

/**
 * Verificar se a autenticação está disponível
 */
export function isAuthAvailable(): boolean {
  return isFirebaseConfigured && typeof window !== 'undefined'
}
