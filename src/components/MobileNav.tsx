'use client'

import { useState, useEffect } from 'react'

const navItems = [
  { id: 'weekly', icon: '📊', label: '周报' },
  { id: 'meeting', icon: '🎤', label: '会议' },
  { id: 'email', icon: '✉️', label: '邮件' },
  { id: 'polish', icon: '✨', label: '润色' },
  { id: 'translate', icon: '🌐', label: '翻译' },
  { id: 'ppt', icon: '📊', label: 'PPT' },
  { id: 'summary', icon: '📄', label: '总结' },
  { id: 'data', icon: '📈', label: '分析' },
]

interface MobileNavProps {
  activeModule: string
  onModuleChange: (moduleId: string) => void
}

export default function MobileNav({ activeModule, onModuleChange }: MobileNavProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isVisible) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden z-50">
      <div className="flex overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onModuleChange(item.id)}
            className={`flex-shrink-0 flex flex-col items-center py-2 px-3 min-w-[60px] ${
              activeModule === item.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
