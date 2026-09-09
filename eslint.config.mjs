import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Introduce React Compiler diagnostics as warnings for this existing app.
  // Hook order and the other recommended correctness rules remain errors.
  { rules: {
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/immutability": "warn",
    "react-hooks/purity": "warn",
    "react-hooks/refs": "warn",
  } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
