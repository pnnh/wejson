# WeJSON

一个在线 JSON / JSON5 处理工具，支持格式化、校验、转换与多语言界面。

## 功能

### 编辑与预览
- JSON / JSON5 双模式输入（单选框切换）
- 基于 Monaco Editor 的双栏编辑器（输入 + 只读预览）
- 格式化、压缩（Minify）
- Key 升序 / 降序排序
- 语法错误高亮标注（错误行内联标记）
- 拖拽上传 JSON 文件

### 复制与导出
- 复制格式化 JSON
- 复制压缩 JSON
- 下载 `.json` 文件
- 导出 YAML（`.yaml`）
- 导出 XML（自定义根标签名，`.xml`）

### 历史记录
- 每次格式化自动保存到 localStorage（最多 10 条）
- 点击历史条目加载到编辑器
- 支持逐条删除或一键清空

### JSONPath 查询
- 支持完整 JSONPath 语法（jsonpath-plus）
- 结果实时展示

### JSON Schema 校验
- 支持 Draft-07 Schema 手动输入校验
- 一键从当前 JSON 自动推断并生成 Schema
- 显示每条校验错误的路径和原因

### 多语言
- 支持 8 种语言：简体中文、繁體中文、English、Español、Français、Deutsch、Português、日本語
- 根据浏览器 `Accept-Language` 自动选择，URL 路径 `/{lang}/` 切换

## 技术栈

- **框架**：Next.js 16 + React 19（App Router）
- **部署**：Cloudflare Workers（via `@opennextjs/cloudflare`）
- **编辑器**：Monaco Editor（`@monaco-editor/react`）
- **样式**：PandaCSS + Tailwind v4
- **JSON5**：json5
- **YAML**：js-yaml
- **Schema 校验**：ajv（Draft-07）
- **JSONPath**：jsonpath-plus
- **代码检查**：ESLint 10 + @typescript-eslint + @next/eslint-plugin-next

## 开发

```bash
pnpm install
pnpm next        # 开发服务器 http://localhost:7112
pnpm build       # 生产构建
pnpm lint        # 代码检查
```

## 部署（Cloudflare Workers）

```bash
pnpm adapter     # 构建 Cloudflare 产物
pnpm preview     # 本地预览
```
