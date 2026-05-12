module.exports = {
  root: true,
  extends: ["expo", "prettier"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": ["warn", { allow: ["warn", "error"] }],
    // `@typescript-eslint/ban-types` is gone in v8; legacy configs reference
    // it. Quiet the lookup until expo's preset catches up.
    "@typescript-eslint/ban-types": "off",
  },
  ignorePatterns: [
    "node_modules",
    ".expo",
    "dist",
    "supabase/migrations",
    "supabase/functions",
    "docs",
  ],
};
