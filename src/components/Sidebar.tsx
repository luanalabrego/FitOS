'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  X,
  Home,
  User,
  Utensils,
  Dumbbell,
  TrendingUp,
  Calendar,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { Logo } from './Logo'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const MENU_ITEMS = [
  {
    section: 'Principal',
    items: [
      { href: '/', icon: Home, label: 'Início', color: 'text-gray-400' },
      { href: '/perfil', icon: User, label: 'Meu Perfil', color: 'text-blue-400' },
    ]
  },
  {
    section: 'Módulos',
    items: [
      {
        href: '/nutricao',
        icon: Utensils,
        label: 'Nutrição',
        color: 'text-green-400',
        badge: 'Novo',
        badgeColor: 'bg-green-500'
      },
      {
        href: '/treino',
        icon: Dumbbell,
        label: 'Treino',
        color: 'text-orange-400',
        disabled: true,
        badge: 'Em breve'
      },
      {
        href: '/progresso',
        icon: TrendingUp,
        label: 'Progresso',
        color: 'text-purple-400',
        disabled: true,
        badge: 'Em breve'
      },
      {
        href: '/agenda',
        icon: Calendar,
        label: 'Agenda',
        color: 'text-cyan-400',
        disabled: true,
        badge: 'Em breve'
      },
    ]
  },
  {
    section: 'Outros',
    items: [
      { href: '/configuracoes', icon: Settings, label: 'Configurações', color: 'text-gray-400', disabled: true },
      { href: '/ajuda', icon: HelpCircle, label: 'Ajuda', color: 'text-gray-400', disabled: true },
    ]
  }
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  // Fechar sidebar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevenir scroll do body quando sidebar está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 bg-gray-900 border-r border-gray-800
          z-50 transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header do Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Logo size="sm" />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
          {MENU_ITEMS.map((section) => (
            <div key={section.section}>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3 px-3">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isDisabled = 'disabled' in item && item.disabled

                  if (isDisabled) {
                    return (
                      <div
                        key={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 cursor-not-allowed opacity-60"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                        ${isActive
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : item.color}`} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {'badge' in item && item.badge && (
                        <span className={`text-xs px-2 py-0.5 ${'badgeColor' in item ? item.badgeColor : 'bg-gray-700'} text-white rounded-full flex items-center gap-1`}>
                          <Sparkles className="w-3 h-3" />
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer do Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-xl border border-primary-500/20">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">FitOS Pro</p>
              <p className="text-xs text-gray-400">Em breve!</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
