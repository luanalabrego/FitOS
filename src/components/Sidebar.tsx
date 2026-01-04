'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  X,
  Dumbbell,
  Apple,
  TrendingUp,
  User,
  Settings,
  LogOut,
  Home,
  Target,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { Logo } from './Logo'
import { getCurrentUser, signOut, isEmailUser } from '@/services/authService'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  icon: React.ElementType
  label: string
  href: string
  description?: string
  comingSoon?: boolean
}

const mainModules: MenuItem[] = [
  {
    icon: Home,
    label: 'Inicio',
    href: '/',
    description: 'Pagina inicial',
  },
  {
    icon: Dumbbell,
    label: 'Treinos',
    href: '/treinos',
    description: 'Seus treinos personalizados',
    comingSoon: true,
  },
  {
    icon: Apple,
    label: 'Alimentacao',
    href: '/alimentacao',
    description: 'Plano alimentar',
    comingSoon: true,
  },
  {
    icon: TrendingUp,
    label: 'Progresso',
    href: '/progresso',
    description: 'Acompanhe sua evolucao',
    comingSoon: true,
  },
  {
    icon: Calendar,
    label: 'Rotina',
    href: '/rotina',
    description: 'Sua agenda fitness',
    comingSoon: true,
  },
  {
    icon: BarChart3,
    label: 'Metricas',
    href: '/metricas',
    description: 'Dados e estatisticas',
    comingSoon: true,
  },
]

const userModules: MenuItem[] = [
  {
    icon: User,
    label: 'Meu Perfil',
    href: '/perfil',
    description: 'Configurar perfil',
  },
  {
    icon: Target,
    label: 'Objetivos',
    href: '/perfil',
    description: 'Definir metas',
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter()
  const user = getCurrentUser()
  const isLoggedIn = user && !user.isAnonymous
  const [mounted, setMounted] = useState(false)

  // Montar no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fechar sidebar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleNavigation = (href: string, comingSoon?: boolean) => {
    if (comingSoon) {
      return
    }
    onClose()
    router.push(href)
  }

  if (!isOpen || !mounted) return null

  const sidebarContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-800 z-[9999] animate-slide-in-left overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* User Info */}
        {isLoggedIn && (
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Foto do perfil"
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Modules */}
        <div className="p-4">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
            Modulos
          </p>
          <nav className="space-y-1">
            {mainModules.map((item) => (
              <button
                key={item.href + item.label}
                onClick={() => handleNavigation(item.href, item.comingSoon)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                  item.comingSoon
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-800'
                }`}
                disabled={item.comingSoon}
              >
                <div className={`p-2 rounded-lg ${
                  item.comingSoon ? 'bg-gray-800' : 'bg-primary-500/20'
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.comingSoon ? 'text-gray-500' : 'text-primary-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      item.comingSoon ? 'text-gray-500' : 'text-white'
                    }`}>
                      {item.label}
                    </span>
                    {item.comingSoon && (
                      <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">
                        Em breve
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* User Modules */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-medium mb-3">
            Configuracoes
          </p>
          <nav className="space-y-1">
            {userModules.map((item) => (
              <button
                key={item.href + item.label}
                onClick={() => handleNavigation(item.href, item.comingSoon)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-800 transition-colors text-left"
              >
                <div className="p-2 rounded-lg bg-gray-800">
                  <item.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        {isLoggedIn && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-left"
            >
              <div className="p-2 rounded-lg bg-red-500/10">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-sm font-medium text-red-400">
                Sair da conta
              </span>
            </button>
          </div>
        )}

        {/* Login prompt for anonymous users */}
        {!isLoggedIn && (
          <div className="p-4 border-t border-gray-800">
            <Link
              href="/login"
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl transition-colors text-white font-medium"
            >
              Fazer Login
            </Link>
          </div>
        )}
      </div>
    </>
  )

  // Usar createPortal para renderizar fora do header
  return createPortal(sidebarContent, document.body)
}
