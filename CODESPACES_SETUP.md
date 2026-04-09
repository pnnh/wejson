# Codespaces 开发配置指南

该项目已完全配置为在 GitHub Codespaces 中使用。

## 配置内容

### 1. Dev Container 配置 (`.devcontainer/devcontainer.json`)
- **基础镜像**: Node.js 20 官方镜像
- **功能**: Git、GitHub CLI
- **VS Code 扩展**: Next.js、Prettier、ESLint、Tailwind CSS IntelliSense 等
- **自动化**: 容器创建时自动运行 `npm install`
- **端口转发**: 自动转发端口 3000 给 Next.js 开发服务器

### 2. VS Code 工作区设置 (`.vscode/`)
- **settings.json** - 编辑器、格式化和 TypeScript 配置
- **extensions.json** - 推荐的扩展列表
- **launch.json** - 调试配置

### 3. 项目配置文件
- **package.json** - npm 依赖和脚本
- **tsconfig.json** - TypeScript 配置
- **next.config.js** - Next.js 配置
- **tailwind.config.ts** - Tailwind CSS 配置
- **.eslintrc.json** - ESLint 配置
- **jest.config.js** - Jest 测试配置
- **.prettierrc.json** - Prettier 格式化配置

### 4. 项目结构
```
src/
├── app/           # Next.js App Router (layout + pages)
├── components/    # React 组件
├── lib/          # 工具函数和库
public/           # 静态资源
.github/workflows/ # GitHub Actions CI/CD
```

## 快速开始 (Codespaces)

### 第一次使用

1. **创建 Codespace**
   - 在 GitHub 仓库点击 `<> Code` 按钮
   - 选择 `Codespaces` 标签
   - 点击 `Create codespace on main`

2. **等待容器初始化**
   - Dev container 会自动构建
   - `npm install` 会自动执行
   - VS Code 会自动安装推荐的扩展

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   - 应用会在 `http://localhost:3000` 运行
   - Codespaces 会自动创建公共 URL

### 日常使用

**先安装依赖（如果第一次运行）：**
```bash
npm install
```

**启动开发服务器：**
```bash
npm run dev
```

**在另一个终端进行其他操作：**
```bash
npm run lint        # 检查代码
npm run type-check  # 类型检查
npm test            # 运行测试
npm run build       # 构建生产版本
```

## 环境变量

1. 复制示例文件：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local` 添加你的环境变量

3. Codespaces 中这些变量会自动加载

## 调试

### 使用 VS Code 调试器
1. 打开 `.vscode/launch.json` 中配置的启动配置
2. 按 `F5` 或点击"Run and Debug"侧栏
3. 选择"Next.js Dev Server"
4. 添加断点并调试

### 浏览器开发工具
- 在本地浏览器中打开生成的 Codespaces URL
- 使用 Chrome DevTools（F12）进行前端调试

## 推荐工作流

**开发新功能：**
```bash
# 启动开发服务器
npm run dev

# 在另一个终端检查代码
npm run lint:fix

# 类型检查
npm run type-check

# 测试
npm test
```

**上线前：**
```bash
npm run lint        # 检查代码风格
npm run type-check  # 检查类型
npm test            # 运行所有测试
npm run build       # 验证构建成功
```

## 常见操作

### 添加新包
```bash
npm install package-name
```
包会自动添加到 `package.json`

### 更新 .env.example
当添加新环境变量时，同时更新 `.env.example`：
```bash
# 当前的变量
NEXT_PUBLIC_API_URL=
DATABASE_URL=
```

### 提交更改
```bash
git add .
git commit -m "feat: 添加新功能"
git push
```

## 性能优化

- Codespaces 运行时 使用 VS Code 内置终端而非外部终端
- 定期清理 node_modules：`rm -rf node_modules && npm install`
- 在"Stop codespace"停止不用的实例可节省计算量

## 资源

- [GitHub Codespaces 文档](https://docs.github.com/codespaces)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Dev Containers 文档](https://containers.dev/)

## 常见问题

**Q: 端口 3000 被占用了？**
- A: 修改 `next.config.js` 中的端口号，或在环境变量中设置 `PORT=3001`

**Q: 如何重新构建 dev container？**
- A: VS Code 命令面板 > "Dev Containers: Rebuild Container"

**Q: 如何增加存储空间？**
- A: 在 Codespaces 设置中修改存储配置

**Q: 扩展没有加载？**
- A: VS Code 命令面板 > "Developer: Reload Window"
