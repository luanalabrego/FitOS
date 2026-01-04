'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, User, Check } from 'lucide-react'
import { Logo } from '@/components'
import { Button, Input } from '@/components/ui'
import { signUpWithEmail } from '@/services/authService'

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Validação da força da senha
  const passwordStrength = {
    hasMinLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }

  const isPasswordStrong = Object.values(passwordStrength).filter(Boolean).length >= 3

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Digite seu nome')
      return false
    }
    if (name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres')
      return false
    }
    if (!email.trim()) {
      setError('Digite seu email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Digite um email válido')
      return false
    }
    if (!password) {
      setError('Digite uma senha')
      return false
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return false
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
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
      await signUpWithEmail(email, password, name.trim())
      router.push('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
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
            href="/login"
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
            <h1 className="text-2xl font-bold mb-2">Crie sua conta</h1>
            <p className="text-gray-400">
              Comece sua jornada fitness hoje
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <Input
                label="Nome"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                required
                autoComplete="name"
              />
              <User className="absolute right-4 top-[42px] w-5 h-5 text-gray-500" />
            </div>

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
                autoComplete="new-password"
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

            {/* Password Strength Indicators */}
            {password && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        Object.values(passwordStrength).filter(Boolean).length >= level
                          ? level <= 2
                            ? 'bg-orange-500'
                            : 'bg-primary-500'
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${passwordStrength.hasMinLength ? 'text-primary-400' : 'text-gray-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>6+ caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasUppercase ? 'text-primary-400' : 'text-gray-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Letra maiúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasLowercase ? 'text-primary-400' : 'text-gray-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Letra minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-primary-400' : 'text-gray-500'}`}>
                    <Check className="w-3 h-3" />
                    <span>Número</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <Input
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError('')
                }}
                required
                autoComplete="new-password"
                error={
                  confirmPassword && password !== confirmPassword
                    ? 'As senhas não coincidem'
                    : undefined
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[42px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
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
              icon={UserPlus}
              iconPosition="right"
            >
              Criar Conta
            </Button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link href="#" className="text-primary-400 hover:text-primary-300">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="#" className="text-primary-400 hover:text-primary-300">
                Política de Privacidade
              </Link>
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Já tem uma conta?
            </p>
            <Link href="/login">
              <Button variant="outline" fullWidth>
                Fazer login
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </main>
  )
}
