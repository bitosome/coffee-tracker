import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { readFileSync } from "node:fs";
const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url)),
);
export default {
  input: "src/coffee-tracker-card.ts",
  output: {
    file: "custom_components/coffee_tracker/www/coffee-tracker-card.js",
    format: "es",
    banner: `/* Coffee Tracker ${version} | MIT | Space Hub design tokens: see THIRD_PARTY_NOTICES.md */`,
  },
  plugins: [
    resolve(),
    typescript({ outDir: undefined }),
    terser({ format: { comments: /Coffee Tracker/ } }),
  ],
};
