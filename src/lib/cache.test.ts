import { generateCacheKey, getFromCache, setCache, getCacheStats } from './cache'

describe('Cache Module', () => {
  beforeEach(() => {
    // 清空缓存
    const stats = getCacheStats()
    // No direct way to clear, but tests will use unique keys
  })

  describe('generateCacheKey', () => {
    it('should generate consistent keys for same input', () => {
      const key1 = generateCacheKey('weekly', 'test content', 'standard')
      const key2 = generateCacheKey('weekly', 'test content', 'standard')
      expect(key1).toBe(key2)
    })

    it('should generate different keys for different inputs', () => {
      const key1 = generateCacheKey('weekly', 'content 1', 'standard')
      const key2 = generateCacheKey('weekly', 'content 2', 'standard')
      expect(key1).not.toBe(key2)
    })

    it('should generate different keys for different types', () => {
      const key1 = generateCacheKey('weekly', 'same content', 'standard')
      const key2 = generateCacheKey('meeting', 'same content', 'standard')
      expect(key1).not.toBe(key2)
    })
  })

  describe('setCache and getFromCache', () => {
    it('should store and retrieve values', () => {
      const key = 'test:key:1'
      const value = 'test result'
      
      setCache(key, value)
      const result = getFromCache(key)
      
      expect(result).toBe(value)
    })

    it('should return null for non-existent keys', () => {
      const result = getFromCache('non:existent:key')
      expect(result).toBeNull()
    })
  })

  describe('getCacheStats', () => {
    it('should return cache size', () => {
      setCache('stats:test:1', 'value1')
      setCache('stats:test:2', 'value2')
      
      const stats = getCacheStats()
      expect(stats.size).toBeGreaterThanOrEqual(2)
    })

    it('should return hit rate', () => {
      const key = 'stats:hit:test'
      setCache(key, 'value')
      getFromCache(key)  // hit
      getFromCache(key)  // hit
      
      const stats = getCacheStats()
      expect(stats.hitRate).toBeGreaterThanOrEqual(0)
    })
  })
})
