#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AI办公工具箱 - B站内容脚本批量生成器

功能：
1. 根据输入参数生成视频脚本初稿
2. 支持批量生成多条脚本
3. 自动融入数据来源和用户痛点

使用方法：
    python content_batch.py --title "标题" --hook "钩子" --pain_point "痛点" --solution "方案" --data_source "来源"
    python content_batch.py --batch content_plan.json

作者：在校大学生开发者
日期：2026-06-15
"""

import argparse
import json
import os
from datetime import datetime
from typing import Dict, List, Optional


# 脚本模板
SCRIPT_TEMPLATE = """
# {title}

## 视频信息
- **标题**：{title}
- **时长**：5-8分钟
- **目标**：{target}
- **数据来源**：{data_source}

---

## 脚本内容

### [0:00-0:30] 钩子
{hook}

**旁白/口播**：
"你是不是也这样？{pain_point}今天分享一个我自己的解决方案。"

---

### [0:30-1:00] 自我介绍
"大家好，我是一名在校大学生，自己做了个AI办公工具。
一开始是为了解决自己的痛点，后来发现很多人都有同样的问题。"

---

### [1:00-3:00] 痛点展示

**场景还原**：
{pain_scene}

**数据支撑**：
{data_support}

**旁白/口播**：
"相信很多人都经历过这种场景。根据{data_source}，{data_point}。"

---

### [3:00-5:00] 解决方案演示

**操作流程**：
1. {step1}
2. {step2}
3. {step3}

**效果对比**：
- 使用前：{before}
- 使用后：{after}

**旁白/口播**：
"现在我们来看看实际效果。{demo_intro}..."

---

### [5:00-6:00] 用户反馈

**真实评价**：
{user_feedback}

**效率提升**：
{efficiency_gain}

**旁白/口播**：
"这是早期用户的真实反馈。{feedback_summary}。"

---

### [6:00-7:00] 价值升华

**核心观点**：
{core_value}

**金句**：
"{golden_quote}"

**旁白/口播**：
"这个工具不只是省时间，更是让你专注于真正重要的事。{value升华}。"

---

### [7:00-7:30] 转化引导

**话术**：
"想要体验的，评论区扣1，私信我发链接。
免费版够用，不用有心理负担。
如果觉得好用，再考虑升级Pro版。"

---

### [7:30-8:00] 结尾

**预告**：
"下期预告：{next_episode}"

**引导关注**：
"我是XX，一个用AI解决办公痛点的在校生，我们下期见。"

---

## 制作备注

### 素材准备
- [ ] 录制痛点场景演示
- [ ] 录制工具操作演示
- [ ] 收集用户反馈截图
- [ ] 准备数据图表

### 剪辑要点
- 钩子部分要抓人，3秒内抛出痛点
- 演示部分要清晰，关键步骤放大展示
- 数据部分要可视化，用图表代替纯文字
- 节奏要快，避免冗长的铺垫

### 发布策略
- 发布时间：工作日晚上8-10点（职场人刷B站高峰）
- 标签：#AI办公 #效率工具 #职场干货 #周报 #会议记录
- 简介：引导评论互动，设置钩子问题

---

*脚本生成时间：{generate_time}*
*工具版本：content_batch.py v1.0*
"""


class ContentGenerator:
    """内容脚本生成器"""

    def __init__(self):
        self.templates = {
            "会议记录": {
                "pain_scene": "项目经理小王每天开3场协调会，会议结束后还要花1.5小时整理记录。经常是晚上10点还在写会议纪要，第二天又要早起开会。",
                "data_support": "中国企业平均每天召开3.2场内部会议，其中67%需要产出会议纪要。传统人工整理会议记录耗时约30-45分钟/场。",
                "step1": "上传会议录音或文字记录",
                "step2": "AI自动识别关键决策、待办事项、责任人",
                "step3": "生成结构化会议纪要，一键分享给团队",
                "before": "开完会还要加班整理1.5小时",
                "after": "5分钟生成专业会议纪要",
                "user_feedback": "室友说：以前最怕开会后的整理，现在反而期待开会了。",
                "efficiency_gain": "每场会议节省30分钟，一天3场会议节省1.5小时",
                "core_value": "把时间花在会议本身，而不是会议后的整理",
                "golden_quote": "好的工具不是让你做更多事，而是让你专注于真正重要的事",
                "next_episode": "周报写到吐？我用AI一键生成，主管还夸我写得详细"
            },
            "周报生成": {
                "pain_scene": "每周五下午3点，全办公室都在憋周报。运营主管小李管理8人团队，以前每周五下午全员憋周报，经常是'这周干了啥来着？'",
                "data_support": "72%的职场人表示'周报写到吐'，平均耗时1.5小时/周。管理者更关注'数据可视化'和'进度追踪'，而非文字堆砌。",
                "step1": "输入本周工作要点（几句话就行）",
                "step2": "AI自动润色、补充数据、生成专业周报",
                "step3": "支持批量处理多人周报，主管一键查看",
                "before": "每周五下午全员憋周报，效率极低",
                "after": "10分钟批量生成8人周报，主管还夸写得详细",
                "user_feedback": "运营主管小李说：以前最怕周五下午，现在反而期待看AI生成的周报。",
                "efficiency_gain": "每人每周节省1.5小时，8人团队每周节省12小时",
                "core_value": "让周报回归本质：记录成长，而非应付检查",
                "golden_quote": "周报不是写给领导看的，是写给未来的自己看的",
                "next_episode": "我做了个AI办公工具，第一个用户是室友"
            }
        }

    def generate_script(
        self,
        title: str,
        hook: str,
        pain_point: str,
        solution: str,
        data_source: str,
        template_type: Optional[str] = None
    ) -> str:
        """生成单条视频脚本"""

        # 根据标题自动匹配模板类型
        if template_type is None:
            if "会议" in title or "会" in title:
                template_type = "会议记录"
            elif "周报" in title:
                template_type = "周报生成"
            else:
                template_type = "会议记录"  # 默认模板

        template = self.templates.get(template_type, self.templates["会议记录"])

        # 生成目标描述
        target = f"解决{pain_point}的痛点，展示{solution}的解决方案"

        # 生成演示介绍
        demo_intro = f"我们来演示一下{solution}的实际效果"

        # 生成反馈总结
        feedback_summary = f"可以看出，{solution}确实解决了{pain_point}的问题"

        # 生成价值升华
        value升华 = f"这就是我做这个工具的初衷——{template['core_value']}"

        # 填充模板
        script = SCRIPT_TEMPLATE.format(
            title=title,
            target=target,
            data_source=data_source,
            hook=hook,
            pain_point=pain_point,
            pain_scene=template["pain_scene"],
            data_support=template["data_support"],
            data_point=template["data_support"].split("。")[0] + "。",
            step1=template["step1"],
            step2=template["step2"],
            step3=template["step3"],
            before=template["before"],
            after=template["after"],
            demo_intro=demo_intro,
            user_feedback=template["user_feedback"],
            efficiency_gain=template["efficiency_gain"],
            feedback_summary=feedback_summary,
            core_value=template["core_value"],
            golden_quote=template["golden_quote"],
            value升华=value升华,
            next_episode=template["next_episode"],
            generate_time=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )

        return script

    def batch_generate(self, content_plan_file: str) -> List[str]:
        """批量生成脚本"""
        with open(content_plan_file, 'r', encoding='utf-8') as f:
            content_plan = json.load(f)

        scripts = []
        for item in content_plan.get("topics", []):
            script = self.generate_script(
                title=item["title"],
                hook=item["hook"],
                pain_point=item.get("pain_point", "办公效率低下"),
                solution=item.get("solution", "AI办公工具"),
                data_source=item.get("data_source", "行业公开数据"),
                template_type=item.get("template_type")
            )
            scripts.append(script)

        return scripts


def main():
    parser = argparse.ArgumentParser(description="AI办公工具箱 - B站内容脚本批量生成器")
    parser.add_argument("--title", type=str, help="视频标题")
    parser.add_argument("--hook", type=str, help="钩子脚本")
    parser.add_argument("--pain_point", type=str, help="核心痛点描述")
    parser.add_argument("--solution", type=str, help="解决方案要点")
    parser.add_argument("--data_source", type=str, default="行业公开数据+用户场景描述", help="数据来源说明")
    parser.add_argument("--template_type", type=str, choices=["会议记录", "周报生成"], help="模板类型")
    parser.add_argument("--batch", type=str, help="批量生成的JSON文件路径")
    parser.add_argument("--output", type=str, default="scripts", help="输出目录")

    args = parser.parse_args()

    generator = ContentGenerator()

    # 创建输出目录
    os.makedirs(args.output, exist_ok=True)

    if args.batch:
        # 批量生成模式
        scripts = generator.batch_generate(args.batch)
        for i, script in enumerate(scripts):
            output_file = os.path.join(args.output, f"script_{i+1}.md")
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(script)
            print(f"✅ 生成脚本 {i+1}: {output_file}")
        print(f"\n共生成 {len(scripts)} 条脚本")
    elif args.title:
        # 单条生成模式
        script = generator.generate_script(
            title=args.title,
            hook=args.hook or "你是不是也这样？",
            pain_point=args.pain_point or "办公效率低下",
            solution=args.solution or "AI办公工具",
            data_source=args.data_source,
            template_type=args.template_type
        )

        # 生成文件名
        safe_title = args.title[:20].replace(" ", "_").replace("？", "").replace("！", "")
        output_file = os.path.join(args.output, f"script_{safe_title}.md")

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(script)
        print(f"✅ 生成脚本: {output_file}")
    else:
        # 交互式模式
        print("🎬 AI办公工具箱 - B站内容脚本生成器")
        print("=" * 50)
        title = input("请输入视频标题：")
        hook = input("请输入钩子脚本：")
        pain_point = input("请输入核心痛点：")
        solution = input("请输入解决方案：")
        data_source = input("请输入数据来源（默认：行业公开数据）：") or "行业公开数据"

        script = generator.generate_script(
            title=title,
            hook=hook,
            pain_point=pain_point,
            solution=solution,
            data_source=data_source
        )

        safe_title = title[:20].replace(" ", "_").replace("？", "").replace("！", "")
        output_file = os.path.join(args.output, f"script_{safe_title}.md")

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(script)
        print(f"\n✅ 生成脚本: {output_file}")


if __name__ == "__main__":
    main()
