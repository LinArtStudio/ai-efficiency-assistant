# 职场AI提效工具 🚀

> 周报/邮件/会议纪要，一键搞定

一个专为职场人打造的AI效率工具，帮你节省80%的文书工作时间。

## ✨ 核心功能

| 功能 | 说明 | 节省时间 |
|------|------|----------|
| 📊 **AI周报** | 一键生成专业周报 | 2-3小时/周 |
| 🎤 **会议纪要** | 自动提取会议要点 | 1-2小时/次 |
| ✉️ **AI邮件** | 生成专业商务邮件 | 30分钟/封 |
| ✨ **文案润色** | 优化文案表达 | 20分钟/篇 |
| 🌐 **AI翻译** | 中英文互译 | 15分钟/篇 |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的API Key：

```env
# 智谱AI (GLM-4) - 推荐，免费额度大
OPENAI_API_KEY=你的智谱API Key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_MODEL=glm-4-flash

# 或者 DeepSeek
# OPENAI_API_KEY=你的DeepSeek Key
# OPENAI_BASE_URL=https://api.deepseek.com/v1
# AI_MODEL=deepseek-chat
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
npm start
```

## 📦 技术栈

- **前端**：Next.js 14 + React 18 + Tailwind CSS
- **后端**：Next.js API Routes
- **AI**：智谱GLM-4 / DeepSeek / OpenAI
- **部署**：Vercel / Cloudflare Pages

## 🌐 部署到Vercel

1. Fork 本仓库
2. 登录 [vercel.com](https://vercel.com)
3. 点击 "New Project" → 选择你的仓库
4. 添加环境变量：
   - `OPENAI_API_KEY`
   - `OPENAI_BASE_URL`
   - `AI_MODEL`
5. 点击 "Deploy"

## 📂 项目结构

```
ai-efficiency-assistant/
├── src/
│   ├── app/
│   │   ├── api/generate/route.ts   # AI生成API
│   │   ├── page.tsx                # 主页面
│   │   ├── layout.tsx              # 布局
│   │   └── globals.css             # 全局样式
│   └── lib/
│       └── ai.ts                   # AI接口封装
├── public/                         # 静态资源
├── .env.example                    # 环境变量模板
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 💰 商业模式

| 版本 | 价格 | 功能 |
|------|------|------|
| **免费版** | ¥0 | 每天5次生成 |
| **Pro版** | ¥19/月 | 无限次 + 高级模板 |
| **团队版** | ¥99/月 | 多人协作 + 企业管理 |

## 📱 联系方式

- 小红书：@AI效率官
- 微信：添加客服微信

## 📜 许可证

MIT License

---

Made with ❤️ by AI
