'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components'
import { Button, Input } from '@/components/ui'
import { signInWithEmail } from '@/services/authService'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Digite seu email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Digite um email válido')
      return false
    }
    if (!password) {
      setError('Digite sua senha')
      return false
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await signInWithEmail(email, password)
      router.push('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <Link
            href="/"
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-400" />
          </Link>

          <Logo size="sm" />

          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 flex flex-col justify-center pt-20 pb-8 px-4 max-w-lg mx-auto w-full">
        <div className="animate-fade-in">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/30 blur-3xl rounded-full scale-150" />
                <Logo size="lg" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta!</h1>
            <p className="text-gray-400">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                required
                autoComplete="email"
              />
              <Mail className="absolute right-4 top-[42px] w-5 h-5 text-gray-500" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/esqueci-senha"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-fade-in">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              icon={LogIn}
              iconPosition="right"
            >
              Entrar
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Ainda não tem uma conta?
            </p>
            <Link href="/cadastro">
              <Button variant="outline" fullWidth>
                Criar conta grátis
              </Button>
            </Link>
          </div>

          {/* Continue without login */}
          <div className="mt-6 text-center">
            <Link
              href="/perfil"
              className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
            >
              Continuar sem conta
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </main>
  )
}
