// 简单的内存频率限制器
// 生产环境建议使用Redis

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// 清理过期记录（每5分钟）
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs: number  // 时间窗口（毫秒）
  maxRequests: number  // 最大请求数
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = rateLimitStore.get(ip)

  if (!record || now > record.resetTime) {
    // 新的时间窗口
    const resetTime = now + config.windowMs
    rateLimitStore.set(ip, { count: 1, resetTime })
    return { allowed: true, remaining: config.maxRequests - 1, resetTime }
  }

  if (record.count >= config.maxRequests) {
    // 超出限制
    return { allowed: false, remaining: 0, resetTime: record.resetTime }
  }

  // 增加计数
  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count, resetTime: record.resetTime }
}

export function getRateLimitHeaders(result: { remaining: number; resetTime: number }): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  }
}
