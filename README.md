# WeJSON - Next.js Application

一个现代化的 Next.js 应用，配置了 TypeScript、Tailwind CSS、ESLint 等开发工具。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 可用命令

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 检查
- `npm run lint:fix` - 修复 ESLint 问题
- `npm run type-check` - 进行 TypeScript 类型检查
- `npm test` - 运行测试
- `npm run test:watch` - 监视模式下运行测试

## 项目结构

```
src/
  ├── app/              # Next.js App Router
  ├── components/       # React 组件
  ├── lib/             # 工具函数和库
  └── styles/          # 样式文件
public/               # 静态资源
.vscode/              # VS Code 配置
.devcontainer/        # Dev Container 配置
```

## 技术栈

- **Next.js 14** - React 框架
- **React 18** - UI 库
- **TypeScript** - 类型系统
- **Tailwind CSS** - 样式框架
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Jest** - 测试框架

## 开发环境配置

该项目已配置为与 GitHub Codespaces 兼容。Dev container 设置包括：

- Node.js 20
- Git 和 GitHub CLI
- 推荐的 VS Code 扩展
- 自动 npm 依赖安装

## 环境变量

复制 `.env.example` 为 `.env.local` 并填入你的环境变量。

```bash
cp .env.example .env.local
```

## 许可证

MIT