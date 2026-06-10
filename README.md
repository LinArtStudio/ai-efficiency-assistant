# AI办公效率助手

> 基于23份行业报告数据，专为中小企业和职场人打造的AI办公效率工具

## 项目结构

```
一号项目/
├── index.html                  ← 着陆页（GitHub Pages 部署，保留在根目录）
├── README.md                   ← 本文件
│
├── 01-需求文档/                ← 规划、策略、模板
│   ├── content_plan.md         ← B站两周选题计划
│   ├── first_week_action_plan.md ← 第一周行动清单
│   ├── long_term_assets.md     ← 长期资产路线图
│   ├── report_insights.md      ← 23份报告洞察
│   ├── user_community_plan.md  ← 社群运营方案
│   ├── week1_数据复盘模板.md    ← 复盘模板
│   └── 一号项目启动说明.docx    ← Word启动文档
│
├── 02-输出成果/                ← 最终交付物
│   ├── scripts/                ← 8篇B站视频脚本（含优化版第1集）
│   ├── bilibili_video01-03_发布素材包.md
│   ├── 内容追踪表.md
│   ├── 发布检查清单.md
│   ├── 数据复盘-20260608.md
│   ├── tool.html               ← 在线工具页面
│   └── hyperframes_demo.html   ← 竖版视频演示
│
├── 03-过程文件/                ← 代码、工具、中间产物
│   ├── content_batch.py        ← 脚本批量生成工具
│   ├── app.js                  ← 后端API（Express）
│   ├── topics.json             ← 选题配置
│   ├── pdf_analysis.json       ← PDF分析数据
│   └── requirements.txt        ← Python依赖
│
└── 04-参考资料/                ← 图片素材
    ├── IMG_321[1].png
    └── image_115556615[2].jpg  ← 支付二维码
```

## 产品信息

- **GitHub：** [LinArtStudio/ai-efficiency-assistant](https://github.com/LinArtStudio/ai-efficiency-assistant)
- **着陆页：** https://linartstudio.github.io/ai-efficiency-assistant/
- **定价：** 免费版（每月10次纪要+5次周报）/ Pro版 ¥29/月

## 核心功能

| 功能 | 状态 |
|------|------|
| 智能会议纪要 | 着陆页已展示，后端 API 待接入 |
| 批量周报生成 | 着陆页已展示，后端 API 待接入 |
| B站内容矩阵 | 8篇视频脚本已完成，待录制 |

## 内容生产流程

1. 选题确认 → `01-需求文档/content_plan.md`
2. 脚本生成 → `python 03-过程文件/content_batch.py --topic N`
3. 录制剪辑 → 参考 `02-输出成果/发布检查清单.md`
4. B站发布 → 参考 `02-输出成果/bilibili_video*_发布素材包.md`
5. 数据复盘 → 参考 `02-输出成果/内容追踪表.md`

## 使用方式

```bash
# 生成视频脚本
python 03-过程文件/content_batch.py --list
python 03-过程文件/content_batch.py --all
python 03-过程文件/content_batch.py --topic 1
```

## 更新日志

- 2026-06-10 - 整理为四层目录结构
- 2026-06-09 - 添加在线工具页面（tool.html）
- 2026-06-08 - 初始化项目，完成全部8篇视频脚本
