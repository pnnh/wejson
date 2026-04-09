# VS Code 开发设置指南

## 推荐扩展

项目配置了以下 VS Code 扩展（`.vscode/extensions.json`）：

| 扩展 | 说明 |
|------|------|
| Vercel's Next.js | Next.js 智能感知和快捷方式 |
| Prettier | 代码格式化 |
| ESLint | 代码检查 |
| Tailwind CSS IntelliSense | Tailwind CSS 自动完成 |
| TypeScript Vue Plugin | TypeScript 支持增强 |
| GitHub Copilot | AI 代码助手 |
| GitLens | Git 集成 |

## 工作区设置

`.vscode/settings.json` 已配置以下功能：

- **格式化保存** - 保存时自动格式化代码
- **自动导入排序** - 自动排序导入语句
- **ESLint 自动修复** - 保存时自动修复 ESLint 问题
- **TypeScript 工作区支持** - 使用项目的 TypeScript 版本

## 键盘快捷方式（建议）

| 快捷方式 | 操作 |
|---------|------|
| `Shift + Alt + F` | 格式化当前文件 |
| `Ctrl + Shift + P` > "ESLint: Fix all auto-fixable problems" | 修复所有 ESLint 问题 |
| `Ctrl + J` | 打开或关闭终端 |

## 调试配置

创建 `.vscode/launch.json` 来调试 Next.js 应用：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "runtimeVersion": "20",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "runtimeArgs": ["dev"],
      "console": "integratedTerminal",
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "Ready in .* \\(([^)]*)\\)",
        "uriFormat": "http://localhost:${port}"
      }
    }
  ]
}
```

## 常见问题

### TypeScript 显示红色波浪线？
- 点击右下角 TypeScript 版本选择器，选择"Use Workspace Version"

### Prettier 不工作？
- 打开命令面板（Ctrl+Shift+P），搜索"Prettier: Restart Server"

### ESLint 显示过时的错误？
- 打开命令面板，搜索"ESLint: Restart Server"
