'use client'

import { Menu, User } from 'lucide-react'
import { Logo } from './Logo'

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <Menu className="w-6 h-6 text-gray-400" />
        </button>

        <Logo size="sm" />

        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
          <User className="w-6 h-6 text-gray-400" />
        </button>
      </div>
    </header>
  )
}
