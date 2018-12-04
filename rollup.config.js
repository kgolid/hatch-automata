import pkg from "./package.json";
import resolve from "rollup-plugin-node-resolve";

export default [
  {
    input: "main.js",
    output: {
      file: pkg.main,
      format: "umd"
    },
    plugins: [resolve()]
  },
  {
    input: "main-hex.js",
    output: {
      file: pkg.hexagonal,
      format: "umd"
    },
    plugins: [resolve()]
  }
];
