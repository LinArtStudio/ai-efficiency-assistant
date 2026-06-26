// AI响应缓存
// 使用内存缓存，生产环境建议使用Redis

interface CacheEntry {
  result: string
  timestamp: number
  hits: number
}

const cache = new Map<string, CacheEntry>()

// 缓存配置
const CACHE_CONFIG = {
  maxSize: 1000,        // 最大缓存条目
  ttl: 24 * 60 * 60 * 1000,  // 24小时过期
  cleanupInterval: 60 * 60 * 1000  // 每小时清理一次
}

// 生成缓存key
export function generateCacheKey(type: string, content: string, template?: string): string {
  // 对内容进行hash，避免内存占用过大
  const contentHash = simpleHash(content)
  return `${type}:${template || 'default'}:${contentHash}`
}

// 简单hash函数
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash  // 转换为32位整数
  }
  return Math.abs(hash).toString(36)
}

// 获取缓存
export function getFromCache(key: string): string | null {
  const entry = cache.get(key)
  
  if (!entry) {
    return null
  }
  
  // 检查是否过期
  if (Date.now() - entry.timestamp > CACHE_CONFIG.ttl) {
    cache.delete(key)
    return null
  }
  
  // 增加命中次数
  entry.hits++
  
  return entry.result
}

// 设置缓存
export function setCache(key: string, result: string): void {
  // 如果缓存已满，删除最旧的条目
  if (cache.size >= CACHE_CONFIG.maxSize) {
    const oldestKey = cache.keys().next().value
    if (oldestKey) {
      cache.delete(oldestKey)
    }
  }
  
  cache.set(key, {
    result,
    timestamp: Date.now(),
    hits: 0
  })
}

// 清理过期缓存
function cleanupCache(): void {
  const now = Date.now()
  
  cache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_CONFIG.ttl) {
      cache.delete(key)
    }
  })
}

// 启动定时清理
setInterval(cleanupCache, CACHE_CONFIG.cleanupInterval)

// 获取缓存统计
export function getCacheStats(): { size: number; hitRate: number } {
  let totalHits = 0
  let totalRequests = 0
  
  cache.forEach(entry => {
    totalHits += entry.hits
    totalRequests += entry.hits + 1  // +1 for the initial miss
  })
  
  return {
    size: cache.size,
    hitRate: totalRequests > 0 ? totalHits / totalRequests : 0
  }
}
