// @ts-check
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": /** @type {any} */ (tsPlugin),
      "@next/next": /** @type {any} */ (nextPlugin),
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      ...tsPlugin.configs["recommended"].rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // allow 'any' in generated/external code
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    ignores: ["src/gen/**", ".next/**", "out/**"],
  },
];

export default eslintConfig;
