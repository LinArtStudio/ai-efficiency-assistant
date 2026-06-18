import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI周报助手 - 3分钟生成专业周报',
  description: '用AI 3分钟生成专业周报，让你准时下班。支持文字、语音输入，多模板选择，一键导出Word/PDF。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
