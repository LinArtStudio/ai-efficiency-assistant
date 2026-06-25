import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { type, content, template } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '请输入内容' },
        { status: 400 }
      )
    }

    // 直接调用智谱AI API
    const apiKey = process.env.OPENAI_API_KEY
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4'
    const model = process.env.AI_MODEL || 'glm-4-flash'

    // 构建prompt
    let systemPrompt = ''
    let userPrompt = ''

    switch (type) {
      case 'weekly':
        systemPrompt = '你是一个专业的周报写作助手，擅长将零散的工作内容整理成结构化、专业的周报。'
        userPrompt = `工作内容：${content}\n\n请生成简洁版周报：\n\n【本周完成】\n• （3-5条关键成果）\n\n【下周计划】\n• （3-5条重点任务）\n\n【需要支持】\n• （如有）\n\n要求：语言专业、清晰、简洁，突出工作亮点，使用中文输出。`
        break
      case 'meeting':
        systemPrompt = '你是一个专业的会议纪要助手，擅长从会议内容中提取关键信息并生成结构化的会议纪要。'
        userPrompt = `会议内容：${content}\n\n请生成结构化的会议纪要，包括：会议要点、决策事项、待办任务。`
        break
      case 'email':
        systemPrompt = '你是一个专业的商务邮件写作助手，擅长撰写各类商务邮件。'
        userPrompt = `邮件需求：${content}\n\n请生成一封专业的商务邮件。`
        break
      case 'polish':
        systemPrompt = '你是一个专业的文案润色助手，擅长优化各类文案的表达。'
        userPrompt = `请润色以下文案：${content}\n\n要求：保持原意，优化表达，修正语法错误。`
        break
      case 'translate':
        systemPrompt = 'You are a professional translator. Translate the user input accurately between Chinese and English. If the input is in Chinese, translate to English. If the input is in English, translate to Chinese. Output ONLY the translation, nothing else.'
        userPrompt = content
        break
      default:
        return NextResponse.json({ error: '不支持的类型' }, { status: 400 })
    }

    // 调用API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('API Error:', errorData)
      return NextResponse.json(
        { error: `API调用失败: ${response.status}` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content || '生成失败，请重试'

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error('生成失败:', error)
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
