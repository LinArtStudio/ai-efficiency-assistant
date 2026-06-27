'use client';

import { useState, useEffect } from 'react';
import { getCostStats, clearCostRecords, CostStats } from '@/lib/cost-tracker';

export default function CostDisplay() {
  const [stats, setStats] = useState<CostStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadStats = () => {
      const costStats = getCostStats();
      setStats(costStats);
    };
    
    loadStats();
    // 每分钟更新一次
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost: number): string => {
    if (cost === 0) return '免费';
    if (cost < 0.01) return '<¥0.01';
    return `¥${cost.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">💰 成本统计</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? '收起' : '详情'}
        </button>
      </div>

      {/* 概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {formatTokens(stats.dailyTokens)}
          </div>
          <div className="text-sm text-gray-500">今日Token</div>
          <div className="text-xs text-gray-400">{formatCost(stats.dailyCost)}</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {formatTokens(stats.weeklyTokens)}
          </div>
          <div className="text-sm text-gray-500">本周Token</div>
          <div className="text-xs text-gray-400">{formatCost(stats.weeklyCost)}</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatTokens(stats.monthlyTokens)}
          </div>
          <div className="text-sm text-gray-500">本月Token</div>
          <div className="text-xs text-gray-400">{formatCost(stats.monthlyCost)}</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {formatTokens(stats.totalTokens)}
          </div>
          <div className="text-sm text-gray-500">总计Token</div>
          <div className="text-xs text-gray-400">{formatCost(stats.totalCost)}</div>
        </div>
      </div>

      {/* 详情 */}
      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">📊 使用说明</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 智谱GLM-4-Flash：永久免费</li>
            <li>• 百度ERNIE：永久免费不限量</li>
            <li>• 腾讯混元：永久免费</li>
            <li>• DeepSeek V3：约¥0.002/1000Token</li>
          </ul>
          <button
            onClick={() => {
              clearCostRecords();
              setStats(getCostStats());
            }}
            className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg"
          >
            清除历史记录
          </button>
        </div>
      )}
    </div>
  );
}
