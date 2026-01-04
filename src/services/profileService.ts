import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { getFirebaseDb, isFirebaseConfigured } from '@/lib/firebase'
import { UserProfile, ProfilePhoto } from '@/types/profile'

const COLLECTION_NAME = 'profiles'

/**
 * Remove recursivamente todos os valores undefined de um objeto
 * Firestore não aceita undefined como valor
 */
function removeUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue // Pular valores undefined
    }

    if (value === null) {
      cleaned[key] = null // null é aceito pelo Firestore
    } else if (Array.isArray(value)) {
      // Limpar arrays recursivamente
      cleaned[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? removeUndefined(item as Record<string, unknown>)
          : item
      ).filter((item) => item !== undefined)
    } else if (typeof value === 'object' && value !== null && !(value instanceof Timestamp) && !(value instanceof Date)) {
      // Limpar objetos recursivamente (exceto Timestamp e Date)
      cleaned[key] = removeUndefined(value as Record<string, unknown>)
    } else {
      cleaned[key] = value
    }
  }

  return cleaned
}

// Converter datas para Firestore
function serializeProfile(profile: Partial<UserProfile>): Record<string, unknown> {
  const serialized: Record<string, unknown> = { ...profile }

  // Converter datas para Timestamp do Firestore
  if (profile.createdAt) {
    serialized.createdAt = Timestamp.fromDate(
      profile.createdAt instanceof Date ? profile.createdAt : new Date(profile.createdAt)
    )
  }
  if (profile.updatedAt) {
    serialized.updatedAt = Timestamp.fromDate(
      profile.updatedAt instanceof Date ? profile.updatedAt : new Date(profile.updatedAt)
    )
  }
  if (profile.targetDate) {
    serialized.targetDate = Timestamp.fromDate(
      profile.targetDate instanceof Date ? profile.targetDate : new Date(profile.targetDate)
    )
  }

  // Converter datas das fotos
  if (profile.profilePhoto) {
    serialized.profilePhoto = {
      ...profile.profilePhoto,
      date: Timestamp.fromDate(
        profile.profilePhoto.date instanceof Date
          ? profile.profilePhoto.date
          : new Date(profile.profilePhoto.date)
      ),
    }
  }

  if (profile.progressPhotos) {
    serialized.progressPhotos = profile.progressPhotos.map((photo) => ({
      ...photo,
      date: Timestamp.fromDate(
        photo.date instanceof Date ? photo.date : new Date(photo.date)
      ),
    }))
  }

  // Remover todos os valores undefined antes de salvar
  return removeUndefined(serialized)
}

// Converter dados do Firestore para o formato da aplicação
function deserializeProfile(data: Record<string, unknown>): Partial<UserProfile> {
  const deserialized: Partial<UserProfile> = { ...data } as Partial<UserProfile>

  // Converter Timestamps para Date
  if (data.createdAt && data.createdAt instanceof Timestamp) {
    deserialized.createdAt = (data.createdAt as Timestamp).toDate()
  }
  if (data.updatedAt && data.updatedAt instanceof Timestamp) {
    deserialized.updatedAt = (data.updatedAt as Timestamp).toDate()
  }
  if (data.targetDate && data.targetDate instanceof Timestamp) {
    deserialized.targetDate = (data.targetDate as Timestamp).toDate()
  }

  // Converter datas das fotos
  if (data.profilePhoto) {
    const photo = data.profilePhoto as Record<string, unknown>
    deserialized.profilePhoto = {
      ...photo,
      date:
        photo.date instanceof Timestamp
          ? photo.date.toDate()
          : new Date(photo.date as string),
    } as ProfilePhoto
  }

  if (data.progressPhotos && Array.isArray(data.progressPhotos)) {
    deserialized.progressPhotos = data.progressPhotos.map(
      (photo: Record<string, unknown>) => ({
        ...photo,
        date:
          photo.date instanceof Timestamp
            ? photo.date.toDate()
            : new Date(photo.date as string),
      })
    ) as ProfilePhoto[]
  }

  return deserialized
}

/**
 * Buscar perfil do usuário no Firestore
 */
export async function getProfile(userId: string): Promise<Partial<UserProfile> | null> {
  const db = getFirebaseDb()
  if (!db) {
    console.warn('Firestore não disponível')
    return null
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return deserializeProfile(docSnap.data())
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    throw error
  }
}

/**
 * Criar ou atualizar perfil completo do usuário
 */
export async function saveProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    console.warn('Firestore não disponível - dados não foram salvos na nuvem')
    return
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    const serialized = serializeProfile(profile)

    await setDoc(
      docRef,
      {
        ...serialized,
        id: userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Erro ao salvar perfil:', error)
    throw error
  }
}

/**
 * Atualizar campos específicos do perfil
 */
export async function updateProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    console.warn('Firestore não disponível')
    return
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    const serialized = serializeProfile(updates)

    await updateDoc(docRef, {
      ...serialized,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    throw error
  }
}

/**
 * Criar perfil inicial para novo usuário
 */
export async function createProfile(userId: string, name?: string): Promise<void> {
  const db = getFirebaseDb()
  if (!db) {
    console.warn('Firestore não disponível')
    return
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, userId)

    const initialProfile: Partial<UserProfile> = {
      id: userId,
      name: name || '',
      progressPhotos: [],
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(docRef, serializeProfile(initialProfile))
  } catch (error) {
    console.error('Erro ao criar perfil:', error)
    throw error
  }
}

/**
 * Verificar se o perfil existe
 */
export async function profileExists(userId: string): Promise<boolean> {
  const db = getFirebaseDb()
  if (!db) {
    return false
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  } catch (error) {
    console.error('Erro ao verificar perfil:', error)
    return false
  }
}

/**
 * Verificar se o Firebase está configurado
 */
export function isStorageAvailable(): boolean {
  return isFirebaseConfigured && typeof window !== 'undefined'
}
