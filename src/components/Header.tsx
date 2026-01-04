'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, User, LogOut, LogIn } from 'lucide-react'
import { Logo } from './Logo'
import { getCurrentUser, onAuthChange, signOut, isEmailUser } from '@/services/authService'
import type { User as FirebaseUser } from 'firebase/auth'

export function Header() {
  const router = useRouter()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar usuário atual
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)

    // Ouvir mudanças na autenticação
    const unsubscribe = onAuthChange((newUser) => {
      setUser(newUser)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowDropdown(false)
      router.push('/')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const isLoggedIn = user && !user.isAnonymous

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Menu className="w-6 h-6 text-gray-400" />
        </button>

        <Link href="/">
          <Logo size="sm" />
        </Link>

        <div className="relative">
          {isLoading ? (
            // Loading state
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-gray-600 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : isLoggedIn ? (
            // Logged in - show user menu
            <>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Foto do perfil"
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-400" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 top-12 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white truncate">
                        {user.displayName || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/perfil"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            // Not logged in - show login button
            <Link
              href="/login"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogIn className="w-6 h-6 text-gray-400" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
