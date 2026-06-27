'use client'

import { useState } from 'react'

const plans = [
  {
    id: 'free',
    name: '免费版',
    price: '¥0',
    period: '永久',
    features: [
      '每天5次AI生成',
      '8大功能全可用',
      '基础模板',
      '本地历史记录',
    ],
    cta: '当前方案',
    popular: false,
    disabled: true,
  },
  {
    id: 'weekly',
    name: '周卡',
    price: '¥9',
    period: '/周',
    features: [
      '无限次AI生成',
      '8大功能全可用',
      '高级模板',
      '优先响应',
      '7天有效期',
    ],
    cta: '立即开通',
    popular: true,
    disabled: false,
  },
  {
    id: 'monthly',
    name: '月卡',
    price: '¥29',
    period: '/月',
    features: [
      '无限次AI生成',
      '8大功能全可用',
      '高级模板',
      '优先响应',
      '30天有效期',
    ],
    cta: '立即开通',
    popular: false,
    disabled: false,
  },
  {
    id: 'yearly',
    name: '年卡',
    price: '¥199',
    period: '/年',
    features: [
      '无限次AI生成',
      '8大功能全可用',
      '高级模板',
      '优先响应',
      '365天有效期',
      '节省¥149',
    ],
    cta: '立即开通',
    popular: false,
    disabled: false,
  },
]

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleSelect = (planId: string) => {
    if (planId === 'free') return
    setSelectedPlan(planId)
    // TODO: 集成支付
    alert(`选择了${planId}方案，支付功能即将上线`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <a href="/" className="text-blue-600 hover:text-blue-700">← 返回首页</a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">选择适合你的方案</h1>
          <p className="text-gray-500">解锁无限AI生成，提升工作效率</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl p-6 ${
                plan.popular
                  ? 'bg-blue-600 text-white ring-2 ring-blue-600 shadow-xl'
                  : 'bg-white border'
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-2">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                    最受欢迎
                  </span>
                </div>
              )}
              <h3 className={`text-lg font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-800'}`}>
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-gray-800'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-500'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <span className={plan.popular ? 'text-blue-200' : 'text-green-500'}>✓</span>
                    <span className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelect(plan.id)}
                disabled={plan.disabled}
                className={`w-full py-2 rounded-lg font-medium transition-all ${
                  plan.disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            所有方案均可随时取消 · 支持微信/支付宝支付 · 7天无理由退款
          </p>
        </div>
      </main>
    </div>
  )
}
