'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GeneratePage() {
  const [content, setContent] = useState('')
  const [template, setTemplate] = useState('standard')
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const templates = [
    { id: 'standard', name: '标准格式', desc: '适用于大多数场景' },
    { id: 'project', name: '项目格式', desc: '按项目分类' },
    { id: 'simple', name: '简洁格式', desc: '快速汇报' },
  ]

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('请输入工作内容')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, template })
      })
      const data = await response.json()
      if (data.report) {
        setReport(data.report)
      } else {
        alert('生成失败：' + (data.error || '未知错误'))
      }
    } catch (error) {
      console.error('生成失败:', error)
      alert('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExportWord = async () => {
    if (!report) return
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: report, format: 'word' })
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '周报.docx'
      a.click()
    } catch (error) {
      alert('导出失败')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-gray-800">AI周报助手</span>
          </Link>
          <div className="text-sm text-gray-500">每日免费3次</div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">📝 输入工作内容</h2>

            {/* 模板选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">选择模板</label>
              <div className="flex space-x-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm ${
                      template === t.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs mt-1 opacity-80">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 内容输入 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                本周工作内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={`请在这里输入本周的工作内容...

例如：
周一：完成了用户调研报告，访谈了10位用户
周二：开了产品评审会，确定了新功能方案
周三：写代码实现了登录功能
周四：修复了3个bug
周五：准备下周的演示PPT

💡 小技巧：写得越详细，生成的周报越完整`}
              />
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className={`w-full py-4 rounded-lg text-lg font-medium ${
                loading || !content.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI正在生成周报...
                </span>
              ) : (
                '✨ 生成周报'
              )}
            </button>
          </div>

          {/* 右侧：预览区域 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">📋 周报预览</h2>
              {report && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
                  >
                    {copied ? '✓ 已复制' : '复制'}
                  </button>
                  <button
                    onClick={handleExportWord}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    导出Word
                  </button>
                </div>
              )}
            </div>

            {report ? (
              <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {report}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-400">
                <div className="text-4xl mb-4">📝</div>
                <p>在左侧输入工作内容，点击"生成周报"</p>
                <p className="text-sm mt-2">AI将自动为你生成专业的周报</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
