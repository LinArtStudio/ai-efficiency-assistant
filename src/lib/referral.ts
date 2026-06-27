// 邀请系统工具函数

// 邀请记录接口
export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId: string;
  timestamp: number;
  status: 'pending' | 'completed';
}

// 生成邀请码
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 获取用户的邀请码
export function getInviteCode(): string {
  if (typeof window === 'undefined') return '';
  
  try {
    let code = localStorage.getItem('invite-code');
    if (!code) {
      code = generateInviteCode();
      localStorage.setItem('invite-code', code);
    }
    return code;
  } catch {
    return '';
  }
}

// 获取邀请链接
export function getInviteLink(): string {
  const code = getInviteCode();
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}?ref=${code}`;
}

// 记录邀请关系
export function recordReferral(referrerCode: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const records: ReferralRecord[] = JSON.parse(localStorage.getItem('referral-records') || '[]');
    
    // 检查是否已经记录过
    const exists = records.some(r => r.referrerId === referrerCode);
    if (exists) return false;
    
    // 生成新用户ID
    const newUserId = generateInviteCode();
    
    records.push({
      id: Date.now().toString(),
      referrerId: referrerCode,
      referredId: newUserId,
      timestamp: Date.now(),
      status: 'completed'
    });
    
    localStorage.setItem('referral-records', JSON.stringify(records));
    
    // 增加邀请人的额度
    const bonusKey = `referral-bonus-${referrerCode}`;
    const currentBonus = parseInt(localStorage.getItem(bonusKey) || '0');
    localStorage.setItem(bonusKey, (currentBonus + 3).toString());
    
    return true;
  } catch {
    return false;
  }
}

// 获取邀请统计
export function getReferralStats(): { total: number; bonus: number } {
  if (typeof window === 'undefined') return { total: 0, bonus: 0 };
  
  try {
    const code = getInviteCode();
    const records: ReferralRecord[] = JSON.parse(localStorage.getItem('referral-records') || '[]');
    const total = records.filter(r => r.referrerId === code).length;
    const bonus = parseInt(localStorage.getItem(`referral-bonus-${code}`) || '0');
    
    return { total, bonus };
  } catch {
    return { total: 0, bonus: 0 };
  }
}

// 检查URL是否有邀请码
export function checkReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref');
  } catch {
    return null;
  }
}
