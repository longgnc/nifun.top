<template>
  <div class="terminal-commands">
    <div class="search-box">
      <input type="text" v-model="searchQuery" placeholder="搜索命令 (如: ls, 权限...)" />
    </div>
    
    <div class="cmd-list">
      <div v-for="cmd in filteredCommands" :key="cmd.name" class="cmd-item">
        <div class="cmd-header">
          <span class="cmd-name">{{ cmd.name }}</span>
          <span class="cmd-tag">{{ cmd.category }}</span>
        </div>
        <div class="cmd-desc">{{ cmd.desc }}</div>
        <div class="cmd-example"><code>{{ cmd.example }}</code></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');

const commands = [
  { name: 'ls', desc: '列出目录内容', example: 'ls -la', category: '文件' },
  { name: 'cd', desc: '切换当前工作目录', example: 'cd /home', category: '文件' },
  { name: 'pwd', desc: '显示当前目录路径', example: 'pwd', category: '文件' },
  { name: 'mkdir', desc: '创建新目录', example: 'mkdir new_folder', category: '文件' },
  { name: 'rm', desc: '删除文件或目录', example: 'rm -rf folder', category: '文件' },
  { name: 'cp', desc: '复制文件或目录', example: 'cp file.txt backup.txt', category: '文件' },
  { name: 'mv', desc: '移动或重命名文件', example: 'mv old.txt new.txt', category: '文件' },
  { name: 'touch', desc: '创建空文件或更新时间戳', example: 'touch file.txt', category: '文件' },
  { name: 'cat', desc: '查看文件内容', example: 'cat file.txt', category: '内容' },
  { name: 'grep', desc: '文本搜索', example: 'grep "text" file.txt', category: '内容' },
  { name: 'chmod', desc: '修改文件权限', example: 'chmod 755 script.sh', category: '权限' },
  { name: 'chown', desc: '修改文件所有者', example: 'chown user:group file', category: '权限' },
  { name: 'ps', desc: '查看当前进程', example: 'ps aux', category: '系统' },
  { name: 'top', desc: '实时显示进程动态', example: 'top', category: '系统' },
  { name: 'kill', desc: '终止进程', example: 'kill -9 PID', category: '系统' },
  { name: 'df', desc: '查看磁盘空间', example: 'df -h', category: '系统' },
  { name: 'du', desc: '查看文件占用空间', example: 'du -sh folder', category: '系统' },
  { name: 'tar', desc: '打包/解压文件', example: 'tar -czvf archive.tar.gz folder', category: '归档' },
  { name: 'wget', desc: '网络文件下载', example: 'wget http://example.com/file', category: '网络' },
  { name: 'curl', desc: '网络请求工具', example: 'curl -I http://example.com', category: '网络' },
  { name: 'systemctl', desc: '管理系统服务', example: 'systemctl restart nginx', category: '系统' },
  { name: 'ssh', desc: '远程登录', example: 'ssh user@host', category: '网络' },
  { name: 'sudo', desc: '以管理员身份执行', example: 'sudo apt update', category: '权限' },
];

const filteredCommands = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return commands;
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query) || 
    cmd.desc.toLowerCase().includes(query) ||
    cmd.category.includes(query)
  );
});
</script>

<style lang="scss" scoped>
.terminal-commands {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .search-box {
    margin-bottom: 15px;
    input {
      width: 100%;
      padding: 10px 15px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1);
      color: #fff;
      font-size: 0.95rem;
      
      &:focus {
        outline: none;
        background: rgba(255,255,255,0.15);
        border-color: #909399;
      }
    }
  }
  
  .cmd-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 5px;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
    }
    
    .cmd-item {
      background: rgba(0,0,0,0.2);
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 10px;
      border-left: 3px solid #909399;
      
      .cmd-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        
        .cmd-name {
          font-weight: bold;
          font-family: monospace;
          font-size: 1.1rem;
          color: #67c23a;
        }
        
        .cmd-tag {
          font-size: 0.75rem;
          padding: 2px 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
          opacity: 0.8;
        }
      }
      
      .cmd-desc {
        font-size: 0.9rem;
        margin-bottom: 8px;
        opacity: 0.9;
      }
      
      .cmd-example {
        code {
          display: block;
          background: rgba(0,0,0,0.3);
          padding: 5px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85rem;
          color: #e6a23c;
        }
      }
    }
  }
}
</style>