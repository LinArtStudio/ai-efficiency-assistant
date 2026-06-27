import OpenAI from 'openai'
import { getSelectedModel, SUPPORTED_MODELS, ModelConfig } from './models'

// 支持多个AI服务商（智谱GLM / DeepSeek / OpenAI）
const defaultOpenai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  timeout: 60000, // 60秒超时
})

// 根据模型配置创建OpenAI客户端
function createOpenAIClient(model: ModelConfig): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: model.baseURL,
    timeout: 60000,
  })
}

// 周报模板
const weeklyTemplates: Record<string, string> = {
  standard: `请按以下格式生成周报，要求简洁明了，只写结果和数据：

【本周工作总结】
一、重点工作完成情况
• 每项工作用1-2句话描述，包含具体数据
• 突出关键成果和量化指标

二、下周工作计划
• 列出3-5项重点任务
• 每项任务明确目标和预期成果

三、需要协调的事项
• 列出需要他人配合的具体事项
• 明确责任人和截止时间

要求：
1. 语言简洁专业，不要凑字数
2. 每个要点1-2句话
3. 使用中文输出
4. 直接输出周报内容，不要添加额外说明`,

  project: `请按项目维度生成周报，要求简洁明了，只写结果和数据：

【项目进展】
• 按项目逐个列出，每个项目1-2句话
• 包含具体进度数据和关键成果

项目名称：XX项目
本周进展：完成XX功能开发，进度80%
下周计划：完成剩余20%并进行测试
风险/问题：XX依赖未到位

【需要协调的事项】
• 列出具体事项、责任人和截止时间

要求：
1. 每个项目1-2句话
2. 使用中文输出
3. 直接输出周报内容，不要添加额外说明`,

  simple: `请生成简洁版周报，要求极度简洁，只写结果：

【本周完成】
• 3-5条关键成果，每条1句话
• 包含具体数据和量化指标

【下周计划】
• 3-5条重点任务，每条1句话
• 明确目标和预期成果

【需要支持】
• 如有需要支持的事项，1句话说明

要求：
1. 极度简洁，不要凑字数
2. 每个要点1句话
3. 使用中文输出
4. 直接输出周报内容，不要添加额外说明`,

  data: `请按数据驱动方式生成周报：

【核心数据指标】
• 指标1：本周数据 vs 上周数据 变化趋势
• 指标2：本周数据 vs 上周数据 变化趋势
• 指标3：本周数据 vs 上周数据 变化趋势

【数据洞察】
• 基于数据发现的3个关键洞察

【本周数据驱动的工作】
• 工作内容（附数据支撑）

【下周数据目标】
• 目标1：具体数值目标
• 目标2：具体数值目标

【风险与对策】
• 基于数据发现的风险及应对方案`,

  sales: `请按销售团队格式生成周报：

【销售业绩】
• 本周销售额：XX元
• 目标完成率：XX%
• 新增客户：XX个
• 成交客户：XX个

【客户跟进】
• 重点客户进展
• 新客户开发情况
• 客户反馈汇总

【市场动态】
• 竞品动态
• 市场机会

【下周销售计划】
• 目标客户
• 重点跟进事项
• 需要支持`,

  tech: `请按技术团队格式生成周报：

【技术进展】
• 本周完成的技术任务
• 技术难点攻克
• 代码质量指标

【系统状态】
• 系统稳定性
• 性能优化
• 安全更新

【技术债务】
• 待重构的代码
• 技术债务清理计划

【下周技术计划】
• 开发任务
• 技术优化
• 学习计划`,

  marketing: `请按市场团队格式生成周报：

【营销数据】
• 曝光量：XX
• 点击率：XX%
• 转化率：XX%
• ROI：XX

【内容产出】
• 发布内容数量
• 热门内容分析
• 内容效果评估

【渠道表现】
• 各渠道数据对比
• 渠道优化建议

【下周营销计划】
• 内容计划
• 活动策划
• 预算分配`,

  hr: `请按HR团队格式生成周报：

【招聘进展】
• 新增简历：XX份
• 面试安排：XX场
• Offer发放：XX个
• 入职人数：XX人

【员工动态】
• 员工反馈
• 培训参与
• 绩效考核

【组织发展】
• 团队建设
• 文化活动
• 流程优化

【下周HR计划】
• 招聘重点
• 培训安排
• 员工关怀`,

  product: `请按产品团队格式生成周报：

【产品数据】
• DAU：XX
• 留存率：XX%
• 功能使用率：XX%
• 用户满意度：XX

【功能迭代】
• 已上线功能
• 功能效果评估
• 用户反馈汇总

【需求管理】
• 新增需求
• 需求优先级排序
• 需求进度

【下周产品计划】
• 功能开发
• 用户调研
• 竞品分析`
}

// 会议纪要模板
const meetingTemplate = `请根据以下会议内容，生成结构化的会议纪要：

【会议基本信息】
• 会议主题：（从内容中提取）
• 会议时间：（从内容中提取或标注"未提及"）
• 参会人员：（从内容中提取或标注"未提及"）

【会议要点】
（列出3-5个核心讨论要点）

【决策事项】
（列出会议达成的决策）

【待办任务】
| 任务 | 负责人 | 截止时间 |
|------|--------|----------|
| （列出待办） | （负责人） | （时间） |

【下次会议安排】
（如有提及）`

// 邮件模板
const emailTemplates: Record<string, string> = {
  business: `请根据以下内容生成一封正式的商务邮件：

【收件人】：（从内容中提取）
【主题】：（生成简洁明了的主题）

【邮件正文】
（正式、专业的商务邮件格式）`,

  follow_up: `请根据以下内容生成一封跟进邮件：

【收件人】：（从内容中提取）
【主题】：（跟进+事项）

【邮件正文】
（礼貌、专业的跟进邮件）`,

  thank_you: `请根据以下内容生成一封感谢邮件：

【收件人】：（从内容中提取）
【主题】：（感谢+事项）

【邮件正文】
（真诚、得体的感谢邮件）`
}

// 文案润色模板
const polishTemplate = `请对以下文案进行润色优化：

【原文】
（用户输入的文案）

【润色要求】
1. 保持原意不变
2. 优化语言表达，使其更专业/流畅
3. 修正语法错误
4. 提升可读性

【润色后】
（输出优化后的文案）`

// 翻译模板
const translateTemplates: Record<string, string> = {
  en2zh: `请将以下英文翻译成中文，保持专业性和流畅度：

（用户输入的英文）`,

  zh2en: `请将以下中文翻译成英文，保持专业性和流畅度：

（用户输入的中文）`,

  auto: `请自动检测语言并翻译：
- 如果是中文，翻译成英文
- 如果是英文，翻译成中文

（用户输入的内容）`
}

// 通用生成函数（带降级策略）
async function generate(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000
): Promise<string> {
  const selectedModel = getSelectedModel();
  
  // 尝试首选模型
  try {
    const openai = createOpenAIClient(selectedModel);
    
    const completion = await openai.chat.completions.create({
      model: selectedModel.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    })

    return completion.choices[0].message.content || '生成失败，请重试'
  } catch (error: any) {
    console.error(`首选模型 ${selectedModel.name} 失败:`, error.message);
    
    // 降级策略：尝试其他模型
    const fallbackModels = SUPPORTED_MODELS.filter(m => m.id !== selectedModel.id);
    
    for (const fallbackModel of fallbackModels) {
      try {
        console.log(`尝试降级到 ${fallbackModel.name}...`);
        const fallbackClient = createOpenAIClient(fallbackModel);
        
        const completion = await fallbackClient.chat.completions.create({
          model: fallbackModel.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: maxTokens,
        })

        console.log(`降级成功，使用 ${fallbackModel.name}`);
        return completion.choices[0].message.content || '生成失败，请重试'
      } catch (fallbackError: any) {
        console.error(`降级模型 ${fallbackModel.name} 也失败:`, fallbackError.message);
        continue;
      }
    }
    
    // 所有模型都失败
    throw new Error('所有AI模型都不可用，请稍后重试');
  }
}

// 周报生成
export async function generateWeeklyReport(
  content: string,
  template: string = 'standard'
): Promise<string> {
  const templatePrompt = weeklyTemplates[template] || weeklyTemplates.standard

  const prompt = `工作内容：
${content}

${templatePrompt}

要求：
1. 语言专业、清晰、简洁
2. 突出工作亮点和成果
3. 尽量量化（添加完成度、数据等）
4. 直接输出周报内容，不要添加额外说明
5. 使用中文输出`

  return generate(
    '你是一个专业的周报写作助手，擅长将零散的工作内容整理成结构化、专业的周报。',
    prompt
  )
}

// 会议纪要生成
export async function generateMeetingMinutes(
  content: string
): Promise<string> {
  const prompt = `会议内容/录音转写：
${content}

${meetingTemplate}

要求：
1. 准确提取会议要点和决策
2. 明确待办任务和负责人
3. 格式清晰、易于阅读
4. 使用中文输出`

  return generate(
    '你是一个专业的会议纪要助手，擅长从会议内容中提取关键信息并生成结构化的会议纪要。',
    prompt
  )
}

// 邮件生成
export async function generateEmail(
  content: string,
  type: string = 'business'
): Promise<string> {
  const templatePrompt = emailTemplates[type] || emailTemplates.business

  const prompt = `邮件内容/需求：
${content}

${templatePrompt}

要求：
1. 语言得体、专业
2. 符合商务邮件规范
3. 逻辑清晰、重点突出
4. 使用中文输出（除非明确要求英文）`

  return generate(
    '你是一个专业的商务邮件写作助手，擅长撰写各类商务邮件。',
    prompt
  )
}

// 文案润色
export async function polishText(
  content: string
): Promise<string> {
  const prompt = `请润色以下文案：

${content}

${polishTemplate}

要求：
1. 保持原意不变
2. 优化语言表达
3. 修正语法错误
4. 输出润色后的文案，不要添加额外说明`

  return generate(
    '你是一个专业的文案润色助手，擅长优化各类文案的表达。',
    prompt
  )
}

// 翻译
export async function translateText(
  content: string,
  direction: string = 'auto'
): Promise<string> {
  const templatePrompt = translateTemplates[direction] || translateTemplates.auto

  const prompt = `${templatePrompt}

${content}

要求：
1. 翻译准确、流畅
2. 保持专业术语的准确性
3. 只输出翻译结果，不要添加额外说明`

  return generate(
    '你是一个专业的翻译助手，擅长中英文互译。',
    prompt
  )
}

// PPT模板
const pptTemplates: Record<string, string> = {
  business: `请根据以下内容生成一份商务汇报PPT的大纲和内容：

【PPT结构要求】
1. 封面页：标题 + 副标题 + 日期
2. 目录页：列出各章节标题
3. 背景/现状分析
4. 核心内容（3-5页）
5. 数据/图表建议
6. 总结与下一步行动
7. Q&A页

【输出格式】
每页PPT用 ## 标题 标记
内容用要点列表形式
在每页末尾标注【设计建议】`,

  project: `请根据以下内容生成一份项目总结PPT的大纲和内容：

【PPT结构要求】
1. 封面页：项目名称 + 时间范围
2. 项目概述：目标、范围、团队
3. 项目进展：里程碑完成情况
4. 成果展示：关键数据和成果
5. 问题与挑战：遇到的问题及解决方案
6. 经验总结：lessons learned
7. 下一步计划
8. Q&A页

【输出格式】
每页PPT用 ## 标题 标记
内容用要点列表形式
在每页末尾标注【设计建议】`,

  training: `请根据以下内容生成一份培训课件PPT的大纲和内容：

【PPT结构要求】
1. 封面页：培训主题 + 讲师信息
2. 学习目标：培训结束后学员能掌握什么
3. 知识点讲解（4-6页）
4. 案例分析
5. 实操练习
6. 总结回顾
7. 参考资料

【输出格式】
每页PPT用 ## 标题 标记
内容用要点列表形式
在每页末尾标注【设计建议】`
}

// PPT生成
export async function generatePPT(
  content: string,
  template: string = 'business'
): Promise<string> {
  const templatePrompt = pptTemplates[template] || pptTemplates.business

  const prompt = `PPT主题/内容需求：
${content}

${templatePrompt}

要求：
1. 内容专业、结构清晰
2. 每页PPT控制在3-5个要点
3. 提供设计建议（配色、图表类型等）
4. 使用中文输出
5. 直接输出PPT内容，不要添加额外说明`

  return generate(
    '你是一个专业的PPT设计顾问，擅长将内容转化为结构清晰、视觉美观的PPT。输出Markdown格式的PPT内容。',
    prompt,
    3000
  )
}

// 文档总结模板
const summaryTemplate = `请对以下文档进行总结：

【总结要求】
1. 提取核心观点（3-5个）
2. 识别关键数据和结论
3. 总结行动建议
4. 保持客观、准确

【输出格式】
📋 核心观点
• （列出3-5个核心观点）

📊 关键数据
• （列出重要数据点）

💡 行动建议
• （列出可执行的建议）

📝 一句话总结
（用一句话概括全文）`

// 文档总结
export async function summarizeDocument(
  content: string
): Promise<string> {
  const prompt = `文档内容：
${content}

${summaryTemplate}

要求：
1. 准确提取核心信息
2. 不遗漏重要内容
3. 语言简洁明了
4. 使用中文输出`

  return generate(
    '你是一个专业的文档分析助手，擅长从长文档中提取关键信息并生成结构化总结。',
    prompt,
    2000
  )
}

// 数据分析模板
const dataTemplates: Record<string, string> = {
  trend: `请对以下数据进行趋势分析：

【分析要求】
1. 识别数据的整体趋势（上升/下降/波动/平稳）
2. 找出关键转折点
3. 分析可能的原因
4. 预测未来走势

【输出格式】
📈 趋势概述
• （一句话总结趋势方向）

📊 关键发现
• （列出3-5个关键发现）

🔍 转折点分析
• （列出重要转折点及原因）

💡 建议
• （基于趋势给出2-3条建议）`,

  compare: `请对以下数据进行对比分析：

【分析要求】
1. 识别各组数据的差异
2. 找出最优/最差表现
3. 分析差异原因
4. 提出改进建议

【输出格式】
📊 对比结果
• （用表格或列表展示对比）

🏆 最佳表现
• （列出表现最好的项目）

⚠️ 需要关注
• （列出表现最差或异常的项目）

💡 改进建议
• （给出2-3条改进建议）`,

  summary: `请对以下数据进行摘要分析：

【分析要求】
1. 计算关键指标（总量、平均值、最大/最小值等）
2. 识别数据特征
3. 发现异常值
4. 总结核心结论

【输出格式】
📋 数据概览
• 数据量：X条
• 时间范围：XX - XX
• 关键指标：XX

📊 核心指标
• （列出计算出的关键指标）

⚠️ 异常发现
• （列出异常值或特殊情况）

💡 核心结论
• （用3-5句话总结数据告诉我们的信息）`
}

// 数据分析
export async function analyzeData(
  content: string,
  template: string = 'trend'
): Promise<string> {
  const templatePrompt = dataTemplates[template] || dataTemplates.trend

  const prompt = `数据内容：
${content}

${templatePrompt}

要求：
1. 分析准确、客观
2. 基于数据说话，不要编造
3. 给出可执行的建议
4. 使用中文输出
5. 如果数据格式不清晰，请说明并给出最佳分析`

  return generate(
    '你是一个专业的数据分析师，擅长从数据中发现规律、趋势和洞察。请用专业但易懂的方式分析数据。',
    prompt,
    2500
  )
}

// 质量检查模板
const qualityCheckTemplate = `请对以下AI生成的内容进行质量检查：

【检查维度】
1. 完整性：内容是否完整，有无遗漏
2. 准确性：信息是否准确，有无错误
3. 格式：格式是否规范，排版是否清晰
4. 可用性：内容是否可以直接使用

【输出格式】
📋 质量评分：X/100

✅ 优点：
• （列出2-3个优点）

⚠️ 需要注意：
• （列出需要人工检查的地方）

🔧 改进建议：
• （列出1-2条改进建议）

📊 结论：[可直接使用/需小幅修改/需大幅修改]`

// 内容质量检查
export async function checkContentQuality(
  content: string,
  moduleType: string
): Promise<string> {
  const moduleNames: Record<string, string> = {
    weekly: '周报',
    meeting: '会议纪要',
    email: '邮件',
    polish: '润色文案',
    translate: '翻译',
    ppt: 'PPT大纲',
    summary: '文档总结',
    data: '数据分析'
  }

  const moduleName = moduleNames[moduleType] || '内容'

  const prompt = `请检查以下${moduleName}的质量：

${content}

${qualityCheckTemplate}

要求：
1. 客观评估，不要过度乐观
2. 指出具体问题，不要泛泛而谈
3. 给出可执行的改进建议
4. 使用中文输出`

  return generate(
    '你是一个严格的内容质量审核员，擅长发现AI生成内容中的问题并给出改进建议。',
    prompt,
    1500
  )
}
