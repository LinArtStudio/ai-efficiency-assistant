import { NextResponse } from 'next/server'
import {
  generateWeeklyReport,
  generateMeetingMinutes,
  generateEmail,
  polishText,
  translateText,
  generatePPT,
  summarizeDocument,
  analyzeData,
  checkContentQuality
} from '@/lib/ai'
import { getSupabaseServerClient } from '@/lib/supabase-server'
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { generateCacheKey, getFromCache, setCache } from '@/lib/cache'

export async function POST(request: Request) {
  try {
    // 获取客户端IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // 检查频率限制（每分钟10次）
    const rateLimit = checkRateLimit(ip, { windowMs: 60000, maxRequests: 10 })
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试', code: 'RATE_LIMITED' },
        { 
          status: 429,
          headers: getRateLimitHeaders(rateLimit)
        }
      )
    }

    const { type, content, template } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '请输入内容' },
        { status: 400 }
      )
    }

    // 输入长度校验
    if (content.length > 5000) {
      return NextResponse.json(
        { error: '输入内容过长，请控制在5000字以内' },
        { status: 400 }
      )
    }

    if (content.trim().length < 10) {
      return NextResponse.json(
        { error: '内容太短，请至少输入10个字' },
        { status: 400 }
      )
    }

    // 尝试获取用户信息（如果Supabase配置了）
    let userId: string | null = null
    let isPro = false

    try {
      const supabase = await getSupabaseServerClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        userId = user.id
        
        // 检查用户是否为Pro
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('plan, plan_expires_at')
          .eq('id', userId)
          .single()
        
        if (profile) {
          isPro = profile.plan === 'pro' && 
                  (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date())
        }
        
        // 检查免费用户今日使用次数
        if (!isPro) {
          const { count } = await supabase
            .from('usage_records')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', new Date().toISOString().slice(0, 10))
          
          if (count && count >= 3) {
            return NextResponse.json(
              { error: '今日免费额度已用完，升级Pro无限使用', code: 'QUOTA_EXCEEDED' },
              { status: 429 }
            )
          }
        }
      }
    } catch (e) {
      // Supabase未配置或查询失败，继续执行
      console.warn('Supabase check failed:', e)
    }

    // 检查缓存
    const cacheKey = generateCacheKey(type, content, template)
    const cachedResult = getFromCache(cacheKey)
    
    if (cachedResult) {
      return NextResponse.json(
        { result: cachedResult, cached: true },
        { headers: getRateLimitHeaders(rateLimit) }
      )
    }

    // 生成内容
    let result = ''

    switch (type) {
      case 'weekly':
        result = await generateWeeklyReport(content, template || 'standard')
        break
      case 'meeting':
        result = await generateMeetingMinutes(content)
        break
      case 'email':
        result = await generateEmail(content, template || 'business')
        break
      case 'polish':
        result = await polishText(content)
        break
      case 'translate':
        result = await translateText(content, template || 'auto')
        break
      case 'ppt':
        result = await generatePPT(content, template || 'business')
        break
      case 'summary':
        result = await summarizeDocument(content)
        break
      case 'data':
        result = await analyzeData(content, template || 'trend')
        break
      case 'quality-check':
        result = await checkContentQuality(content, template || 'weekly')
        break
      default:
        return NextResponse.json({ error: '不支持的类型' }, { status: 400 })
    }

    // 存入缓存
    setCache(cacheKey, result)

    // 记录使用情况（如果Supabase配置了）
    if (userId) {
      try {
        const supabase = await getSupabaseServerClient()
        await supabase.from('usage_records').insert({
          user_id: userId,
          type,
          content_length: content.length,
          template: template || null
        })
      } catch (e) {
        console.warn('Failed to record usage:', e)
      }
    }

    return NextResponse.json(
      { result, cached: false },
      { headers: getRateLimitHeaders(rateLimit) }
    )
  } catch (error: unknown) {
    // 服务端记录详细错误
    console.error('生成失败:', error)
    // 客户端只返回通用错误信息，不泄露内部细节
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
