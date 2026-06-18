@echo off
chcp 65001 >nul
echo ========================================
echo   AI办公效率助手 - Gitee 部署脚本
echo ========================================
echo.

echo [1/4] 请先注册 Gitee 账号：https://gitee.com
echo.
echo [2/4] 创建仓库：
echo   - 仓库名：ai-efficiency-assistant
echo   - 选择「公开」
echo   - 点击「创建」
echo.
echo [3/4] 输入你的 Gitee 用户名：
set /p GITEE_USER=用户名：

echo.
echo [4/4] 添加 Gitee 远程仓库...
git remote add gitee https://gitee.com/%GITEE_USER%/ai-efficiency-assistant.git 2>nul
if errorlevel 1 (
    echo 远程仓库已存在，更新地址...
    git remote set-url gitee https://gitee.com/%GITEE_USER%/ai-efficiency-assistant.git
)

echo.
echo 正在推送到 Gitee...
git push gitee main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败！请检查：
    echo   1. Gitee 用户名是否正确
    echo   2. 仓库是否已创建
    echo   3. 网络连接是否正常
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 代码推送成功！
echo.
echo ========================================
echo   下一步：启用 Gitee Pages
echo ========================================
echo.
echo 1. 打开：https://gitee.com/%GITEE_USER%/ai-efficiency-assistant
echo 2. 点击「服务」→「Gitee Pages」
echo 3. 部署分支：main
echo 4. 部署目录：/
echo 5. 点击「启动」
echo 6. 等待1-2分钟
echo.
echo 访问地址：https://%GITEE_USER%.gitee.io/ai-efficiency-assistant
echo.
pause
