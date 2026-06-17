import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Relax for existing codebase
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "functions/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
