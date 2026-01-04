import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitOS - Seu Sistema Operacional Fitness',
  description: 'Centralize sua jornada fitness: treinos, alimentação e resultados em um só lugar. Ganhe massa, perca peso ou melhore seu condicionamento.',
  keywords: ['fitness', 'treino', 'alimentação', 'emagrecimento', 'hipertrofia', 'saúde'],
  authors: [{ name: 'FitOS Team' }],
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
