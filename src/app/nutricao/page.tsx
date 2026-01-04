'use client'

import { NutritionProvider } from '@/contexts/NutritionContext'
import { NutritionWizard } from '@/components/nutrition/NutritionWizard'

export default function NutricaoPage() {
  return (
    <NutritionProvider>
      <NutritionWizard />
    </NutritionProvider>
  )
}
