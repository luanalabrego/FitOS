'use client'

import { useCallback } from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'
import { useProfile } from '@/contexts/ProfileContext'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { PhotoUpload } from '../PhotoUpload'
import { ProfilePhoto } from '@/types/profile'

export function PhotosStep() {
  const { state, setProfilePhoto, addProgressPhoto, removeProgressPhoto } =
    useProfile()
  const { profile } = state

  const handleProfilePhotoUpload = useCallback(
    (photo: ProfilePhoto) => {
      setProfilePhoto(photo)
    },
    [setProfilePhoto]
  )

  const handleProgressPhotoUpload = useCallback(
    (photo: ProfilePhoto) => {
      addProgressPhoto(photo)
    },
    [addProgressPhoto]
  )

  const handleRemovePhoto = useCallback(
    (id: string) => {
      if (profile.profilePhoto?.id === id) {
        setProfilePhoto(undefined as unknown as ProfilePhoto)
      } else {
        removeProgressPhoto(id)
      }
    },
    [profile.profilePhoto, setProfilePhoto, removeProgressPhoto]
  )

  return (
    <div className="space-y-6">
      {/* Foto de Perfil */}
      <Card>
        <CardHeader
          title="Foto de Perfil"
          description="Uma foto sua para identificação no app"
          icon={<Camera className="w-5 h-5" />}
        />
        <CardContent>
          <PhotoUpload
            type="profile"
            currentPhoto={profile.profilePhoto}
            onUpload={handleProfilePhotoUpload}
            onRemove={handleRemovePhoto}
          />
        </CardContent>
      </Card>

      {/* Fotos de Progresso */}
      <Card>
        <CardHeader
          title="Fotos de Progresso"
          description="Registre seu momento atual para comparar depois"
          icon={<ImageIcon className="w-5 h-5" />}
        />
        <CardContent>
          <PhotoUpload
            type="progress"
            photos={profile.progressPhotos}
            onUpload={handleProgressPhotoUpload}
            onRemove={handleRemovePhoto}
            maxPhotos={4}
          />
        </CardContent>
      </Card>

      {/* Info sobre privacidade */}
      <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <p className="text-sm text-gray-400">
          <strong className="text-gray-300">Privacidade:</strong> Suas fotos são
          armazenadas apenas localmente no seu dispositivo. Elas não são
          enviadas para nenhum servidor externo e só você tem acesso a elas.
        </p>
      </div>
    </div>
  )
}
