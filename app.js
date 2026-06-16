/**
 * AI办公效率助手 - 前端MVP
 * 功能：会议纪要生成、周报生成（前端演示版）
 * 策略：先用模板+规则引擎验证市场，后续接入真实AI API
 */

// ============ 会议纪要生成 ============

/**
 * 从会议文本中提取关键信息
 * @param {string} text - 会议原文/录音转文字
 * @returns {object} 结构化纪要
 */
function generateMeetingMinutes(text) {
  const lines = text.split('\n').filter(l => l.trim());

  // 提取待办事项（包含"要"、"需要"、"必须"、"负责"等关键词）
  const actionItems = [];
  const actionKeywords = ['要', '需要', '必须', '负责', '跟进', '完成', '确认', '提交', '安排', '处理'];

  lines.forEach(line => {
    if (actionKeywords.some(kw => line.includes(kw))) {
      actionItems.push(line.trim());
    }
  });

  // 提取决策（包含"决定"、"确认"、"同意"、"确定"等关键词）
  const decisions = [];
  const decisionKeywords = ['决定', '确认', '同意', '确定', '通过', '批准', '采纳'];

  lines.forEach(line => {
    if (decisionKeywords.some(kw => line.includes(kw))) {
      decisions.push(line.trim());
    }
  });

  // 提取讨论要点（去除空行，取前5条作为要点）
  const keyPoints = lines.slice(0, 5).map(l => l.trim());

  // 生成摘要
  const summary = `本次会议共讨论 ${lines.length} 个议题，形成 ${decisions.length} 项决策，${actionItems.length} 项待办。`;

  return {
    summary,
    keyPoints,
    decisions: decisions.length > 0 ? decisions : ['暂无明确决策记录'],
    actionItems: actionItems.length > 0 ? actionItems : ['暂无明确待办事项']
  };
}

/**
 * 将纪要对象转为Markdown格式
 */
function minutesToMarkdown(minutes) {
  let md = '# 会议纪要\n\n';
  md += `## 📋 摘要\n${minutes.summary}\n\n`;
  md += '## 💬 讨论要点\n';
  minutes.keyPoints.forEach((p, i) => md += `${i + 1}. ${p}\n`);
  md += '\n## ✅ 决策事项\n';
  minutes.decisions.forEach(d => md += `- ${d}\n`);
  md += '\n## 📌 待办清单\n';
  minutes.actionItems.forEach((a, i) => md += `- [ ] ${a}\n`);
  md += `\n---\n*生成时间: ${new Date().toLocaleString('zh-CN')}*\n`;
  md += '*AI办公效率助手 - 让每个人都用得起AI*';
  return md;
}

// ============ 周报生成 ============

/**
 * 从工作记录生成周报
 * @param {string} workLog - 本周工作记录
 * @param {string} plan - 下周计划（可选）
 * @returns {string} Markdown格式周报
 */
function generateWeeklyReport(workLog, plan = '') {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4);

  const formatDate = (d) => `${d.getMonth() + 1}月${d.getDate()}日`;
  const weekRange = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;

  // 解析工作记录（按行分割）
  const tasks = workLog.split('\n').filter(l => l.trim());

  // 按关键词分类
  const completed = [];
  const inProgress = [];
  const issues = [];

  tasks.forEach(task => {
    const t = task.trim();
    if (t.includes('完成') || t.includes('已') || t.includes('搞定') || t.includes('结束')) {
      completed.push(t);
    } else if (t.includes('进行中') || t.includes('继续') || t.includes('推进')) {
      inProgress.push(t);
    } else if (t.includes('问题') || t.includes('困难') || t.includes('阻塞') || t.includes('风险')) {
      issues.push(t);
    } else {
      completed.push(t); // 默认归为已完成
    }
  });

  let report = `# 工作周报\n\n`;
  report += `**周期：** ${weekRange}\n\n`;
  report += `## ✅ 本周完成\n\n`;
  report += completed.length > 0
    ? completed.map((t, i) => `${i + 1}. ${t}`).join('\n')
    : '暂无记录\n';
  report += `\n\n## 🔄 进行中\n\n`;
  report += inProgress.length > 0
    ? inProgress.map((t, i) => `${i + 1}. ${t}`).join('\n')
    : '暂无\n';
  report += `\n\n## ⚠️ 问题与风险\n\n`;
  report += issues.length > 0
    ? issues.map((t, i) => `${i + 1}. ${t}`).join('\n')
    : '暂无\n';
  report += `\n\n## 📅 下周计划\n\n`;
  report += plan
    ? plan.split('\n').filter(l => l.trim()).map((t, i) => `${i + 1}. ${t.trim()}`).join('\n')
    : '待补充\n';
  report += `\n\n---\n*生成时间: ${today.toLocaleString('zh-CN')}*\n`;
  report += '*AI办公效率助手 - 让每个人都用得起AI*';

  return report;
}

// ============ 使用统计 ============

const USAGE_KEY = 'ai_efficiency_usage';

function getUsage() {
  const data = localStorage.getItem(USAGE_KEY);
  return data ? JSON.parse(data) : { meetingCount: 0, reportCount: 0, totalSavedHours: 0 };
}

function saveUsage(usage) {
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

function trackUsage(type) {
  const usage = getUsage();
  if (type === 'meeting') {
    usage.meetingCount++;
    usage.totalSavedHours += 1.5; // 每次会议纪要节省1.5小时
  } else if (type === 'report') {
    usage.reportCount++;
    usage.totalSavedHours += 3; // 每次周报生成节省3小时
  }
  saveUsage(usage);
  return usage;
}

// ============ UI交互 ============

function initApp() {
  // 会议纪要表单
  const meetingForm = document.getElementById('meetingForm');
  if (meetingForm) {
    meetingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const text = document.getElementById('meetingText').value;
      if (!text.trim()) {
        alert('请输入会议内容');
        return;
      }

      const minutes = generateMeetingMinutes(text);
      const markdown = minutesToMarkdown(minutes);
      document.getElementById('meetingResult').textContent = markdown;
      document.getElementById('meetingOutput').style.display = 'block';

      // 统计
      const usage = trackUsage('meeting');
      updateUsageDisplay(usage);
    });
  }

  // 周报表单
  const reportForm = document.getElementById('reportForm');
  if (reportForm) {
    reportForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const workLog = document.getElementById('workLog').value;
      const plan = document.getElementById('nextPlan').value;

      if (!workLog.trim()) {
        alert('请输入本周工作记录');
        return;
      }

      const report = generateWeeklyReport(workLog, plan);
      document.getElementById('reportResult').textContent = report;
      document.getElementById('reportOutput').style.display = 'block';

      // 统计
      const usage = trackUsage('report');
      updateUsageDisplay(usage);
    });
  }

  // 初始化使用统计显示
  const usage = getUsage();
  updateUsageDisplay(usage);
}

function updateUsageDisplay(usage) {
  const el = document.getElementById('usageStats');
  if (el) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background:#f0f0ff;padding:15px;border-radius:8px;margin:15px 0';

    const title = document.createElement('strong');
    title.textContent = '📊 你的效率提升';

    const line1 = document.createElement('div');
    line1.textContent = `会议纪要：${usage.meetingCount} 次 | 周报生成：${usage.reportCount} 次`;

    const line2 = document.createElement('div');
    const hours = document.createElement('strong');
    hours.style.color = '#667eea';
    hours.textContent = `${usage.totalSavedHours} 小时`;
    line2.append('累计节省：', hours, `（价值约 ¥${Math.round(usage.totalSavedHours * 150)}）`);

    wrapper.append(title, document.createElement('br'), line1, line2);
    el.innerHTML = '';
    el.appendChild(wrapper);
  }
}

// 复制到剪贴板
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ 已复制到剪贴板');
  }).catch(() => {
    // fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('✅ 已复制到剪贴板');
  });
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', initApp);
