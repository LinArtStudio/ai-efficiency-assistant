import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { content, format } = await request.json()

    if (format === 'txt') {
      // 纯文本导出
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename=周报.txt'
        }
      })
    }

    if (format === 'word') {
      // 简单的HTML格式，可以被Word打开
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Microsoft YaHei', sans-serif; line-height: 1.8; padding: 40px; }
    h1 { text-align: center; color: #333; }
    pre { white-space: pre-wrap; font-family: inherit; }
  </style>
</head>
<body>
  <h1>周报</h1>
  <pre>${content}</pre>
</body>
</html>`

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'application/msword',
          'Content-Disposition': 'attachment; filename=周报.doc'
        }
      })
    }

    return NextResponse.json(
      { error: '不支持的格式' },
      { status: 400 }
    )
  } catch (error) {
    console.error('导出失败:', error)
    return NextResponse.json(
      { error: '导出失败' },
      { status: 500 }
    )
  }
}
