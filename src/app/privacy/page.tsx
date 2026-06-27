'use client'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="text-blue-600 hover:text-blue-800">← 返回首页</a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">🔒 隐私政策</h1>
        
        <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-4">一、数据收集说明</h2>
            <div className="space-y-3 text-gray-600">
              <p><strong>我们收集的数据：</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>您输入的文本内容（用于AI生成）</li>
                <li>使用统计信息（生成次数、模块使用情况）</li>
                <li>设备信息（浏览器类型、操作系统）</li>
              </ul>
              <p><strong>我们不收集的数据：</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>个人身份信息（姓名、身份证号）</li>
                <li>联系方式（除非您主动提供）</li>
                <li>密码或支付信息</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">二、数据使用方式</h2>
            <div className="space-y-3 text-gray-600">
              <p>您的数据仅用于以下目的：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>AI生成</strong>：将您输入的内容发送给AI模型进行处理</li>
                <li><strong>服务改进</strong>：统计使用情况以优化服务质量</li>
                <li><strong>错误修复</strong>：分析错误日志以修复问题</li>
              </ul>
              <p className="font-medium text-green-600">✓ 我们不会将您的数据用于AI模型训练</p>
              <p className="font-medium text-green-600">✓ 我们不会将您的数据出售给第三方</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">三、数据存储与安全</h2>
            <div className="space-y-3 text-gray-600">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>存储位置</strong>：数据存储在您的浏览器本地（localStorage）</li>
                <li><strong>传输加密</strong>：所有数据传输使用HTTPS加密</li>
                <li><strong>自动清理</strong>：历史记录最多保留50条，超出自动删除</li>
                <li><strong>手动清理</strong>：您可以随时清除浏览器数据</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">四、AI服务说明</h2>
            <div className="space-y-3 text-gray-600">
              <p>本工具使用智谱AI（GLM）提供的AI服务：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>您输入的内容会发送给智谱AI进行处理</li>
                <li>智谱AI的数据使用政策请参考其官方隐私政策</li>
                <li>建议不要输入敏感个人信息或商业机密</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">五、您的权利</h2>
            <div className="space-y-3 text-gray-600">
              <p>您享有以下权利：</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>知情权</strong>：了解我们如何收集和使用您的数据</li>
                <li><strong>删除权</strong>：随时清除浏览器中的本地数据</li>
                <li><strong>拒绝权</strong>：选择不使用本工具</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">六、Cookie说明</h2>
            <div className="space-y-3 text-gray-600">
              <p>本工具使用localStorage存储数据，不使用Cookie。</p>
              <p>localStorage是浏览器提供的本地存储功能，数据仅保存在您的设备上。</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">七、儿童隐私</h2>
            <div className="space-y-3 text-gray-600">
              <p>本工具不面向13岁以下儿童，不会故意收集儿童的个人信息。</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">八、政策更新</h2>
            <div className="space-y-3 text-gray-600">
              <p>我们可能会不时更新本隐私政策。更新后的政策将在本页面发布。</p>
              <p>最后更新时间：2026年6月26日</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">九、联系我们</h2>
            <div className="space-y-3 text-gray-600">
              <p>如果您对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
              <p>邮箱：15902234202@163.com</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
