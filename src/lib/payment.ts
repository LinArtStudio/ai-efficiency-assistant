// Creem支付集成
// 文档：https://docs.creem.io/

export interface CreemProduct {
  id: string
  name: string
  price: number
  currency: string
  description: string
}

// 产品配置
export const PRODUCTS: Record<string, CreemProduct> = {
  weekly: {
    id: 'prod_weekly',
    name: '周卡',
    price: 9,
    currency: 'CNY',
    description: '7天无限次使用'
  },
  monthly: {
    id: 'prod_monthly',
    name: '月卡',
    price: 29,
    currency: 'CNY',
    description: '30天无限次使用'
  }
}

// 创建支付会话
export async function createCheckoutSession(
  productId: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ checkoutUrl: string; sessionId: string } | null> {
  const apiKey = process.env.CREEM_API_KEY
  
  if (!apiKey) {
    console.error('Creem API Key not configured')
    return null
  }

  try {
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        product_id: productId,
        metadata: {
          user_id: userId
        },
        success_url: successUrl,
        cancel_url: cancelUrl
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Creem API error:', error)
      return null
    }

    const data = await response.json()
    return {
      checkoutUrl: data.checkout_url,
      sessionId: data.id
    }
  } catch (error) {
    console.error('Creem checkout error:', error)
    return null
  }
}

// 验证支付回调
export async function verifyWebhookSignature(
  payload: string,
  signature: string
): Promise<boolean> {
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    console.error('Creem Webhook Secret not configured')
    return false
  }

  // TODO: 实现签名验证逻辑
  // 参考Creem文档：https://docs.creem.io/webhooks
  return true
}

// 处理支付成功回调
export async function handlePaymentSuccess(sessionId: string, userId: string): Promise<boolean> {
  try {
    // TODO: 更新用户订阅状态
    // 1. 查询Creem API获取订单详情
    // 2. 更新Supabase中的user_profiles表
    // 3. 记录支付日志
    
    console.log('Payment success:', { sessionId, userId })
    return true
  } catch (error) {
    console.error('Handle payment success error:', error)
    return false
  }
}
