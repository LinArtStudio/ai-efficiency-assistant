'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'

interface UserProfile {
  email: string
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setSupabaseConfigured(false)
      setLoading(false)
      return
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({
          email: user.email || '',
          created_at: user.created_at
        })
      }
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser({
            email: session.user.email || '',
            created_at: session.user.created_at
          })
        } else {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = getSupabase()
    if (supabase) {
      await supabase.auth.signOut()
    }
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">🚀 职场AI效率工具箱</h1>
            <p className="text-gray-500 mb-6">用户系统暂未开放</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">🚀 职场AI效率工具箱</h1>
            <p className="text-gray-500 mb-6">请先登录后使用完整功能</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🚀 职场AI效率工具箱</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">👤 用户信息</h2>
          <div className="space-y-2">
            <p><span className="text-gray-500">邮箱：</span>{user.email}</p>
            <p><span className="text-gray-500">注册时间：</span>{new Date(user.created_at).toLocaleDateString('zh-CN')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-bold mb-2">AI周报生成</h3>
            <p className="text-gray-500">3分钟生成专业周报</p>
          </Link>

          <Link
            href="/"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-4">🎤</div>
            <h3 className="text-lg font-bold mb-2">会议纪要</h3>
            <p className="text-gray-500">自动提取会议要点</p>
          </Link>

          <Link
            href="/"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-4">✉️</div>
            <h3 className="text-lg font-bold mb-2">AI邮件</h3>
            <p className="text-gray-500">生成专业商务邮件</p>
          </Link>

          <Link
            href="/"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-lg font-bold mb-2">文案润色</h3>
            <p className="text-gray-500">优化文案表达</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
