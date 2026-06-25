import OpenAI from 'openai'

// 支持多个AI服务商（智谱GLM / DeepSeek / OpenAI）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
  timeout: 60000, // 60秒超时
})

// 周报模板
const weeklyTemplates: Record<string, string> = {
  standard: `请按以下格式生成周报：

【本周工作总结】
一、重点工作完成情况
（列出每项工作的完成度和关键成果，尽量量化）

二、下周工作计划
（列出下周要做的工作）

三、需要协调的事项
（列出需要他人配合的事项）`,

  project: `请按项目维度生成周报：

【项目进展】
（按项目逐个列出）

项目名称：
本周进展：
下周计划：
风险/问题：

【需要协调的事项】`,

  simple: `请生成简洁版周报：

【本周完成】
• （3-5条关键成果）

【下周计划】
• （3-5条重点任务）

【需要支持】
• （如有）`
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

// 通用生成函数
async function generate(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 2000
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'glm-4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    })

    return completion.choices[0].message.content || '生成失败，请重试'
  } catch (error: any) {
    console.error('AI生成失败:', error)
    throw error
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
