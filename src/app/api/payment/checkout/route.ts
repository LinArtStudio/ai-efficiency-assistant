import { NextResponse } from 'next/server'
import { createCheckoutSession, PRODUCTS } from '@/lib/payment'
import { getSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  try {
    const { productId } = await request.json()

    // 验证产品ID
    if (!PRODUCTS[productId]) {
      return NextResponse.json(
        { error: '无效的产品ID' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 创建支付会话
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`

    const result = await createCheckoutSession(
      PRODUCTS[productId].id,
      user.id,
      successUrl,
      cancelUrl
    )

    if (!result) {
      return NextResponse.json(
        { error: '创建支付会话失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId
    })
  } catch (error: unknown) {
    console.error('Payment API error:', error)
    const errorMessage = error instanceof Error ? error.message : '支付请求失败'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
