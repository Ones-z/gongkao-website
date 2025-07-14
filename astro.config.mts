// @ts-check
import partytown from "@astrojs/partytown";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { astroI18nPlugin } from "@gudupao/astro-i18n";

// https://astro.build/config
export default defineConfig({
  srcDir: ".",
  integrations: [
    astroI18nPlugin({
      localesDir: "./locales",
      fallbackLang: "zh",
    }),
    preact(),
    partytown(),
  ],
  base: "/",
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
    // @ts-ignore
    plugins: [tailwindcss()],
  },
});
