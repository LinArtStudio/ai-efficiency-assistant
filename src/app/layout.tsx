import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '职场AI提效工具箱 - 周报/会议纪要/邮件/润色/翻译',
  description: '职场人的AI效率工具箱，一键生成专业周报、会议纪要、商务邮件，支持文案润色和中英翻译。免费使用！',
  keywords: 'AI周报,会议纪要,AI邮件,文案润色,AI翻译,职场效率,办公工具',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
