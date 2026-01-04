// Tipos para o módulo de Nutrição

export interface FoodPreferences {
  // Alimentos que o usuário não gosta
  dislikedFoods: string[]
  // Alimentos que não quer parar de comer
  mustHaveFoods: string[]
  // Restrições alimentares (alergias, intolerâncias)
  restrictions: string[]
  // Preferência de tipo de dieta
  dietStyle?: DietStyle
}

// Itens disponíveis na geladeira/despensa do usuário
export interface FridgeInventory {
  // Lista de itens em texto (cada linha um item)
  items: string[]
  // Se a dieta deve usar apenas esses itens
  useOnlyFridgeItems: boolean
  // Última atualização
  updatedAt?: Date
}

export type DietStyle =
  | 'tradicional'      // Dieta brasileira tradicional
  | 'low_carb'         // Baixo carboidrato
  | 'cetogenica'       // Cetogênica
  | 'mediterranea'     // Mediterrânea
  | 'vegetariana'      // Vegetariana
  | 'vegana'           // Vegana
  | 'flexivel'         // Flexível (IIFYM)

export interface DietGoal {
  // Objetivo principal
  type: 'perda_peso' | 'ganho_massa' | 'manutencao' | 'recomposicao'
  // Intensidade do déficit/superávit
  intensity: 'leve' | 'moderado' | 'agressivo'
  // Peso atual
  currentWeight: number
  // Peso alvo
  targetWeight: number
  // Data alvo (opcional)
  targetDate?: Date
  // Calorias customizadas (opcional - sobrescreve cálculo automático)
  customCalories?: number
  // Se está usando calorias customizadas
  useCustomCalories?: boolean
}

export interface MealPlan {
  // Número de refeições por dia
  mealsPerDay: number
  // Horários das refeições (opcional)
  mealTimes?: string[]
  // Incluir lanches
  includeSnacks: boolean
  // Preparar marmitas (meal prep)
  mealPrep: boolean
}

export interface NutritionTargets {
  // Calorias diárias
  calories: number
  // Macros em gramas
  protein: number
  carbs: number
  fat: number
  // Macros em porcentagem
  proteinPercent: number
  carbsPercent: number
  fatPercent: number
  // Fibras
  fiber: number
  // Água (litros)
  water: number
}

export interface Meal {
  id: string
  name: string
  time?: string
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export interface FoodItem {
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
  notes?: string
  // Opções alternativas de alimentos (para variar)
  alternatives?: FoodAlternative[]
}

export interface FoodAlternative {
  name: string
  quantity: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

// Registro de refeição consumida
export interface MealLog {
  id: string
  date: Date
  mealName: string  // "Café da Manhã", "Almoço", etc.
  foods: ConsumedFood[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  createdAt: Date
}

export interface ConsumedFood {
  name: string
  quantity: string  // em gramas ou medida
  grams: number     // quantidade em gramas para cálculo
  calories: number
  protein: number
  carbs: number
  fat: number
  isCustom: boolean // true se foi digitado pelo usuário
}

// Consumo diário
export interface DailyConsumption {
  date: string  // YYYY-MM-DD
  userId: string
  mealLogs: MealLog[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
}

export interface DailyDiet {
  date: string  // Data no formato DD/MM/YYYY
  dayOfWeek: DayOfWeek
  dayName: string
  meals: Meal[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  waterGoal: number
  tips?: string[]
}

export type DayOfWeek =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo'

export interface WeeklyDiet {
  id: string
  userId: string
  weekNumber: number
  year: number
  startDate: Date
  days: DailyDiet[]
  nutritionTargets: NutritionTargets
  createdAt: Date
  updatedAt: Date
}

export interface WeightProjection {
  // Déficit/superávit calórico diário
  dailyCalorieDeficit: number
  // Perda/ganho esperado por semana (kg)
  weeklyChange: number
  // Semanas estimadas para atingir objetivo
  weeksToGoal: number
  // Data estimada para atingir objetivo
  estimatedDate: Date
  // Marcos intermediários
  milestones: WeightMilestone[]
}

export interface WeightMilestone {
  week: number
  date: Date
  expectedWeight: number
  percentageComplete: number
  celebration?: string
}

export interface NutritionProfile {
  id: string
  userId: string
  // Preferências alimentares
  foodPreferences: FoodPreferences
  // Objetivo da dieta
  dietGoal: DietGoal
  // Plano de refeições
  mealPlan: MealPlan
  // Metas nutricionais calculadas
  nutritionTargets: NutritionTargets
  // Projeção de peso
  weightProjection: WeightProjection
  // Inventário da geladeira/despensa
  fridgeInventory?: FridgeInventory
  // Dieta atual gerada
  currentDiet?: WeeklyDiet
  // Histórico de dietas
  dietHistory: WeeklyDiet[]
  // Status
  isConfigured: boolean
  createdAt: Date
  updatedAt: Date
}

// Estado do contexto de nutrição
export interface NutritionState {
  // Dados do perfil de nutrição
  nutritionProfile: Partial<NutritionProfile>
  // Passo atual do wizard
  currentStep: NutritionStep
  // Passos completados
  completedSteps: NutritionStep[]
  // Status de carregamento
  isLoading: boolean
  isGeneratingDiet: boolean
  isSaving: boolean
  // Erros
  error: string | null
  // Dieta sendo visualizada
  selectedDay: DayOfWeek
  // Está em modo de edição (dieta já existe)
  isEditing: boolean
}

export type NutritionStep =
  | 'objetivo'
  | 'preferencias'
  | 'refeicoes'
  | 'revisao'
  | 'dieta_gerada'

// Ações do reducer
export type NutritionAction =
  | { type: 'SET_STEP'; payload: NutritionStep }
  | { type: 'COMPLETE_STEP'; payload: NutritionStep }
  | { type: 'UPDATE_DIET_GOAL'; payload: Partial<DietGoal> }
  | { type: 'UPDATE_FOOD_PREFERENCES'; payload: Partial<FoodPreferences> }
  | { type: 'UPDATE_MEAL_PLAN'; payload: Partial<MealPlan> }
  | { type: 'UPDATE_FRIDGE_INVENTORY'; payload: Partial<FridgeInventory> }
  | { type: 'SET_NUTRITION_TARGETS'; payload: NutritionTargets }
  | { type: 'SET_WEIGHT_PROJECTION'; payload: WeightProjection }
  | { type: 'SET_WEEKLY_DIET'; payload: WeeklyDiet }
  | { type: 'SET_SELECTED_DAY'; payload: DayOfWeek }
  | { type: 'LOAD_PROFILE'; payload: NutritionProfile }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'RESET' }

// Opções predefinidas para UI
export const FOOD_CATEGORIES = {
  proteinas: {
    label: 'Proteínas',
    icon: '🥩',
    items: [
      'Frango', 'Carne bovina', 'Peixe', 'Ovos', 'Porco',
      'Camarão', 'Atum', 'Sardinha', 'Peru', 'Tofu'
    ]
  },
  carboidratos: {
    label: 'Carboidratos',
    icon: '🍚',
    items: [
      'Arroz', 'Macarrão', 'Pão', 'Batata', 'Batata doce',
      'Mandioca', 'Aveia', 'Tapioca', 'Cuscuz', 'Quinoa'
    ]
  },
  verduras: {
    label: 'Verduras e Legumes',
    icon: '🥗',
    items: [
      'Brócolis', 'Couve', 'Espinafre', 'Alface', 'Tomate',
      'Cenoura', 'Abobrinha', 'Berinjela', 'Pepino', 'Pimentão'
    ]
  },
  frutas: {
    label: 'Frutas',
    icon: '🍎',
    items: [
      'Banana', 'Maçã', 'Laranja', 'Morango', 'Uva',
      'Mamão', 'Melancia', 'Abacaxi', 'Manga', 'Kiwi'
    ]
  },
  laticinios: {
    label: 'Laticínios',
    icon: '🧀',
    items: [
      'Leite', 'Queijo', 'Iogurte', 'Requeijão', 'Cream cheese',
      'Cottage', 'Manteiga', 'Leite sem lactose'
    ]
  },
  outros: {
    label: 'Outros',
    icon: '🥜',
    items: [
      'Amendoim', 'Castanhas', 'Azeite', 'Chocolate',
      'Café', 'Refrigerante', 'Suco', 'Cerveja', 'Vinho'
    ]
  }
}

export const DIET_STYLES: Record<DietStyle, { label: string; description: string; icon: string }> = {
  tradicional: {
    label: 'Tradicional Brasileira',
    description: 'Arroz, feijão, proteína e salada. O clássico que funciona!',
    icon: '🇧🇷'
  },
  low_carb: {
    label: 'Low Carb',
    description: 'Redução de carboidratos, mais proteínas e gorduras boas.',
    icon: '🥑'
  },
  cetogenica: {
    label: 'Cetogênica',
    description: 'Muito baixo carbo, alto em gorduras. Foco em cetose.',
    icon: '🥓'
  },
  mediterranea: {
    label: 'Mediterrânea',
    description: 'Rica em azeite, peixes, grãos e vegetais frescos.',
    icon: '🫒'
  },
  vegetariana: {
    label: 'Vegetariana',
    description: 'Sem carnes, com ovos e laticínios.',
    icon: '🥬'
  },
  vegana: {
    label: 'Vegana',
    description: 'Apenas alimentos de origem vegetal.',
    icon: '🌱'
  },
  flexivel: {
    label: 'Flexível (IIFYM)',
    description: 'Come o que quiser, desde que bata os macros!',
    icon: '⚖️'
  }
}

export const INTENSITY_OPTIONS = {
  leve: {
    label: 'Leve',
    description: 'Déficit de ~300kcal. Perda de ~0.3kg/semana',
    deficit: 300,
    weeklyLoss: 0.3,
    color: 'text-green-400'
  },
  moderado: {
    label: 'Moderado',
    description: 'Déficit de ~500kcal. Perda de ~0.5kg/semana',
    deficit: 500,
    weeklyLoss: 0.5,
    color: 'text-yellow-400'
  },
  agressivo: {
    label: 'Agressivo',
    description: 'Déficit de ~750kcal. Perda de ~0.75kg/semana',
    deficit: 750,
    weeklyLoss: 0.75,
    color: 'text-red-400'
  }
}

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'segunda', label: 'Segunda-feira', short: 'Seg' },
  { key: 'terca', label: 'Terça-feira', short: 'Ter' },
  { key: 'quarta', label: 'Quarta-feira', short: 'Qua' },
  { key: 'quinta', label: 'Quinta-feira', short: 'Qui' },
  { key: 'sexta', label: 'Sexta-feira', short: 'Sex' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  { key: 'domingo', label: 'Domingo', short: 'Dom' }
]
