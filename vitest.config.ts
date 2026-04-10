import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    // 使用 jsdom 模拟浏览器环境，用于组件测试
    environment: "jsdom",
    // 自动引入 @testing-library/jest-dom matcher
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    // 只扫描 src/ 下的单元测试，排除 e2e 目录
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", "src/gen/**"],
    // 指向 test 专用 tsconfig
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
    resolve: {
        tsconfigPaths: true
    }
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/components/**"],
      exclude: ["src/gen/**", "src/components/server/**", "**/*.test.*"],
    },
  },
});
