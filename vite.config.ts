import copy from "rollup-plugin-copy";
import path from 'path';
import sass from "rollup-plugin-scss";
import { defineConfig } from "vite";

export default defineConfig({
 build: {
   sourcemap: true,
   rollupOptions: {
     input: "src/ts/module.ts",
     output: {
        dir: path.resolve('./dist'),
        entryFileNames: 'scripts/module.js',
        format: "es",
     },
   },
 },
 plugins: [
  sass({
    fileName: "styles/style.css",
    watch: ["src/styles/*.scss"],
  }),
   copy({
     targets: [{ src: "src/module.json", dest: "dist" }],
     hook: "writeBundle",
   }),
 ],
});