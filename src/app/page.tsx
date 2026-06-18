'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-gray-800">AI周报助手</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/generate" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              开始使用
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            3分钟生成专业周报
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            告别加班写周报！AI帮你自动整理工作内容，生成结构清晰、语言专业的周报
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/generate" className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 shadow-lg">
              免费体验 →
            </Link>
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg text-lg border border-blue-600 hover:bg-blue-50"
            >
              查看演示
            </button>
          </div>
        </div>
      </section>

      {/* 演示区域 */}
      {showDemo && (
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">效果演示</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 输入 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">📝 输入（你的工作内容）</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-gray-600">
                  <p>周一：完成了用户调研报告，访谈了10位用户</p>
                  <p>周二：开了产品评审会，确定了新功能方案</p>
                  <p>周三：写代码实现了登录功能</p>
                  <p>周四：修复了3个bug</p>
                  <p>周五：准备下周的演示PPT</p>
                </div>
              </div>
              {/* 输出 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">✨ 输出（AI生成的周报）</h3>
                <div className="bg-blue-50 rounded-lg p-4 text-gray-700">
                  <p className="font-semibold mb-2">【本周工作总结】</p>
                  <p className="mb-1">一、重点工作完成情况</p>
                  <p className="ml-4 mb-1">1. 用户调研报告（完成度：100%）</p>
                  <p className="ml-8 mb-1">- 完成10位用户深度访谈</p>
                  <p className="ml-8 mb-2">- 输出调研报告，提交产品团队</p>
                  <p className="ml-4 mb-1">2. 登录功能开发（完成度：80%）</p>
                  <p className="ml-8 mb-1">- 完成前端页面开发</p>
                  <p className="ml-8 mb-2">- 完成后端API对接</p>
                  <p className="mb-1">二、下周工作计划</p>
                  <p className="ml-4">1. 完成登录功能的第三方集成</p>
                  <p className="ml-4">2. 准备产品演示PPT</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 功能特点 */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">为什么选择AI周报助手？</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">极速生成</h3>
            <p className="text-gray-600">3分钟生成完整周报，告别加班写周报</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">智能优化</h3>
            <p className="text-gray-600">AI自动提炼亮点，突出工作成果</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-2">多格式导出</h3>
            <p className="text-gray-600">支持Word、PDF、纯文本一键导出</p>
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center text-white">
            <div>
              <div className="text-4xl font-bold">3分钟</div>
              <div className="text-blue-200">生成时间</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10+</div>
              <div className="text-blue-200">模板选择</div>
            </div>
            <div>
              <div className="text-4xl font-bold">99%</div>
              <div className="text-blue-200">用户满意度</div>
            </div>
          </div>
        </div>
      </section>

      {/* 使用场景 */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">适合谁用？</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-4">👩‍💼</div>
            <h3 className="text-xl font-semibold mb-2">职场新人</h3>
            <p className="text-gray-600">不知道怎么写周报？AI帮你快速上手，写出专业周报</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-4">👨‍💻</div>
            <h3 className="text-xl font-semibold mb-2">职场老手</h3>
            <p className="text-gray-600">写周报太耗时？AI帮你3分钟搞定，省出时间做更有价值的事</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-4">👩‍🏫</div>
            <h3 className="text-xl font-semibold mb-2">团队管理者</h3>
            <p className="text-gray-600">团队周报格式不统一？AI帮你标准化，提升管理效率</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好了吗？</h2>
          <p className="text-xl text-gray-600 mb-8">免费体验，无需注册</p>
          <Link href="/generate" className="px-10 py-4 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 shadow-lg inline-block">
            立即开始 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 AI周报助手. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Made with ❤️ by AI</p>
        </div>
      </footer>
    </main>
  )
}
