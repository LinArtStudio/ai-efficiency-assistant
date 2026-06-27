import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1a73e8',
}

export const metadata: Metadata = {
  title: '职场AI提效工具 - 8大AI功能让工作效率翻倍',
  description: '职场人的AI提效工具，支持AI周报、PPT生成、会议纪要、商务邮件、文案润色、AI翻译、文档总结、数据分析。免费使用！',
  keywords: 'AI周报,AI PPT,会议纪要,AI邮件,文案润色,AI翻译,文档总结,数据分析,职场效率,办公工具',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.svg',
    apple: '/icons/icon-512x512.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="theme-color" content="#1a73e8" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.svg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
