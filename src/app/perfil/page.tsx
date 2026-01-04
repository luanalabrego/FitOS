'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { ProfileWizard } from '@/components/profile'

export default function PerfilPage() {
  const router = useRouter()

  const handleComplete = useCallback(() => {
    // Redireciona para a home após completar o perfil
    router.push('/')
  }, [router])

  return (
    <ProfileProvider>
      <ProfileWizard onComplete={handleComplete} />
    </ProfileProvider>
  )
}
