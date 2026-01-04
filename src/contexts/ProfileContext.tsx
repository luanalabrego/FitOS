'use client'

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react'
import {
  UserProfile,
  ProfileStep,
  ProfileFormState,
  BodyComposition,
  Diagnosis,
  Goal,
  ProfilePhoto,
  ActivityLevel,
} from '@/types/profile'
import {
  calculateBMI,
  getBMIInfo,
  calculateBasalMetabolism,
  calculateDailyMetabolism,
  estimateBodyFatFromBMI,
  calculateFatMass,
  calculateLeanMass,
} from '@/utils/calculations'
import { getProfile, saveProfile } from '@/services/profileService'
import { ensureUser, onAuthChange } from '@/services/authService'

// Ordem dos steps
const STEP_ORDER: ProfileStep[] = [
  'dados_basicos',
  'composicao_corporal',
  'objetivos',
  'diagnostico',
  'fotos',
  'resumo',
]

// Estado inicial estendido
interface ExtendedProfileFormState extends ProfileFormState {
  userId: string | null
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  saveError: string | null
}

const initialState: ExtendedProfileFormState = {
  currentStep: 'dados_basicos',
  completedSteps: [],
  profile: {
    progressPhotos: [],
    diagnosis: {
      currentlyTraining: false,
      trainingFrequency: 0,
      trainingTypes: [],
      dietQuality: 'regular',
      mealsPerDay: 3,
      hasNutritionist: false,
      followsDiet: false,
      sleepQuality: 'regular',
      waterIntake: 'moderado',
      stressLevel: 'moderado',
      smokingStatus: 'nunca',
      alcoholConsumption: 'raramente',
      hasChronicConditions: false,
      takesMedication: false,
      hasInjuries: false,
      previousWeightLossAttempts: false,
    },
    bodyComposition: {
      currentWeight: 0,
      height: 0,
      gender: 'masculino',
      age: 0,
      inputMethod: 'formula',
    },
    primaryGoal: 'saude_geral',
    onboardingCompleted: false,
  },
  errors: {},
  isSubmitting: false,
  userId: null,
  isLoading: true,
  isSaving: false,
  lastSaved: null,
  saveError: null,
}

// Tipos de ações estendidos
type ProfileAction =
  | { type: 'SET_STEP'; payload: ProfileStep }
  | { type: 'COMPLETE_STEP'; payload: ProfileStep }
  | { type: 'UPDATE_BODY_COMPOSITION'; payload: Partial<BodyComposition> }
  | { type: 'UPDATE_DIAGNOSIS'; payload: Partial<Diagnosis> }
  | { type: 'SET_PRIMARY_GOAL'; payload: Goal }
  | { type: 'SET_SECONDARY_GOALS'; payload: Goal[] }
  | { type: 'SET_TARGET_WEIGHT'; payload: number }
  | { type: 'SET_PROFILE_PHOTO'; payload: ProfilePhoto }
  | { type: 'ADD_PROGRESS_PHOTO'; payload: ProfilePhoto }
  | { type: 'REMOVE_PROGRESS_PHOTO'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'CALCULATE_BMI_INFO' }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'SET_USER_ID'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_SAVE_ERROR'; payload: string | null }

// Reducer
function profileReducer(
  state: ExtendedProfileFormState,
  action: ProfileAction
): ExtendedProfileFormState {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      }

    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.payload)) {
        return state
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
      }

    case 'UPDATE_BODY_COMPOSITION':
      return {
        ...state,
        profile: {
          ...state.profile,
          bodyComposition: {
            ...state.profile.bodyComposition!,
            ...action.payload,
          },
        },
      }

    case 'UPDATE_DIAGNOSIS':
      return {
        ...state,
        profile: {
          ...state.profile,
          diagnosis: {
            ...state.profile.diagnosis!,
            ...action.payload,
          },
        },
      }

    case 'SET_PRIMARY_GOAL':
      return {
        ...state,
        profile: {
          ...state.profile,
          primaryGoal: action.payload,
        },
      }

    case 'SET_SECONDARY_GOALS':
      return {
        ...state,
        profile: {
          ...state.profile,
          secondaryGoals: action.payload,
        },
      }

    case 'SET_TARGET_WEIGHT':
      return {
        ...state,
        profile: {
          ...state.profile,
          targetWeight: action.payload,
        },
      }

    case 'SET_PROFILE_PHOTO':
      return {
        ...state,
        profile: {
          ...state.profile,
          profilePhoto: action.payload,
        },
      }

    case 'ADD_PROGRESS_PHOTO':
      return {
        ...state,
        profile: {
          ...state.profile,
          progressPhotos: [
            ...(state.profile.progressPhotos || []),
            action.payload,
          ],
        },
      }

    case 'REMOVE_PROGRESS_PHOTO':
      return {
        ...state,
        profile: {
          ...state.profile,
          progressPhotos: state.profile.progressPhotos?.filter(
            (p) => p.id !== action.payload
          ),
        },
      }

    case 'SET_NAME':
      return {
        ...state,
        profile: {
          ...state.profile,
          name: action.payload,
        },
      }

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      }

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      }

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      }

    case 'CALCULATE_BMI_INFO': {
      const bc = state.profile.bodyComposition
      if (!bc?.currentWeight || !bc?.height || !bc?.age || !bc?.gender) {
        return state
      }

      const bmi = calculateBMI(bc.currentWeight, bc.height)
      const bmiInfo = getBMIInfo(bmi, bc.age)
      const basalMetabolism = calculateBasalMetabolism(
        bc.currentWeight,
        bc.height,
        bc.age,
        bc.gender
      )

      let bodyFatPercentage = bc.bodyFatPercentage
      if (!bodyFatPercentage && bc.inputMethod === 'formula') {
        bodyFatPercentage = estimateBodyFatFromBMI(bmi, bc.age, bc.gender)
      }

      const fatMass = bodyFatPercentage
        ? calculateFatMass(bc.currentWeight, bodyFatPercentage)
        : undefined
      const leanMass = bodyFatPercentage
        ? calculateLeanMass(bc.currentWeight, bodyFatPercentage)
        : undefined

      return {
        ...state,
        profile: {
          ...state.profile,
          bmiInfo,
          bodyComposition: {
            ...bc,
            bmi,
            basalMetabolism,
            bodyFatPercentage,
            fatMass,
            leanMass,
          },
        },
      }
    }

    case 'RESET_FORM':
      return {
        ...initialState,
        userId: state.userId,
        isLoading: false,
      }

    case 'LOAD_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
        isLoading: false,
      }

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        profile: {
          ...state.profile,
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
      }

    case 'SET_USER_ID':
      return {
        ...state,
        userId: action.payload,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.payload,
      }

    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
        saveError: null,
      }

    case 'SET_SAVE_ERROR':
      return {
        ...state,
        saveError: action.payload,
      }

    default:
      return state
  }
}

// Context
interface ProfileContextValue {
  state: ExtendedProfileFormState
  // Navegação
  goToStep: (step: ProfileStep) => void
  nextStep: () => void
  prevStep: () => void
  completeCurrentStep: () => void
  canGoNext: () => boolean
  canGoPrev: () => boolean
  // Dados corporais
  updateBodyComposition: (data: Partial<BodyComposition>) => void
  calculateMetrics: () => void
  // Diagnóstico
  updateDiagnosis: (data: Partial<Diagnosis>) => void
  // Objetivos
  setPrimaryGoal: (goal: Goal) => void
  setSecondaryGoals: (goals: Goal[]) => void
  setTargetWeight: (weight: number) => void
  // Fotos
  setProfilePhoto: (photo: ProfilePhoto) => void
  addProgressPhoto: (photo: ProfilePhoto) => void
  removeProgressPhoto: (id: string) => void
  // Geral
  setName: (name: string) => void
  setErrors: (errors: Record<string, string>) => void
  clearErrors: () => void
  resetForm: () => void
  completeOnboarding: () => Promise<void>
  // Calculadoras
  calculateDailyCalories: (activityLevel: ActivityLevel) => number | null
  // Firebase
  saveNow: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

// Provider
interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [state, dispatch] = useReducer(profileReducer, initialState)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastProfileRef = useRef<string>('')

  // Inicializar autenticação e carregar perfil
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initAuth = async () => {
      try {
        // Garantir que temos um usuário (anônimo se necessário)
        const userId = await ensureUser()
        dispatch({ type: 'SET_USER_ID', payload: userId })

        // Carregar perfil existente
        const existingProfile = await getProfile(userId)
        if (existingProfile) {
          dispatch({ type: 'LOAD_PROFILE', payload: existingProfile })

          // Se o onboarding foi completado, ir para o resumo
          if (existingProfile.onboardingCompleted) {
            dispatch({ type: 'SET_STEP', payload: 'resumo' })
            // Marcar todos os steps como completados
            STEP_ORDER.slice(0, -1).forEach((step) => {
              dispatch({ type: 'COMPLETE_STEP', payload: step })
            })
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Erro ao inicializar:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
        dispatch({ type: 'SET_SAVE_ERROR', payload: 'Erro ao conectar. Seus dados serão salvos localmente.' })
      }
    }

    // Observar mudanças de autenticação
    unsubscribe = onAuthChange((user) => {
      if (user) {
        dispatch({ type: 'SET_USER_ID', payload: user.uid })
      }
    })

    initAuth()

    return () => {
      unsubscribe?.()
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Auto-save com debounce quando o perfil muda
  useEffect(() => {
    const profileString = JSON.stringify(state.profile)

    // Evitar salvar se nada mudou ou se ainda está carregando
    if (profileString === lastProfileRef.current || state.isLoading || !state.userId) {
      return
    }

    lastProfileRef.current = profileString

    // Cancelar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce de 2 segundos
    saveTimeoutRef.current = setTimeout(async () => {
      if (!state.userId) return

      dispatch({ type: 'SET_SAVING', payload: true })
      try {
        await saveProfile(state.userId, state.profile)
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
      } catch (error) {
        console.error('Erro ao salvar:', error)
        dispatch({ type: 'SET_SAVE_ERROR', payload: 'Erro ao salvar. Tentando novamente...' })
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false })
      }
    }, 2000)
  }, [state.profile, state.userId, state.isLoading])

  // Salvar imediatamente
  const saveNow = useCallback(async () => {
    if (!state.userId) return

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    dispatch({ type: 'SET_SAVING', payload: true })
    try {
      await saveProfile(state.userId, state.profile)
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() })
      lastProfileRef.current = JSON.stringify(state.profile)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      dispatch({ type: 'SET_SAVE_ERROR', payload: 'Erro ao salvar.' })
      throw error
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [state.userId, state.profile])

  // Navegação
  const goToStep = useCallback((step: ProfileStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex < STEP_ORDER.length - 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep })
      dispatch({ type: 'SET_STEP', payload: STEP_ORDER[currentIndex + 1] })
    }
  }, [state.currentStep])

  const prevStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: STEP_ORDER[currentIndex - 1] })
    }
  }, [state.currentStep])

  const completeCurrentStep = useCallback(() => {
    dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep })
  }, [state.currentStep])

  const canGoNext = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    return currentIndex < STEP_ORDER.length - 1
  }, [state.currentStep])

  const canGoPrev = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep)
    return currentIndex > 0
  }, [state.currentStep])

  // Dados corporais
  const updateBodyComposition = useCallback(
    (data: Partial<BodyComposition>) => {
      dispatch({ type: 'UPDATE_BODY_COMPOSITION', payload: data })
    },
    []
  )

  const calculateMetrics = useCallback(() => {
    dispatch({ type: 'CALCULATE_BMI_INFO' })
  }, [])

  // Diagnóstico
  const updateDiagnosis = useCallback((data: Partial<Diagnosis>) => {
    dispatch({ type: 'UPDATE_DIAGNOSIS', payload: data })
  }, [])

  // Objetivos
  const setPrimaryGoal = useCallback((goal: Goal) => {
    dispatch({ type: 'SET_PRIMARY_GOAL', payload: goal })
  }, [])

  const setSecondaryGoals = useCallback((goals: Goal[]) => {
    dispatch({ type: 'SET_SECONDARY_GOALS', payload: goals })
  }, [])

  const setTargetWeight = useCallback((weight: number) => {
    dispatch({ type: 'SET_TARGET_WEIGHT', payload: weight })
  }, [])

  // Fotos
  const setProfilePhoto = useCallback((photo: ProfilePhoto) => {
    dispatch({ type: 'SET_PROFILE_PHOTO', payload: photo })
  }, [])

  const addProgressPhoto = useCallback((photo: ProfilePhoto) => {
    dispatch({ type: 'ADD_PROGRESS_PHOTO', payload: photo })
  }, [])

  const removeProgressPhoto = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PROGRESS_PHOTO', payload: id })
  }, [])

  // Geral
  const setName = useCallback((name: string) => {
    dispatch({ type: 'SET_NAME', payload: name })
  }, [])

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors })
  }, [])

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }, [])

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' })
  }, [])

  const completeOnboarding = useCallback(async () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' })
    // Salvar imediatamente ao completar onboarding
    await saveNow()
  }, [saveNow])

  // Calculadoras
  const calculateDailyCalories = useCallback(
    (activityLevel: ActivityLevel) => {
      const basalMetabolism = state.profile.bodyComposition?.basalMetabolism
      if (!basalMetabolism) return null
      return calculateDailyMetabolism(basalMetabolism, activityLevel)
    },
    [state.profile.bodyComposition?.basalMetabolism]
  )

  const value = useMemo(
    () => ({
      state,
      goToStep,
      nextStep,
      prevStep,
      completeCurrentStep,
      canGoNext,
      canGoPrev,
      updateBodyComposition,
      calculateMetrics,
      updateDiagnosis,
      setPrimaryGoal,
      setSecondaryGoals,
      setTargetWeight,
      setProfilePhoto,
      addProgressPhoto,
      removeProgressPhoto,
      setName,
      setErrors,
      clearErrors,
      resetForm,
      completeOnboarding,
      calculateDailyCalories,
      saveNow,
    }),
    [
      state,
      goToStep,
      nextStep,
      prevStep,
      completeCurrentStep,
      canGoNext,
      canGoPrev,
      updateBodyComposition,
      calculateMetrics,
      updateDiagnosis,
      setPrimaryGoal,
      setSecondaryGoals,
      setTargetWeight,
      setProfilePhoto,
      addProgressPhoto,
      removeProgressPhoto,
      setName,
      setErrors,
      clearErrors,
      resetForm,
      completeOnboarding,
      calculateDailyCalories,
      saveNow,
    ]
  )

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  )
}

// Hook
export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

// Exportar step order para uso externo
export { STEP_ORDER }
