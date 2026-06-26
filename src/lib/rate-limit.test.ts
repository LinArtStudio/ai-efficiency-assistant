import { checkRateLimit, RateLimitConfig } from './rate-limit'

describe('Rate Limit Module', () => {
  const testIp = '192.168.1.1'
  
  beforeEach(() => {
    // Each test uses a unique IP to avoid interference
  })

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const config: RateLimitConfig = { windowMs: 60000, maxRequests: 5 }
      const result = checkRateLimit(testIp + '-1', config)
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4)
    })

    it('should block requests exceeding limit', () => {
      const config: RateLimitConfig = { windowMs: 60000, maxRequests: 2 }
      const ip = testIp + '-2'
      
      checkRateLimit(ip, config)  // 1st request
      checkRateLimit(ip, config)  // 2nd request
      const result = checkRateLimit(ip, config)  // 3rd request - should be blocked
      
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should return reset time', () => {
      const config: RateLimitConfig = { windowMs: 60000, maxRequests: 5 }
      const result = checkRateLimit(testIp + '-3', config)
      
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should use default config if not provided', () => {
      const result = checkRateLimit(testIp + '-4')
      
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(9)  // default maxRequests is 10
    })
  })
})
