import bannerImage from "@/assets/images/backgrounds/banner/dark.svg";
import logoImage from "@/assets/images/icons/favicon.svg";
import Apple from "@/components/icon/Apple";
import Linux from "@/components/icon/Linux";
import Windows from "@/components/icon/Windows";
import { Button, TransparentButton } from "@/components/ui/Button";
import "aos/dist/aos.css";
import { useEffect, useState } from "preact/hooks";
import {detectPlatformFromUserAgent} from "plat.ts";

const Hero = () => {
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    // 定义哈希值到平台ID的映射
    const hashToPlatform: Record<string, string> = {
      '#win': 'windows',
      '#macos': 'macos',
      '#linux': 'linux'
    };

    // 处理哈希变化的函数
    const handleHashChange = () => {
      const hash = window.location.hash;
      const platformId = hashToPlatform[hash];
      if (platformId) {
        setPlatform(platformId);
      } else {
        // 没有URL标签时根据用户代理检测系统类型
        setPlatform(detectPlatformFromUserAgent());
      }
    };

    // 初始加载时检查哈希
    handleHashChange();

    // 添加哈希变化监听
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  return (
    <div className="h-screen w-full">
      <div
        className="relative h-full bg-cover bg-center bg-no-repeat text-white"
        style={{ backgroundImage: `url(${bannerImage.src})` }}        data-aos="zoom-out-down"     data-aos-duration="500"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="ease-mobai-bounce max-w-8xl relative z-10 mx-auto flex h-full flex-col items-start justify-center gap-4 px-8 transition-all duration-500 md:gap-8 md:px-12 lg:px-16 xl:px-24">
          <img
            src={logoImage.src}
            alt="logo"
            className="ease-mobai-bounce size-24 transition-all duration-500 lg:size-32 xl:size-48"
            data-aos="zoom-in"
            data-aos-duration="1500"
          />
          <div className="ease-mobai-bounce flex flex-col gap-4 transition-all duration-500 md:gap-8">
            <div className="ease-mobai-bounce gap-4 text-3xl leading-snug font-semibold whitespace-pre-line transition-all duration-500 lg:text-4xl xl:text-5xl">
              <h1 data-aos="zoom-in-right">{`多样的桌面课表\n由我们定义的全新桌面形态`}</h1>
            </div>
            <div
              className="ease-mobai-bounce flex flex-col gap-4 transition-all duration-500 md:flex-row md:gap-8"
              data-aos="zoom-in-right"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <Button
                  href="/download#win"
                  className="flex w-fit flex-row items-center gap-2"
                  data-aos="fade-left"
                >
                  {!platform ? (
                    <div className="size-6 animate-pulse rounded-full bg-gray-300" />
                  ) : (
                    <>
                      {platform === 'windows' && <Windows className="size-6" />}
                      {platform === 'macos' && <Apple className="size-6" />}
                      {platform === 'linux' && <Linux className="size-6" />}
                    </>
                  )}
                  <span className="text-lg lg:text-xl">下载 Class Widgets</span>
                </Button>
              </div>
              <div className="flex flex-row gap-4">
                <TransparentButton
                  href="https://cwdocs.rinlit.cn/user_docs"
                  className="flex w-fit flex-row items-center gap-2"
                  data-aos="fade-up"
                >
                  <span className="text-lg lg:text-xl">文档</span>
                </TransparentButton>
                <TransparentButton
                  href="https://cwdocs.rinlit.cn/standards/"
                  className="flex w-fit flex-row items-center gap-2"
                  data-aos="fade-up"
                >
                  <span className="text-lg lg:text-xl">社区</span>
                </TransparentButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
