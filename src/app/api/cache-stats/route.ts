import { NextResponse } from 'next/server'
import { getCacheStats } from '@/lib/cache'

export async function GET() {
  const stats = getCacheStats()
  
  return NextResponse.json({
    status: 'ok',
    cache: {
      size: stats.size,
      hitRate: Math.round(stats.hitRate * 100) + '%'
    }
  })
}
