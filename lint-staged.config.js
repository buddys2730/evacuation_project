export default {
  "frontend/**/*.{js,jsx}": ["npx eslint --fix", "npx prettier --write"],
  "frontend/**/*.md": ["node scripts/validate-md.cjs"],
};
