import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Temporary: warnings for unused vars to allow gradual fixes
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true
      }],
      // Temporary: warnings for explicit any to allow gradual fixes
      "@typescript-eslint/no-explicit-any": "warn",
      // Warnings for unescaped entities
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
