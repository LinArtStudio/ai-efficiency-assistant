import { NextResponse } from 'next/server'
import { generateReport } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const { content, template } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '请输入工作内容' },
        { status: 400 }
      )
    }

    const report = await generateReport(content, template)

    return NextResponse.json({ report })
  } catch (error: any) {
    console.error('生成失败:', error)
    return NextResponse.json(
      { error: error.message || '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
