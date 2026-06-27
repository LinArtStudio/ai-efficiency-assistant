// PM2生态系统配置
// 用于限制每个项目的内存使用

module.exports = {
  apps: [
    {
      name: 'ai-career',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/ai-career-tool',
      max_memory_restart: '200M',  // 最大内存200MB
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'ai-efficiency',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/ai-efficiency-assistant',
      max_memory_restart: '200M',  // 最大内存200MB
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'ai-ops',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/ai-ops-workstation',
      max_memory_restart: '200M',  // 最大内存200MB
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      }
    }
  ]
}
