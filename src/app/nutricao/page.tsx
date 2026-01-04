'use client'

import { Header } from '@/components/Header'
import { NutritionProvider } from '@/contexts/NutritionContext'
import { NutritionWizard } from '@/components/nutrition/NutritionWizard'

export default function NutricaoPage() {
  return (
    <>
      <Header />
      <NutritionProvider>
        <NutritionWizard />
      </NutritionProvider>
    </>
  )
}
