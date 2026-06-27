import { NextResponse } from 'next/server';
import * as webPush from 'web-push';

// VAPID 配置
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || ''
};

// 只在密钥存在时设置VAPID
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webPush.setVapidDetails(
    'mailto:15902234202@163.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
}

// 存储订阅（生产环境应使用数据库）
const subscriptions: Map<string, webPush.PushSubscription> = new Map();

export async function POST(request: Request) {
  try {
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      return NextResponse.json(
        { error: 'Push notification not configured' },
        { status: 503 }
      );
    }

    const subscription = await request.json();
    
    // 存储订阅
    const id = Date.now().toString();
    subscriptions.set(id, subscription);
    
    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    console.error('Push subscription failed:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 返回 VAPID 公钥
  return NextResponse.json({ publicKey: vapidKeys.publicKey });
}
