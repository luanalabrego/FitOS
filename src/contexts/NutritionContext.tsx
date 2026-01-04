'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import {
  NutritionState,
  NutritionAction,
  NutritionStep,
  NutritionProfile,
  DietGoal,
  FoodPreferences,
  MealPlan,
  NutritionTargets,
  WeightProjection,
  WeeklyDiet,
  DayOfWeek,
  FridgeInventory
} from '@/types/nutrition'
import { UserProfile } from '@/types/profile'
import {
  calculateNutritionTargets,
  calculateWeightProjection,
  generateDietWithGPT,
  saveNutritionProfile,
  getNutritionProfile,
  saveWeeklyDiet
} from '@/services/nutritionService'
import { getProfile } from '@/services/profileService'
import { ensureUser } from '@/services/authService'

// Estado inicial
const initialState: NutritionState = {
  nutritionProfile: {
    foodPreferences: {
      dislikedFoods: [],
      mustHaveFoods: [],
      restrictions: [],
      dietStyle: 'tradicional'
    },
    dietGoal: {
      type: 'perda_peso',
      intensity: 'moderado',
      currentWeight: 0,
      targetWeight: 0
    },
    mealPlan: {
      mealsPerDay: 5,
      includeSnacks: true,
      mealPrep: false
    },
    fridgeInventory: {
      items: [],
      useOnlyFridgeItems: false
    },
    isConfigured: false,
    dietHistory: []
  },
  currentStep: 'objetivo',
  completedSteps: [],
  isLoading: true,
  isGeneratingDiet: false,
  isSaving: false,
  error: null,
  selectedDay: 'segunda',
  isEditing: false
}

// Reducer
function nutritionReducer(state: NutritionState, action: NutritionAction): NutritionState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload }

    case 'COMPLETE_STEP':
      if (state.completedSteps.includes(action.payload)) {
        return state
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload]
      }

    case 'UPDATE_DIET_GOAL':
      return {
        ...state,
        nutritionProfile: {
          ...state.nutritionProfile,
          dietGoal: {
            ...state.nutritionProfile.dietGoal,
            ...action.payload
          } as DietGoal
        }
      }

    case 'UPDATE_FOOD_PREFERENCES':
      return {
        ...state,
        nutritionProfile: {
          ...state.nutritionProfile,
          foodPreferences: {
            ...state.nutritionProfile.foodPreferences,
            ...action.payload
          } as FoodPreferences
        }
      }

    case 'UPDATE_MEAL_PLAN':
      return {
        ...state,
        nutritionProfile: {
          ...state.nutritionProfile,
          mealPlan: {
            ...state.nutritionProfile.mealPlan,
            ...action.payload
          } as MealPlan
        }
      }

    case 'UPDATE_FRIDGE_INVENTORY':
      console.log('🧊 UPDATE_FRIDGE_INVENTORY:', action.payload)
      console.log('🧊 Estado anterior:', state.nutritionProfile.fridgeInventory)
      const newFridgeState = {
        ...state,
        nutritionProfile: {
          ...state.nutritionProfile,
          fridgeInventory: {
            ...state.nutritionProfile.fridgeInventory,
            ...action.payload
          } as FridgeInventory
        }
      }
      console.log('🧊 Novo estado fridgeInventory:', newFridgeState.nutritionProfile.fridgeInventory)
      return newFridgeState

    case 'SET_NUTRITION_TARGETS':
      return {
        ...state,
        nutritionProfile: {
          ...state.nutritionProfile,
          nutritionTargets: action.payload
        }
      }

    case 'SET_WEIGHT_PROJECTION':
      return {
        ...state,
        nutritionProfile: {
          ...state.nutritionProfile,
          weightProjection: action.payload
        }
      }

    case 'SET_WEEKLY_DIET':
      return {
        ...state,
        nutritionProfile: {
          ...state.nutritionProfile,
          currentDiet: action.payload,
          isConfigured: true
        }
      }

    case 'SET_SELECTED_DAY':
      return { ...state, selectedDay: action.payload }

    case 'LOAD_PROFILE':
      return {
        ...state,
        nutritionProfile: action.payload,
        isLoading: false,
        currentStep: action.payload.isConfigured ? 'dieta_gerada' : 'objetivo',
        completedSteps: action.payload.isConfigured
          ? ['objetivo', 'preferencias', 'refeicoes', 'revisao', 'dieta_gerada']
          : []
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_GENERATING':
      return { ...state, isGeneratingDiet: action.payload }

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'SET_EDITING':
      return { ...state, isEditing: action.payload }

    case 'RESET':
      return { ...initialState, isLoading: false }

    default:
      return state
  }
}

// Context
interface NutritionContextType {
  state: NutritionState
  userProfile: UserProfile | null
  dispatch: React.Dispatch<NutritionAction>
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: NutritionStep) => void
  calculateTargets: () => void
  generateDiet: (selectedDates?: Date[]) => Promise<void>
  regenerateDiet: () => Promise<void>
  saveDietChanges: () => Promise<void>
  startEditing: () => void
  cancelEditing: () => void
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined)

// Provider
interface NutritionProviderProps {
  children: ReactNode
}

const STEPS_ORDER: NutritionStep[] = ['objetivo', 'preferencias', 'refeicoes', 'revisao', 'dieta_gerada']

export function NutritionProvider({ children }: NutritionProviderProps) {
  const [state, dispatch] = useReducer(nutritionReducer, initialState)
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null)
  const [userId, setUserId] = React.useState<string | null>(null)

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        // Obter usuário
        const uid = await ensureUser()
        setUserId(uid)

        // Carregar perfil do usuário
        const profile = await getProfile(uid)
        if (profile && profile.id && profile.bodyComposition) {
          // Cast seguro após validação dos campos obrigatórios
          const validProfile = profile as UserProfile
          setUserProfile(validProfile)

          // Preencher dados do objetivo com base no perfil
          dispatch({
            type: 'UPDATE_DIET_GOAL',
            payload: {
              currentWeight: validProfile.bodyComposition.currentWeight,
              targetWeight: validProfile.targetWeight || validProfile.bodyComposition.currentWeight,
              type: validProfile.primaryGoal === 'ganho_massa' ? 'ganho_massa'
                : validProfile.primaryGoal === 'manutencao' ? 'manutencao'
                : validProfile.primaryGoal === 'recomposicao_corporal' ? 'recomposicao'
                : 'perda_peso'
            }
          })

          // Carregar restrições do perfil
          if (validProfile.diagnosis?.foodRestrictions) {
            dispatch({
              type: 'UPDATE_FOOD_PREFERENCES',
              payload: {
                restrictions: validProfile.diagnosis.foodRestrictions
              }
            })
          }

          // Carregar número de refeições do perfil
          if (validProfile.diagnosis?.mealsPerDay) {
            dispatch({
              type: 'UPDATE_MEAL_PLAN',
              payload: {
                mealsPerDay: validProfile.diagnosis.mealsPerDay
              }
            })
          }
        }

        // Carregar perfil de nutrição existente
        const nutritionProfile = await getNutritionProfile(uid)
        if (nutritionProfile) {
          dispatch({ type: 'LOAD_PROFILE', payload: nutritionProfile })
        }

        dispatch({ type: 'SET_LOADING', payload: false })
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar dados. Tente novamente.' })
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadData()
  }, [])

  // Navegação entre passos
  const nextStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(state.currentStep)
    if (currentIndex < STEPS_ORDER.length - 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep })
      dispatch({ type: 'SET_STEP', payload: STEPS_ORDER[currentIndex + 1] })
    }
  }

  const prevStep = () => {
    const currentIndex = STEPS_ORDER.indexOf(state.currentStep)
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: STEPS_ORDER[currentIndex - 1] })
    }
  }

  const goToStep = (step: NutritionStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }

  // Calcular metas nutricionais baseadas no estilo de dieta
  const calculateTargets = () => {
    if (!userProfile || !state.nutritionProfile.dietGoal) return

    // Pegar o estilo de dieta das preferências
    const dietStyle = state.nutritionProfile.foodPreferences?.dietStyle || 'tradicional'

    const targets = calculateNutritionTargets(
      userProfile,
      state.nutritionProfile.dietGoal as DietGoal,
      dietStyle
    )
    dispatch({ type: 'SET_NUTRITION_TARGETS', payload: targets })

    const tdee = userProfile.bodyComposition.dailyMetabolism || userProfile.bodyComposition.basalMetabolism || 2000
    const projection = calculateWeightProjection(
      state.nutritionProfile.dietGoal as DietGoal,
      targets,
      tdee
    )
    dispatch({ type: 'SET_WEIGHT_PROJECTION', payload: projection })
  }

  // Gerar dieta
  const generateDiet = async (selectedDates?: Date[]) => {
    if (!userProfile || !userId) return

    try {
      dispatch({ type: 'SET_GENERATING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      // Pegar o estilo de dieta das preferências
      const dietStyle = state.nutritionProfile.foodPreferences?.dietStyle || 'tradicional'

      // Calcular metas com o estilo de dieta correto
      const targets = calculateNutritionTargets(
        userProfile,
        state.nutritionProfile.dietGoal as DietGoal,
        dietStyle
      )
      dispatch({ type: 'SET_NUTRITION_TARGETS', payload: targets })

      // Calcular projeção de peso
      const tdee = userProfile.bodyComposition.dailyMetabolism || userProfile.bodyComposition.basalMetabolism || 2000
      const projection = calculateWeightProjection(
        state.nutritionProfile.dietGoal as DietGoal,
        targets,
        tdee
      )
      dispatch({ type: 'SET_WEIGHT_PROJECTION', payload: projection })

      // Gerar dieta com as metas recalculadas
      console.log('🍽️ Gerando dieta com fridgeInventory:', state.nutritionProfile.fridgeInventory)
      console.log('🍽️ useOnlyFridgeItems:', state.nutritionProfile.fridgeInventory?.useOnlyFridgeItems)
      console.log('🍽️ items:', state.nutritionProfile.fridgeInventory?.items)
      console.log('📅 Datas selecionadas:', selectedDates?.map(d => d.toLocaleDateString('pt-BR')))

      const diet = await generateDietWithGPT({
        userProfile,
        foodPreferences: state.nutritionProfile.foodPreferences as FoodPreferences,
        dietGoal: state.nutritionProfile.dietGoal as DietGoal,
        mealPlan: state.nutritionProfile.mealPlan as MealPlan,
        nutritionTargets: targets,  // Usar as metas recalculadas
        fridgeInventory: state.nutritionProfile.fridgeInventory as FridgeInventory,
        selectedDates
      })

      dispatch({ type: 'SET_WEEKLY_DIET', payload: diet })
      dispatch({ type: 'COMPLETE_STEP', payload: 'revisao' })
      dispatch({ type: 'SET_STEP', payload: 'dieta_gerada' })

      // Salvar no Firestore
      await saveWeeklyDiet(userId, diet)
      await saveNutritionProfile(userId, {
        ...state.nutritionProfile,
        currentDiet: diet,
        isConfigured: true,
        userId,
        id: userId
      } as NutritionProfile)

    } catch (error) {
      console.error('Erro ao gerar dieta:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao gerar dieta. Tente novamente.' })
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false })
    }
  }

  const regenerateDiet = async () => {
    // Resetar para o passo de revisão e gerar nova dieta
    dispatch({ type: 'SET_STEP', payload: 'revisao' })
    await generateDiet()
  }

  const saveDietChanges = async () => {
    if (!userId) return

    try {
      dispatch({ type: 'SET_SAVING', payload: true })
      await saveNutritionProfile(userId, state.nutritionProfile as NutritionProfile)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar alterações.' })
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }

  // Iniciar edição da dieta existente
  const startEditing = () => {
    dispatch({ type: 'SET_EDITING', payload: true })
    dispatch({ type: 'SET_STEP', payload: 'objetivo' })
  }

  // Cancelar edição e voltar para a dieta
  const cancelEditing = () => {
    dispatch({ type: 'SET_EDITING', payload: false })
    dispatch({ type: 'SET_STEP', payload: 'dieta_gerada' })
  }

  return (
    <NutritionContext.Provider
      value={{
        state,
        userProfile,
        dispatch,
        nextStep,
        prevStep,
        goToStep,
        calculateTargets,
        generateDiet,
        regenerateDiet,
        saveDietChanges,
        startEditing,
        cancelEditing
      }}
    >
      {children}
    </NutritionContext.Provider>
  )
}

// Hook
export function useNutrition() {
  const context = useContext(NutritionContext)
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider')
  }
  return context
}
