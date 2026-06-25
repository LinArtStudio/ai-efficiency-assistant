import { NextResponse } from 'next/server'
import {
  generateWeeklyReport,
  generateMeetingMinutes,
  generateEmail,
  polishText,
  translateText
} from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const { type, content, template } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '请输入内容' },
        { status: 400 }
      )
    }

    // 输入长度校验
    if (content.length > 5000) {
      return NextResponse.json(
        { error: '输入内容过长，请控制在5000字以内' },
        { status: 400 }
      )
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: '内容太短，请至少输入10个字' },
        { status: 400 }
      )
    }

    let result = ''

    switch (type) {
      case 'weekly':
        result = await generateWeeklyReport(content, template || 'standard')
        break
      case 'meeting':
        result = await generateMeetingMinutes(content)
        break
      case 'email':
        result = await generateEmail(content, template || 'business')
        break
      case 'polish':
        result = await polishText(content)
        break
      case 'translate':
        result = await translateText(content, template || 'auto')
        break
      default:
        return NextResponse.json({ error: '不支持的类型' }, { status: 400 })
    }

    return NextResponse.json({ result })
  } catch (error: unknown) {
    console.error('生成失败:', error)
    const errorMessage = error instanceof Error ? error.message : '生成失败，请稍后重试'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
