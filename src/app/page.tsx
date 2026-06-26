'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

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

// 使用统计接口
interface UsageStats {
  totalGenerations: number
  moduleCounts: Record<string, number>
  totalChars: number
}

// 从localStorage读取统计
function loadStats(): UsageStats {
  if (typeof window === 'undefined') return { totalGenerations: 0, moduleCounts: {}, totalChars: 0 }
  try {
    const saved = localStorage.getItem('ai-efficiency-stats')
    if (saved) return JSON.parse(saved)
  } catch {}
  return { totalGenerations: 0, moduleCounts: {}, totalChars: 0 }
}

// 保存统计到localStorage
function saveStats(stats: UsageStats) {
  try {
    localStorage.setItem('ai-efficiency-stats', JSON.stringify(stats))
  } catch {}
}

// 计算节省时间（小时）
function calcSavedHours(stats: UsageStats): number {
  const hoursMap: Record<string, number> = { weekly: 2, meeting: 1.5, email: 0.5, polish: 0.3, translate: 0.25 }
  let total = 0
  for (const [mod, count] of Object.entries(stats.moduleCounts)) {
    total += (hoursMap[mod] || 0.5) * count
  }
  return Math.round(total * 10) / 10
}

export default function Home() {
  const [activeModule, setActiveModule] = useState('weekly')
  const [content, setContent] = useState('')
  const [template, setTemplate] = useState('standard')
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<UsageStats>({ totalGenerations: 0, moduleCounts: {}, totalChars: 0 })
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentModule = modules.find(m => m.id === activeModule) || modules[0]
  const currentResult = results[activeModule] || ''

  // 加载统计
  useEffect(() => {
    setStats(loadStats())
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!content.trim()) {
      setError('请输入内容')
      return
    }
    if (content.trim().length < 10) {
      setError('内容太短，请至少输入10个字')
      return
    }
    if (content.length > 5000) {
      setError('内容过长，请控制在5000字以内')
      return
    }

    setLoading(true)
    setError('')
    const controller = new AbortController()
    abortRef.current = controller

    // 30秒超时
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeModule,
          content,
          template: template || (currentModule.templates?.[0]?.id || '')
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResults(prev => ({ ...prev, [activeModule]: data.result }))
        // 更新统计
        const newStats: UsageStats = {
          totalGenerations: stats.totalGenerations + 1,
          moduleCounts: { ...stats.moduleCounts, [activeModule]: (stats.moduleCounts[activeModule] || 0) + 1 },
          totalChars: stats.totalChars + content.length
        }
        setStats(newStats)
        saveStats(newStats)
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId)
      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('请求超时，请检查网络后重试')
      } else {
        setError('生成失败，请重试')
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [content, activeModule, template, currentModule, stats])

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentResult)
      } else {
        // HTTP降级方案
        const textarea = document.createElement('textarea')
        textarea.value = currentResult
        textarea.style.position = 'fixed'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('复制失败，请手动选择复制')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([currentResult], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().slice(0, 10)
    a.download = `${currentModule.name.replace(/[^\u4e00-\u9fa5]/g, '')}-${date}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setContent('')
    setError('')
  }

  const handleModuleSwitch = (moduleId: string) => {
    setActiveModule(moduleId)
    const mod = modules.find(m => m.id === moduleId)
    setTemplate(mod?.templates?.[0]?.id || '')
    setError('')
  }

  const savedHours = calcSavedHours(stats)
  const savedValue = Math.round(savedHours * 150)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">🚀 职场AI提效工具</h1>
          <p className="text-gray-500 mt-1">周报/邮件/会议纪要，一键搞定</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 功能Tab */}
        <div className="flex flex-wrap gap-2 mb-6">
          {modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => handleModuleSwitch(mod.id)}
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
                className={`px-3 py-1 rounded text-sm transition-all ${
                  template === t.id
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-red-600 text-sm">❌ {error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-sm">✕</button>
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
              maxLength={5000}
              className="w-full h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`text-sm ${content.length > 4500 ? 'text-red-500' : 'text-gray-500'}`}>
                  {content.length} / 5000 字
                </span>
                {content.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    🗑️ 清空
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {loading && (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    ✕ 取消
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={loading || !content.trim() || content.trim().length < 10}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '⏳ 生成中...' : '✨ 一键生成'}
                </button>
              </div>
            </div>
          </div>

          {/* 结果区 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">📋 生成结果</h2>
            {currentResult ? (
              <>
                <div className="h-64 overflow-auto p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
                  {currentResult}
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
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="text-4xl">📝</span>
                <span>输入内容后点击"一键生成"</span>
                {loading && <span className="text-blue-500 animate-pulse">AI正在思考中...</span>}
              </div>
            )}
          </div>
        </div>

        {/* 使用统计 */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">📊 使用统计</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalGenerations}</div>
              <div className="text-gray-500">已生成次数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">{savedHours} 小时</div>
              <div className="text-gray-500">累计节省时间</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">¥{savedValue}</div>
              <div className="text-gray-500">节省时间价值</div>
            </div>
          </div>
          {stats.totalGenerations > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-400">
                {Object.entries(stats.moduleCounts).map(([mod, count]) => {
                  const m = modules.find(x => x.id === mod)
                  return m ? <span key={mod}>{m.name} ×{count}</span> : null
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500">
          <p>© 2026 职场AI提效工具 - 让每个人都用得起AI</p>
        </div>
      </footer>
    </div>
  )
}
