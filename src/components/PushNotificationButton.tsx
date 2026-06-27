'use client';

import { useState, useEffect } from 'react';

export default function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // 检查是否支持推送通知
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // 获取VAPID公钥
      const response = await fetch('/api/push/subscribe');
      const { publicKey } = await response.json();
      
      // 订阅推送
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });
      
      // 发送订阅到服务器
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
      
      setIsSubscribed(true);
      alert('推送通知已开启！');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('开启推送通知失败');
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        alert('推送通知已关闭');
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      className={`px-4 py-2 rounded-lg transition-all ${
        isSubscribed
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      }`}
    >
      {isSubscribed ? '🔕 关闭推送' : '🔔 开启推送'}
    </button>
  );
}
