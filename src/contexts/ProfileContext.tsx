'use client'

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'
import {
  UserProfile,
  ProfileStep,
  ProfileFormState,
  BodyComposition,
  Diagnosis,
  Goal,
  ProfilePhoto,
  BMIInfo,
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

// Ordem dos steps
const STEP_ORDER: ProfileStep[] = [
  'dados_basicos',
  'composicao_corporal',
  'objetivos',
  'diagnostico',
  'fotos',
  'resumo',
]

// Estado inicial
const initialState: ProfileFormState = {
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
}

// Tipos de ações
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

// Reducer
function profileReducer(
  state: ProfileFormState,
  action: ProfileAction
): ProfileFormState {
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

      // Estimativa de gordura corporal se não foi informada
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
      return initialState

    case 'LOAD_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
        },
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

    default:
      return state
  }
}

// Context
interface ProfileContextValue {
  state: ProfileFormState
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
  completeOnboarding: () => void
  // Calculadoras
  calculateDailyCalories: (activityLevel: ActivityLevel) => number | null
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

// Provider
interface ProfileProviderProps {
  children: ReactNode
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [state, dispatch] = useReducer(profileReducer, initialState)

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

  const completeOnboarding = useCallback(() => {
    dispatch({ type: 'COMPLETE_ONBOARDING' })
  }, [])

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
