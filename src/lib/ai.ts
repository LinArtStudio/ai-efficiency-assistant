import OpenAI from 'openai'

// 支持多个AI服务商
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
})

const templates: Record<string, string> = {
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

export async function generateReport(
  content: string,
  template: string = 'standard'
): Promise<string> {
  const templatePrompt = templates[template] || templates.standard

  const prompt = `你是一个专业的周报写作助手。请根据以下工作内容，生成一份结构化的周报。

工作内容：
${content}

${templatePrompt}

要求：
1. 语言专业、清晰、简洁
2. 突出工作亮点和成果
3. 尽量量化（添加完成度、数据等）
4. 直接输出周报内容，不要添加额外说明
5. 使用中文输出`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的周报写作助手，擅长将零散的工作内容整理成结构化、专业的周报。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    return completion.choices[0].message.content || '生成失败，请重试'
  } catch (error: any) {
    console.error('AI生成失败:', error)

    // 如果OpenAI失败，返回模拟结果（开发测试用）
    if (process.env.NODE_ENV === 'development') {
      return generateMockReport(content, template)
    }

    throw error
  }
}

// 开发环境模拟生成
function generateMockReport(content: string, template: string): string {
  const lines = content.split('\n').filter(l => l.trim())

  if (template === 'simple') {
    return `【本周完成】
• ${lines[0] || '完成核心工作任务'}
• ${lines[1] || '参与团队协作会议'}
• ${lines[2] || '推进项目进展'}

【下周计划】
• 继续推进当前项目
• 完成待办事项
• 参加团队会议

【需要支持】
• 暂无`
  }

  return `【本周工作总结】

一、重点工作完成情况
${lines.map((line, i) => `${i + 1}. ${line}（完成度：100%）`).join('\n')}

二、下周工作计划
1. 继续推进当前项目进展
2. 完成待办事项和遗留任务
3. 参加团队会议和评审

三、需要协调的事项
1. 需要相关部门配合推进工作
2. 需要资源支持以完成任务

---
*此周报由AI周报助手生成*`
}
