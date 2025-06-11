// @ts-check
import partytown from "@astrojs/partytown";
import preact from "@astrojs/preact";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  srcDir: ".",
  integrations: [
    preact(),
    partytown(),
    starlight({
      favicon: "/favicon.ico",
      title: "Class Widgets",
      logo: { src: "./assets/images/favicon.png", alt: "Class Widgets Logo" },
      sidebar: [
        {
          label: "用户文档",
          autogenerate: { directory: "user_docs" },
        },
        {
          label: "开发者文档",
          autogenerate: { directory: "dev_docs" },
        },
      ],
      components: {
        Head: "./components/starlight/Head.astro",
        Header: "./components/starlight/Header.astro",
      },
      customCss: [
        // 你的自定义 CSS 文件的相对路径
        "./styles/global.css",
      ],
    }),
  ],
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
