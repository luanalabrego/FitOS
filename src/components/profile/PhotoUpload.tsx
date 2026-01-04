'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Upload, X, User, Image as ImageIcon, Plus } from 'lucide-react'
import { ProfilePhoto } from '@/types/profile'
import { Button } from '@/components/ui'

interface PhotoUploadProps {
  type: 'profile' | 'progress'
  currentPhoto?: ProfilePhoto
  photos?: ProfilePhoto[]
  onUpload: (photo: ProfilePhoto) => void
  onRemove?: (id: string) => void
  maxPhotos?: number
}

export function PhotoUpload({
  type,
  currentPhoto,
  photos = [],
  onUpload,
  onRemove,
  maxPhotos = 4,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentPhoto?.url || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem.')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string

        if (type === 'profile') {
          setPreviewUrl(url)
        }

        const photo: ProfilePhoto = {
          id: `${type}-${Date.now()}`,
          url,
          date: new Date(),
          type,
        }

        onUpload(photo)
      }
      reader.readAsDataURL(file)
    },
    [type, onUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleRemovePhoto = useCallback(
    (id: string) => {
      if (type === 'profile') {
        setPreviewUrl(null)
      }
      onRemove?.(id)
    },
    [type, onRemove]
  )

  // Renderização para foto de perfil
  if (type === 'profile') {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Foto de Perfil
        </label>

        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <div className="relative">
            <div
              className={`
                w-24 h-24 rounded-full
                bg-gray-800/50
                border-2 ${previewUrl ? 'border-primary-500' : 'border-gray-700'}
                flex items-center justify-center
                overflow-hidden
              `}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-500" />
              )}
            </div>

            {previewUrl && (
              <button
                onClick={() => handleRemovePhoto(currentPhoto?.id || '')}
                className="absolute -top-1 -right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            <Button
              type="button"
              variant="secondary"
              icon={Camera}
              onClick={openFileDialog}
            >
              {previewUrl ? 'Alterar foto' : 'Adicionar foto'}
            </Button>

            <p className="text-sm text-gray-400 mt-2">
              JPG, PNG ou GIF. Máximo 5MB.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Renderização para fotos de progresso
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-200 mb-3">
        Fotos do Momento Atual
        <span className="text-gray-400 font-normal ml-2">
          (para comparativo posterior)
        </span>
      </label>

      <p className="text-sm text-gray-400 mb-4">
        Tire fotos de frente, lado e costas para acompanhar sua evolução.
        Recomendamos tirar as fotos sempre nas mesmas condições (mesma luz,
        mesma roupa, mesmo horário).
      </p>

      {/* Grid de fotos */}
      <div className="grid grid-cols-2 gap-4">
        {/* Fotos existentes */}
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-800/50 border border-gray-700"
          >
            <img
              src={photo.url}
              alt="Foto de progresso"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleRemovePhoto(photo.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-xs text-gray-300">
                {new Date(photo.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        ))}

        {/* Área para adicionar nova foto */}
        {photos.length < maxPhotos && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
            className={`
              aspect-[3/4] rounded-xl
              border-2 border-dashed
              ${isDragging ? 'border-primary-500 bg-primary-500/10' : 'border-gray-700'}
              flex flex-col items-center justify-center
              cursor-pointer
              transition-all duration-200
              hover:border-primary-500/50 hover:bg-gray-800/30
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="p-3 bg-gray-800/50 rounded-full mb-3">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>

            <p className="text-sm text-gray-400 text-center px-4">
              {isDragging ? 'Solte a imagem aqui' : 'Toque para adicionar'}
            </p>
          </div>
        )}
      </div>

      {/* Dica */}
      <div className="mt-4 p-3 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-primary-500 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300 font-medium">Dica</p>
            <p className="text-sm text-gray-400 mt-1">
              Fotos consistentes ajudam a visualizar seu progresso real. Tire
              fotos no mesmo local, com a mesma iluminação e usando roupas
              similares.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
