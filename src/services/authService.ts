import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
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
 * Fazer login com email e senha
 */
export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase Auth não está configurado. Configure as variáveis de ambiente.')
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result
  } catch (error: unknown) {
    const firebaseError = error as { code?: string }
    // Traduzir erros comuns para português
    switch (firebaseError.code) {
      case 'auth/user-not-found':
        throw new Error('Usuário não encontrado. Verifique seu email.')
      case 'auth/wrong-password':
        throw new Error('Senha incorreta. Tente novamente.')
      case 'auth/invalid-email':
        throw new Error('Email inválido.')
      case 'auth/user-disabled':
        throw new Error('Esta conta foi desativada.')
      case 'auth/too-many-requests':
        throw new Error('Muitas tentativas. Tente novamente mais tarde.')
      case 'auth/invalid-credential':
        throw new Error('Email ou senha incorretos.')
      default:
        console.error('Erro ao fazer login:', error)
        throw new Error('Erro ao fazer login. Tente novamente.')
    }
  }
}

/**
 * Criar conta com email e senha
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase Auth não está configurado. Configure as variáveis de ambiente.')
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    // Atualizar o perfil com o nome se fornecido
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName })
    }

    return result
  } catch (error: unknown) {
    const firebaseError = error as { code?: string }
    // Traduzir erros comuns para português
    switch (firebaseError.code) {
      case 'auth/email-already-in-use':
        throw new Error('Este email já está em uso. Tente fazer login.')
      case 'auth/invalid-email':
        throw new Error('Email inválido.')
      case 'auth/weak-password':
        throw new Error('A senha deve ter pelo menos 6 caracteres.')
      case 'auth/operation-not-allowed':
        throw new Error('Cadastro com email/senha não está habilitado.')
      default:
        console.error('Erro ao criar conta:', error)
        throw new Error('Erro ao criar conta. Tente novamente.')
    }
  }
}

/**
 * Enviar email de recuperação de senha
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) {
    throw new Error('Firebase Auth não está configurado. Configure as variáveis de ambiente.')
  }

  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: unknown) {
    const firebaseError = error as { code?: string }
    // Traduzir erros comuns para português
    switch (firebaseError.code) {
      case 'auth/user-not-found':
        throw new Error('Não existe conta com este email.')
      case 'auth/invalid-email':
        throw new Error('Email inválido.')
      case 'auth/too-many-requests':
        throw new Error('Muitas tentativas. Tente novamente mais tarde.')
      default:
        console.error('Erro ao enviar email de recuperação:', error)
        throw new Error('Erro ao enviar email. Tente novamente.')
    }
  }
}

/**
 * Fazer logout
 */
export async function signOut(): Promise<void> {
  const auth = getFirebaseAuth()
  if (!auth) {
    // Limpar dados locais
    localStorage.removeItem('fitos_local_user_id')
    return
  }

  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
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

/**
 * Verificar se o usuário está logado com email (não anônimo)
 */
export function isEmailUser(): boolean {
  const user = getCurrentUser()
  return user !== null && !user.isAnonymous
}
