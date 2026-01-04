'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react'
import { Logo } from '@/components'
import { Button, Input } from '@/components/ui'
import { sendPasswordReset } from '@/services/authService'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('Digite seu email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Digite um email válido')
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
      await sendPasswordReset(email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar email')
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
        {success ? (
          // Success State
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-primary-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4">Email enviado!</h1>
            <p className="text-gray-400 mb-8">
              Enviamos um link de recuperação para{' '}
              <span className="text-white font-medium">{email}</span>.
              <br />
              Verifique sua caixa de entrada e spam.
            </p>

            <div className="space-y-4">
              <Link href="/login">
                <Button fullWidth>
                  Voltar para o login
                </Button>
              </Link>

              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                }}
                className="text-sm text-gray-500 hover:text-gray-400 transition-colors"
              >
                Usar outro email
              </button>
            </div>
          </div>
        ) : (
          // Form State
          <div className="animate-fade-in">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Esqueceu a senha?</h1>
              <p className="text-gray-400">
                Digite seu email e enviaremos um link para redefinir sua senha.
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
                  autoFocus
                />
                <Mail className="absolute right-4 top-[42px] w-5 h-5 text-gray-500" />
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
                icon={Send}
                iconPosition="right"
              >
                Enviar link de recuperação
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
    </main>
  )
}
