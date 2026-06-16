# -*- coding: utf-8 -*-
"""
AI办公效率助手 - B站内容脚本半自动生成工具
基于行业报告数据，批量生成融入报告引用和真实场景的视频脚本初稿

使用方式：
  python content_batch.py                    # 生成所有选题脚本
  python content_batch.py --topic 1          # 只生成第1个选题
  python content_batch.py --list             # 列出所有选题
  python content_batch.py --custom "你的主题" # 自定义主题生成
"""
import json, os, argparse
from datetime import datetime

# 基于脚本所在目录定位文件
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
TOPICS_JSON = os.path.join(SCRIPT_DIR, "topics.json")
DEFAULT_OUTPUT_DIR = os.path.join(PROJECT_ROOT, "02-输出成果", "scripts")

REPORT_DATA = {
    "ai_growth": {"stat":"281.6%","desc":"AI岗位需求增长","source":"猎聘2025年度人才供需趋势报告","detail":"AI人才供需比达到1:43.1，人才极度紧缺；2026年AI薪资中位数较2025年上涨53.2%"},
    "sme_pain": {"stat":"三缺","desc":"中小企业数字化面临缺资金、缺技术、缺人才","source":"2026年两会政府工作报告","detail":"中小企业数字化转型的核心障碍，办公效率低下是最直接痛点"},
    "policy": {"stat":"十五五","desc":"数字化转型作为国家战略","source":"宏观策略-十五五系列专题报告","detail":"十五五规划将数字化转型和制造业智能化升级列为重点方向"},
    "manufacturing": {"stat":"不到30%","desc":"制造业数字化渗透率","source":"人工智能产业十五五展望报告","detail":"中小制造企业对年费1K-5K的SaaS接受度最高"},
    "new_jobs": {"stat":"15.1%","desc":"新就业形态占比","source":"智联招聘2025中国新就业形态报告","detail":"灵活就业人群活跃于内容平台，AI赋能个体创作者成为趋势"},
    "salary": {"stat":"53.2%","desc":"AI薪资涨幅","source":"猎聘大数据视角下的2025年紧缺岗位薪资洞察","detail":"个人效率工具年付费意愿中位数200-300元"}
}

TOPIC_TEMPLATES = [
    {"id":1,"title":"项目经理一天5个会，AI纪要怎么帮","hook":"猎聘报告显示AI岗位需求增长281.6%，但你知道AI最被低估的用途是什么吗？","report_key":"ai_growth","pain_point":"项目经理每天5个会，整理纪要耗时2小时","solution":"AI自动识别会议重点，3分钟生成结构化纪要","data_compare":"传统2小时 vs AI 3分钟，每周节省47.5小时","cta":"评论区扣1获取工具，前100名永久Pro","tags":["AI工具","会议纪要","项目经理","办公效率"]},
    {"id":2,"title":"80%中小企业还在用Excel，我做了个工具","hook":"两会报告说中小企业数字化面临三缺：缺资金、缺技术、缺人才","report_key":"sme_pain","pain_point":"周报每周花3-4小时编写，内容重复效率低","solution":"AI自动生成专业周报，10分钟完成原本4小时的工作","data_compare":"传统4小时 vs AI 10分钟，每月节省15小时","cta":"评论区扣1获取工具，零成本解决数字化痛点","tags":["中小企业","数字化转型","AI工具","周报生成"]},
    {"id":3,"title":"十五五规划下的效率革命：AI办公工具如何抓住政策红利","hook":"十五五规划明确将数字化转型作为国家战略，这对我们意味着什么？","report_key":"policy","pain_point":"政策利好但个人和中小企业不知如何落地","solution":"用AI办公工具作为数字化转型的第一步","data_compare":"政策窗口期+AI工具爆发期，双重红利叠加","cta":"关注我，持续分享十五五规划下的AI落地实践","tags":["十五五规划","政策红利","AI办公","数字化转型"]},
    {"id":4,"title":"AI人才供需比1:43，为什么你还没用上AI工具？","hook":"AI人才供需比1:43.1，但80%的打工人还在手动干活","report_key":"ai_growth","pain_point":"AI人才极度紧缺，但普通人还没意识到AI工具的价值","solution":"不需要懂AI技术，普通人也能用的AI办公工具","data_compare":"AI薪资上涨53.2%，用AI工具=给自己加薪","cta":"评论区扣1，教你零基础上手AI工具","tags":["AI人才","AI工具","职场效率","零基础"]},
    {"id":5,"title":"制造业数字化渗透率不到30%，小工厂的机会在哪？","hook":"报告显示制造业数字化渗透率不到30%，这意味着巨大的蓝海市场","report_key":"manufacturing","pain_point":"中小制造企业管理者还在用纸和Excel管理产线","solution":"从会议纪要和周报切入，逐步覆盖制造业管理场景","data_compare":"年费1K-5K是制造业SaaS最佳定价区间","cta":"如果你是制造业从业者，评论区告诉我你的痛点","tags":["制造业","数字化","SaaS","中小企业"]},
    {"id":6,"title":"新就业形态占比15.1%，灵活办公需要什么工具？","hook":"新就业形态占比15.1%且持续增长，你的工作方式变了吗？","report_key":"new_jobs","pain_point":"灵活就业者缺乏标准化的办公工具","solution":"AI工具帮助灵活就业者标准化工作流程","data_compare":"AI赋能个体创作者，一人公司成为趋势","cta":"评论区扣1获取适合灵活办公的AI工具","tags":["灵活就业","新就业形态","AI办公","一人公司"]},
    {"id":7,"title":"29元/月值不值？AI办公工具的定价逻辑","hook":"AI薪资上涨53.2%，但一个月29元的效率工具值不值？","report_key":"salary","pain_point":"不确定AI工具是否值得付费","solution":"29元/月=每天不到1元，节省的时间远超这个价格","data_compare":"按报告时薪计算，每月节省时间价值500+元","cta":"评论区扣1免费试用，用数据说话","tags":["AI工具","定价","性价比","办公效率"]},
    {"id":8,"title":"从B站视频到产品用户：一个大学生的AI创业实录","hook":"零资金、零人脉的大学生，如何用AI工具创业？","report_key":"policy","pain_point":"大学生创业缺资金缺资源","solution":"用AI开发工具，用内容吸引用户，用数据驱动增长","data_compare":"十五五规划鼓励创新创业，政策红利期","cta":"关注我的创业实录，一起见证从0到1","tags":["创业","大学生","AI工具","内容创业"]}
]

def load_topics_from_json(filepath=None):
    """从 topics.json 加载选题配置，覆盖默认模板"""
    if filepath is None:
        filepath = TOPICS_JSON
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list) and len(data) > 0:
                return data
        except Exception as e:
            print(f"加载 {filepath} 失败: {e}")
    return None
def generate_script(topic):
    report = REPORT_DATA.get(topic.get("report_key","ai_growth"), REPORT_DATA["ai_growth"])
    tags_str = " ".join(["#"+t for t in topic.get("tags",["AI工具","办公效率"])])
    return f"""# 《{topic['title']}》

## 视频信息
- 标题：《{topic['title']}》
- 时长：5-7分钟
- 平台：B站
- 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}

## 开场钩子（0-15秒）

{topic['hook']}

## 痛点展示（15-60秒）

根据{report['source']}的数据：

{topic['pain_point']}

这是不是你的日常？让我们用数据说话：
- {report['stat']}：{report['desc']}
- {report['detail']}

## 解决方案演示（1-4分钟）

{topic['solution']}

### 具体操作步骤：
1. 打开AI办公效率助手
2. 输入你的工作内容/上传文件
3. AI自动生成结构化输出
4. 一键导出，直接使用

## 效果对比（4-5分钟）

{topic['data_compare']}

| 指标 | 传统方式 | AI工具 |
|------|----------|--------|
| 耗时 | 高 | 极低 |
| 质量 | 不稳定 | 标准化 |
| 成本 | 人力成本高 | 效率大幅提升 |

## 数据支撑（5-6分钟）

根据{report['source']}：

- {report['stat']}：{report['desc']}
- {report['detail']}

这说明AI工具不仅是趋势，更是当下就能落地的效率方案。

## 结尾引导（6-7分钟）

{topic['cta']}

AI办公效率助手 - 让每个人都用得起AI

---
**标签：** {tags_str}

**报告来源：**
- {report['source']}
"""

def save_script(script, topic_id, title, output_dir=None):
    if output_dir is None:
        output_dir = DEFAULT_OUTPUT_DIR
    os.makedirs(output_dir, exist_ok=True)
    safe = title.replace("/","-").replace("\\","-").replace(":","-").replace("?","").replace('"',"").replace("*","")
    path = os.path.join(output_dir, f"{topic_id:02d}_{safe[:30]}.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write(script)
    return path

def list_topics():
    print("\n=== AI办公效率助手 - 选题列表 ===\n")
    for t in TOPIC_TEMPLATES:
        r = REPORT_DATA.get(t["report_key"],{})
        print(f"  [{t['id']}] {t['title']}")
        print(f"      报告依据：{r.get('source','未知')}")
        print(f"      核心数据：{r.get('stat','')} {r.get('desc','')}")
        print()

def generate_all(output_dir=None):
    if output_dir is None:
        output_dir = DEFAULT_OUTPUT_DIR
    print("\n=== 批量生成视频脚本 ===\n")
    for t in TOPIC_TEMPLATES:
        s = generate_script(t)
        p = save_script(s, t["id"], t["title"], output_dir)
        print(f"  √ 已生成: {p}")
    print(f"\n共生成 {len(TOPIC_TEMPLATES)} 个脚本")

def generate_one(tid, output_dir=None):
    if output_dir is None:
        output_dir = DEFAULT_OUTPUT_DIR
    t = next((x for x in TOPIC_TEMPLATES if x["id"]==tid), None)
    if not t:
        print(f"× 未找到选题编号 {tid}")
        return
    s = generate_script(t)
    p = save_script(s, t["id"], t["title"], output_dir)
    print(f"  √ 已生成: {p}")

def generate_custom(title, report_key="ai_growth", output_dir=None):
    if output_dir is None:
        output_dir = DEFAULT_OUTPUT_DIR
    r = REPORT_DATA.get(report_key, REPORT_DATA["ai_growth"])
    t = {"id":99,"title":title,"hook":f"{r['stat']}：{r['desc']}","report_key":report_key,"pain_point":f"基于{r['source']}的分析","solution":"AI工具提供零成本解决方案","data_compare":"AI工具显著提升效率","cta":"评论区扣1获取工具","tags":["AI工具","自定义主题"]}
    s = generate_script(t)
    p = save_script(s, 99, title, output_dir)
    print(f"  √ 已生成自定义脚本: {p}")

if __name__=="__main__":
    # 尝试从 topics.json 加载选题配置
    loaded = load_topics_from_json()
    if loaded:
        TOPIC_TEMPLATES[:] = loaded
    parser = argparse.ArgumentParser(description="AI办公效率助手 - 内容脚本批量生成工具")
    parser.add_argument("--list", action="store_true", help="列出所有选题")
    parser.add_argument("--topic", type=int, help="生成指定编号的选题脚本")
    parser.add_argument("--all", action="store_true", help="批量生成所有选题脚本")
    parser.add_argument("--custom", type=str, help="自定义主题生成脚本")
    parser.add_argument("--report", type=str, default="ai_growth", help="自定义主题的报告依据key")
    parser.add_argument("--output", type=str, default=DEFAULT_OUTPUT_DIR, help="输出目录")
    args = parser.parse_args()
    if args.list:
        list_topics()
    elif args.topic:
        generate_one(args.topic, args.output)
    elif args.custom:
        generate_custom(args.custom, args.report, args.output)
    elif args.all:
        generate_all(args.output)
    else:
        list_topics()
        generate_all(args.output)