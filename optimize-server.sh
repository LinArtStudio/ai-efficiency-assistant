#!/bin/bash
# 服务器优化脚本
# 用于配置PM2内存限制和优化服务器性能

echo "=== 服务器优化脚本 ==="

# 1. 停止所有PM2进程
echo "1. 停止PM2进程..."
pm2 stop all

# 2. 删除旧的PM2配置
echo "2. 删除旧配置..."
pm2 delete all

# 3. 使用新的生态系统配置启动
echo "3. 使用新配置启动..."
cd /var/www/ai-efficiency-assistant
pm2 start ecosystem.config.js

# 4. 保存PM2配置
echo "4. 保存PM2配置..."
pm2 save

# 5. 显示状态
echo "5. 显示PM2状态..."
pm2 status

# 6. 显示内存使用
echo "6. 内存使用情况..."
free -h

echo "=== 优化完成 ==="
