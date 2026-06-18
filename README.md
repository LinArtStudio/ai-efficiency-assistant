# AI周报助手

> 用AI 3分钟生成专业周报，让你准时下班

## 功能特点

- ⚡ **极速生成**：3分钟生成完整周报
- 🎯 **智能优化**：AI自动提炼亮点，突出工作成果
- 📄 **多格式导出**：支持Word、纯文本一键导出
- 🎨 **多模板选择**：标准、项目、简洁三种模板
- 💰 **免费使用**：每日3次免费额度

## 技术栈

- **前端**：Next.js 14 + React 18 + Tailwind CSS
- **后端**：Next.js API Routes
- **AI**：OpenAI GPT-4 / 文心一言 / 通义千问
- **部署**：Vercel / Cloudflare Pages

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入你的API密钥：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# OpenAI API Key
OPENAI_API_KEY=sk-your-api-key-here

# 或者使用文心一言
# OPENAI_BASE_URL=https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop
# OPENAI_API_KEY=your-wenxin-key

# 或者使用通义千问
# OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
# OPENAI_API_KEY=your-dashscope-key
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

## 部署到Vercel

1. Fork 本仓库
2. 登录 [vercel.com](https://vercel.com)
3. 点击 "New Project" → 选择你的仓库
4. 添加环境变量：`OPENAI_API_KEY`
5. 点击 "Deploy"

## 部署到Cloudflare Pages

1. 运行 `npm run build`
2. 登录 [dash.cloudflare.com](https://dash.cloudflare.com)
3. 点击 "Workers & Pages" → "Create Application" → "Pages"
4. 上传 `out` 文件夹
5. 添加环境变量

## 目录结构

```
ai-weekly-report/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts  # AI生成API
│   │   │   └── export/route.ts    # 导出API
│   │   ├── generate/page.tsx      # 生成页面
│   │   ├── layout.tsx             # 布局
│   │   ├── page.tsx               # 首页
│   │   └── globals.css            # 全局样式
│   └── lib/
│       └── ai.ts                  # AI接口
├── public/                        # 静态资源
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## 许可证

MIT License

## 联系方式

- 小红书：@AI效率官
- 微信：添加客服微信

---

Made with ❤️ by AI
