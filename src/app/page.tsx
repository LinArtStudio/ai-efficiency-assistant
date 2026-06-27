'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SUPPORTED_MODELS, getSelectedModel, saveSelectedModel, ModelConfig } from '@/lib/models'
import { getInviteLink, getReferralStats, checkReferralFromUrl, recordReferral } from '@/lib/referral'
import PushNotificationButton from '@/components/PushNotificationButton'
import CalendarImport from '@/components/CalendarImport'
import CostDisplay from '@/components/CostDisplay'

// 功能模块配置
const modules = [
  { id: 'weekly', name: '📊 AI周报', placeholder: '粘贴本周工作内容，AI帮你生成专业周报...', templates: [
    { id: 'standard', name: '标准格式' },
    { id: 'project', name: '项目格式' },
    { id: 'simple', name: '简洁格式' },
    { id: 'data', name: '数据驱动' },
    { id: 'sales', name: '销售团队' },
    { id: 'tech', name: '技术团队' },
    { id: 'marketing', name: '市场团队' },
    { id: 'hr', name: 'HR团队' },
    { id: 'product', name: '产品团队' }
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
  ]},
  { id: 'ppt', name: '📊 AI PPT', placeholder: '描述PPT主题和内容要点，AI帮你生成PPT大纲和内容...', templates: [
    { id: 'business', name: '商务汇报' },
    { id: 'project', name: '项目总结' },
    { id: 'training', name: '培训课件' }
  ]},
  { id: 'summary', name: '📄 文档总结', placeholder: '粘贴需要总结的文档内容，AI帮你提取要点...' },
  { id: 'data', name: '📈 数据分析', placeholder: '粘贴CSV数据或描述数据特征，AI帮你生成分析报告...', templates: [
    { id: 'trend', name: '趋势分析' },
    { id: 'compare', name: '对比分析' },
    { id: 'summary', name: '数据摘要' }
  ]}
]

// 使用统计接口
interface UsageStats {
  totalGenerations: number
  moduleCounts: Record<string, number>
  totalChars: number
}

// 历史记录接口
interface HistoryItem {
  id: string
  module: string
  moduleName: string
  input: string
  output: string
  template: string
  timestamp: number
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

// 从localStorage读取历史记录
function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('ai-efficiency-history')
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

// 保存历史记录到localStorage（最多保留50条）
function saveHistory(history: HistoryItem[]) {
  try {
    const trimmed = history.slice(0, 50)
    localStorage.setItem('ai-efficiency-history', JSON.stringify(trimmed))
  } catch {}
}

// 计算节省时间（小时）
function calcSavedHours(stats: UsageStats): number {
  const hoursMap: Record<string, number> = { weekly: 2, meeting: 1.5, email: 0.5, polish: 0.3, translate: 0.25, ppt: 3, summary: 1, data: 2 }
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
  const [qualityChecking, setQualityChecking] = useState(false)
  const [qualityResult, setQualityResult] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<UsageStats>({ totalGenerations: 0, moduleCounts: {}, totalChars: 0 })
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelConfig>(getSelectedModel())
  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentModule = modules.find(m => m.id === activeModule) || modules[0]
  const currentResult = results[activeModule] || ''

  // 加载统计
  useEffect(() => {
    setStats(loadStats())
    setHistory(loadHistory())
  }, [])

  // 从URL读取模块参数
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const moduleParam = params.get('module')
      if (moduleParam && modules.some(m => m.id === moduleParam)) {
        setActiveModule(moduleParam)
      }
    }
  }, [])

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // 检查URL中的邀请码
  useEffect(() => {
    const refCode = checkReferralFromUrl();
    if (refCode) {
      recordReferral(refCode);
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
        
        // 保存到历史记录
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          module: activeModule,
          moduleName: currentModule.name,
          input: content.slice(0, 200),
          output: data.result,
          template: template || '',
          timestamp: Date.now()
        }
        const newHistory = [historyItem, ...history]
        setHistory(newHistory)
        saveHistory(newHistory)
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

  const handleDownloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${currentModule.name}</title>
  <style>
    body { font-family: 'Microsoft YaHei', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>${currentModule.name}</h1>
  <pre>${currentResult}</pre>
  <p style="color: #999; font-size: 12px;">生成时间: ${new Date().toLocaleString('zh-CN')}</p>
</body>
</html>`
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toISOString().slice(0, 10)
    a.download = `${currentModule.name.replace(/[^\u4e00-\u9fa5]/g, '')}-${date}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPDF = async () => {
    const { generateFormattedPDF } = await import('@/lib/pdf-generator');
    const date = new Date().toISOString().slice(0, 10);
    generateFormattedPDF(currentResult, currentModule.name, date);
  }

  const handleDownloadPPT = async () => {
    if (activeModule !== 'ppt') return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          template: template || 'business'
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'PPT生成失败')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${content.slice(0, 20)}.pptx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'PPT下载失败'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleQualityCheck = async () => {
    if (!currentResult) return

    setQualityChecking(true)
    setQualityResult('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quality-check',
          content: currentResult,
          template: activeModule
        })
      })

      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setQualityResult(data.result)
      }
    } catch {
      setError('质量检查失败，请重试')
    } finally {
      setQualityChecking(false)
    }
  }

  const handleClear = () => {
    setContent('')
    setError('')
  }

  const handleRestoreHistory = (item: HistoryItem) => {
    setActiveModule(item.module)
    setTemplate(item.template)
    setContent('')
    setResults(prev => ({ ...prev, [item.module]: item.output }))
    setShowHistory(false)
  }

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    saveHistory(newHistory)
  }

  const handleModelChange = (modelId: string) => {
    const model = SUPPORTED_MODELS.find(m => m.id === modelId)
    if (model) {
      setSelectedModel(model)
      saveSelectedModel(modelId)
    }
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-blue-600">🚀 职场AI提效工具</h1>
            <p className="text-gray-500 mt-1">8大AI功能，让工作效率翻倍</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedModel.id}
              onChange={(e) => handleModelChange(e.target.value)}
              className="px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              {SUPPORTED_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowHistory(true)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              📜 历史记录
            </button>
            <PushNotificationButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 日历导入 */}
        <CalendarImport />
        
        {/* 成本统计 */}
        <CostDisplay />

        {/* 功能Tab - 移动端可横向滚动 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {modules.map(mod => (
            <button
              key={mod.id}
              onClick={() => handleModuleSwitch(mod.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
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
            <div className="flex gap-2">
              <button onClick={handleGenerate} className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                🔄 重试
              </button>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-sm">✕</button>
            </div>
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
              className="w-full h-48 md:h-64 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="h-48 md:h-64 overflow-auto p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm leading-relaxed">
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
                    <button
                      onClick={handleDownloadHTML}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                    >
                      📄 下载.html
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                      📑 下载.pdf
                    </button>
                    {activeModule === 'ppt' && (
                      <button
                        onClick={handleDownloadPPT}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all"
                      >
                        📊 下载.pptx
                      </button>
                    )}
                    <button
                      onClick={handleQualityCheck}
                      disabled={qualityChecking}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-all"
                    >
                      {qualityChecking ? '⏳ 检查中...' : '🔍 质量检查'}
                    </button>
                </div>
              </>
            ) : (
              <div className="h-48 md:h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                {loading ? (
                  <div className="w-full space-y-3 p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    <div className="text-center text-blue-500 text-sm mt-4 animate-pulse">AI正在思考中...</div>
                  </div>
                ) : (
                  <>
                    <span className="text-4xl">📝</span>
                    <span>输入内容后点击"一键生成"</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 快速开始 */}
        {stats.totalGenerations === 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">🎯 快速开始</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-medium">选择功能</p>
                  <p className="text-gray-500">点击上方Tab选择需要的AI功能</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-medium">输入内容</p>
                  <p className="text-gray-500">在左侧输入框粘贴或描述你的需求</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-medium">一键生成</p>
                  <p className="text-gray-500">点击生成按钮，AI帮你完成</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 质量检查结果 */}
        {qualityResult && (
          <div className="mt-8 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">🔍 质量检查结果</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {qualityResult}
            </div>
            <button
              onClick={() => setQualityResult('')}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600"
            >
              🗑️ 关闭结果
            </button>
          </div>
        )}

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

      {/* 历史记录面板 */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">📜 历史记录</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-4 max-h-[60vh]">
              {history.length === 0 ? (
                <p className="text-center text-gray-400 py-8">暂无历史记录</p>
              ) : (
                <div className="space-y-3">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRestoreHistory(item)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-medium">{item.moduleName}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(item.timestamp).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteHistory(item.id)
                          }}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.input}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 数据安全声明 */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">数据安全承诺</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>数据不上云</strong>：您的输入内容仅用于AI生成，不会存储到我们的服务器</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>本地处理</strong>：所有数据处理均在您的浏览器本地完成</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>无追踪</strong>：我们不追踪您的使用行为，不收集个人身份信息</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>开源透明</strong>：核心代码开源，接受社区监督</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                了解更多：<a href="/privacy" className="underline hover:text-gray-600">隐私政策</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 邀请好友 */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">邀请好友，获得额外额度</h3>
              <p className="text-sm text-gray-600 mb-4">
                邀请好友使用本工具，每成功邀请1人，您将获得<strong>3次额外免费额度</strong>
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getInviteLink()}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border rounded-lg"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getInviteLink());
                    alert('邀请链接已复制');
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  复制链接
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                已邀请 {getReferralStats().total} 人，获得 {getReferralStats().bonus} 次额外额度
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500">
          <p>© 2026 职场AI提效工具 - 让每个人都用得起AI</p>
          <div className="mt-2 space-x-4 text-sm">
            <a href="/privacy" className="text-gray-400 hover:text-gray-600">隐私政策</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
