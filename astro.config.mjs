// @ts-check
import partytown from "@astrojs/partytown";
import preact from "@astrojs/preact";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import starlightNextjsTheme from 'starlight-nextjs-theme';

// https://astro.build/config
export default defineConfig({
  srcDir: ".",
  integrations: [
    preact(),
    partytown(),
    starlight({social: [
    { icon: 'download', label: '下载', href: '/download' },
    { icon: 'comment', label: 'QQ', href: 'https://qun.qq.com/universal-share/share?ac=1&authKey=L5dC%2B02XrjoB5ArYYGFBip7aGqTdreXdEoAb1X5%2BtQJUzwCjYd97t98xGBdsYohR&busi_data=eyJncm91cENvZGUiOiI2OTg1OTk4OTgiLCJ0b2tlbiI6InFaeGdlbnpoOHM1WHllMEp0SUNsUnZxTmdsM280K3FJRmdHbm1UNEFEUGplQk9YdUs2bXFEeWRSaGUvQUJLK2ciLCJ1aW4iOiIxOTg1NDA5NzExIn0=&data=1EBWxjW-zxlIdsZbE--bdpkjBQBz8UG_SHTt8j325Z3iawQVQKMthE6TXv-xA_VVGpTIZDMPqzpIQRfsUP4cVg&svctype=4&tempid=h5_group_info' },
    { icon: 'discord', label: 'Discord', href: 'https://discord.com/invite/xhZqhGuBxu' },
    { icon: 'github', label: 'GitHub', href: 'https://github.com/Class-Widgets' },
  ],
      plugins: [starlightNextjsTheme()],
      favicon: "/favicon.ico",
      title: "Class Widgets",disable404Route: true,
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
        {
          label: "社区规范",
          autogenerate: { directory: "standards" },
        },
      ],
      components: {
        Head: "./components/starlight/Head.astro",
      },
      customCss: [
        // 你的自定义 CSS 文件的相对路径
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
