# 百度统计配置指南

## 步骤1：注册百度统计

1. 打开 https://tongji.baidu.com
2. 使用百度账号登录（没有就注册一个）
3. 点击「管理」→「新增网站」

## 步骤2：添加网站

填写信息：
- **网站域名**：`linartstudio.github.io`
- **网站名称**：AI办公效率助手
- **行业类别**：「IT/互联网」→「软件/应用」
- **网站地区**：选择你的省份

## 步骤3：获取统计代码

添加完成后，会获得一段 JavaScript 代码，类似：

```javascript
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?你的统计ID";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
```

## 步骤4：添加到网站

把这段代码添加到 `index.html` 和 `tool.html` 的 `<head>` 标签中：

```html
<head>
  <!-- 其他代码 -->
  
  <!-- 百度统计 -->
  <script>
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?你的统计ID";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
  </script>
</head>
```

## 步骤5：验证安装

1. 保存文件并推送到 GitHub
2. 访问你的网站
3. 回到百度统计后台，点击「代码安装检查」
4. 显示「安装成功」即可

## 步骤6：查看数据

- **实时访客**：查看当前在线人数
- **流量分析**：查看每日 PV/UV
- **访客分析**：查看用户地域、设备、浏览器
- **来源分析**：查看用户从哪里来

---

## 高级功能

### 设置转化目标
1. 进入「管理」→「转化目标」
2. 添加目标：
   - **注册转化**：访问 /tool.html 后注册
   - **付费转化**：点击支付按钮

### 设置事件追踪
追踪重要按钮点击：
```javascript
// 示例：追踪「生成」按钮点击
document.getElementById('generateBtn').addEventListener('click', function() {
  _hmt.push(['_trackEvent', '按钮', '点击', '生成会议纪要']);
});
```

---

## 替代方案：Google Analytics

如果百度统计访问困难，可以用 Google Analytics：

1. 打开 https://analytics.google.com
2. 创建账号和媒体资源
3. 获取跟踪代码
4. 添加到网站

**注意**：Google Analytics 在国内访问可能不稳定。

---

## 数据隐私

- 百度统计符合中国法规
- 不收集敏感个人信息
- 可在隐私政策中说明使用统计工具

---

*配置完成后，告诉我，我继续帮你准备 B站视频素材。*
