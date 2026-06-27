// 成本统计工具

// 模型价格配置（每1000 Token价格，单位：元）
const MODEL_PRICES: Record<string, number> = {
  'zhipu': 0.001,      // 智谱GLM-4-Flash：免费
  'deepseek': 0.002,   // DeepSeek V3：约0.002元/1000Token
  'mimo': 0,           // 小米MiMo：免费
  'baidu': 0,          // 百度ERNIE：免费
  'siliconflow': 0.001, // 硅基流动：约0.001元/1000Token
  'tencent': 0,        // 腾讯混元：免费
};

// 成本记录接口
export interface CostRecord {
  id: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  timestamp: number;
}

// 成本统计接口
export interface CostStats {
  totalTokens: number;
  totalCost: number;
  dailyTokens: number;
  dailyCost: number;
  weeklyTokens: number;
  weeklyCost: number;
  monthlyTokens: number;
  monthlyCost: number;
}

// 从localStorage读取成本记录
function loadCostRecords(): CostRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('cost-records');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

// 保存成本记录到localStorage
function saveCostRecords(records: CostRecord[]) {
  try {
    // 只保留最近1000条记录
    const trimmed = records.slice(-1000);
    localStorage.setItem('cost-records', JSON.stringify(trimmed));
  } catch {}
}

// 记录API调用成本
export function recordCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): void {
  const totalTokens = inputTokens + outputTokens;
  const pricePerToken = MODEL_PRICES[model] || 0.001;
  const estimatedCost = (totalTokens / 1000) * pricePerToken;

  const record: CostRecord = {
    id: Date.now().toString(),
    model,
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCost,
    timestamp: Date.now()
  };

  const records = loadCostRecords();
  records.push(record);
  saveCostRecords(records);
}

// 获取成本统计
export function getCostStats(): CostStats {
  const records = loadCostRecords();
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;
  const monthMs = 30 * dayMs;

  const dailyRecords = records.filter(r => now - r.timestamp < dayMs);
  const weeklyRecords = records.filter(r => now - r.timestamp < weekMs);
  const monthlyRecords = records.filter(r => now - r.timestamp < monthMs);

  return {
    totalTokens: records.reduce((sum, r) => sum + r.totalTokens, 0),
    totalCost: records.reduce((sum, r) => sum + r.estimatedCost, 0),
    dailyTokens: dailyRecords.reduce((sum, r) => sum + r.totalTokens, 0),
    dailyCost: dailyRecords.reduce((sum, r) => sum + r.estimatedCost, 0),
    weeklyTokens: weeklyRecords.reduce((sum, r) => sum + r.totalTokens, 0),
    weeklyCost: weeklyRecords.reduce((sum, r) => sum + r.estimatedCost, 0),
    monthlyTokens: monthlyRecords.reduce((sum, r) => sum + r.totalTokens, 0),
    monthlyCost: monthlyRecords.reduce((sum, r) => sum + r.estimatedCost, 0),
  };
}

// 清除成本记录
export function clearCostRecords(): void {
  try {
    localStorage.removeItem('cost-records');
  } catch {}
}
