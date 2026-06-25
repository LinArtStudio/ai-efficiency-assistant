'use client'

import { useState } from 'react'

// 功能模块配置
const modules = [
  { id: 'weekly', name: '📊 AI周报', placeholder: '粘贴本周工作内容，AI帮你生成专业周报...', templates: [
    { id: 'standard', name: '标准格式' },
    { id: 'project', name: '项目格式' },
    { id: 'simple', name: '简洁格式' }
  ]},
  { id: 'meeting', name: '🎤 会议纪要', placeholder: '粘贴会议内容或录音转写，AI帮你提取要点...' },
  { id: 'email', name: '✉️ AI邮件', placeholder: '描述邮件需求，AI帮你生成专业邮件...', templates: [
    { id: 'business', name: '商务邮件' },
    { id: 'follow_up', name: '跟进邮件' },
    { id: 'thank_you', name: '感谢邮件' }
  ]},
  { id: 'polish', name: '✨ 文案润色', placeholder: '粘贴需要润色的文案，AI帮你优化表达...' },
  { id: 'translate', name: '🌐 AI翻译', placeholder: '输入需要翻译的内容，自动识别中英文...', templates: [
    { id: 'auto', name: '自动识别' },
    { id: 'en2zh', name: '英→中' },
    { id: 'zh2en', name: '中→英' }
  ]}
]

export default function Home() {
  const [activeModule, setActiveModule] = useState('weekly')
  const [content, setContent] = useState('')
  const [template, setTemplate] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentModule = modules.find(m => m.id === activeModule) || modules[0]

  const handleGenerate = async () => {
    if (!content.trim()) {
      alert('请输入内容')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeModule,
          content,
          template: template || (currentModule.templates?.[0]?.id || '')
        })
      })

      const data = await response.json()

      if (data.error) {
        alert(data.error)
      } else {
        setResult(data.result)
      }
    } catch (error) {
      alert('生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentModule.name.replace(/[^\u4e00-\u9fa5]/g, '')}-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">🚀 职场AI效率工具箱</h1>
          <p className="text-gray-500 mt-1">周报/邮件/会议纪要，一键搞定</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 功能Tab */}
        <div className="flex flex-wrap gap-2 mb-6">
          {modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => {
                setActiveModule(mod.id)
                setTemplate(mod.templates?.[0]?.id || '')
                setResult('')
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeModule === mod.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50'
              }`}
            >
              {mod.name}
            </button>
          ))}
        </div>

        {/* 模板选择 */}
        {currentModule.templates && (
          <div className="flex gap-2 mb-4">
            {currentModule.templates.map(t => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`px-3 py-1 rounded text-sm ${
                  template === t.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* 输入区 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">📝 输入内容</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={currentModule.placeholder}
              className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {content.length} 字
              </span>
              <button
                onClick={handleGenerate}
                disabled={loading || !content.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? '⏳ 生成中...' : '✨ 一键生成'}
              </button>
            </div>
          </div>

          {/* 结果区 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">📋 生成结果</h2>
            {result ? (
              <>
                <div className="h-64 overflow-auto p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {result}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                  >
                    {copied ? '✅ 已复制' : '📋 复制'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    📥 下载.md
                  </button>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                等待生成...
              </div>
            )}
          </div>
        </div>

        {/* 使用统计 */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">📊 使用统计</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">0</div>
              <div className="text-gray-500">已生成次数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">0 小时</div>
              <div className="text-gray-500">累计节省时间</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">¥0</div>
              <div className="text-gray-500">节省时间价值</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500">
          <p>© 2026 职场AI效率工具箱 - 让每个人都用得起AI</p>
        </div>
      </footer>
    </div>
  )
}
