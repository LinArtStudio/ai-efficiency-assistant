
import urllib.request
import json

# Read API key from .env.local
api_key = None
with open(".env.local", "r") as f:
    for line in f:
        if line.startswith("OPENAI_API_KEY="):
            api_key = line.strip().split("=", 1)[1]
            break

if not api_key:
    print("❌ 未找到API Key")
    exit(1)

print(f"API Key长度: {len(api_key)}")
print(f"Key前8位: {api_key[:8]}...")
print(f"Key后8位: ...{api_key[-8:]}")

url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}
data = json.dumps({
    "model": "glm-4-flash",
    "messages": [{"role": "user", "content": "你好，请用一句话介绍自己"}]
}).encode("utf-8")

req = urllib.request.Request(url, data=data, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        print("\n✅ API调用成功!")
        print(f"模型回复: {result['choices'][0]['message']['content']}")
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8")
    print(f"\n❌ API调用失败 (HTTP {e.code})")
    print(f"错误信息: {body}")
except Exception as e:
    print(f"\n❌ API调用失败: {e}")
