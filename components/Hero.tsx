import bannerImage from "@/assets/images/backgrounds/banner/dark.svg";
import logoImage from "@/assets/images/icons/favicon.svg";
import Apple from "@/components/icon/Apple";
import Linux from "@/components/icon/Linux";
import Windows from "@/components/icon/Windows";
import { Button, TransparentButton } from "@/components/ui/Button";
import "aos/dist/aos.css";
import { useEffect, useState, useRef } from "react";
import {detectPlatformFromUserAgent} from "plat.ts";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";

const Hero = ({ translations }: { translations: Translations }) => {
  const [platform, setPlatform] = useState('');
  const [logoScale, setLogoScale] = useState(1);
  const [clickCount, setClickCount] = useState(0); // 添加点击计数器
  const logoRef = useRef<HTMLImageElement>(null);
  const logoAnimationRef = useRef<HTMLDivElement>(null);
  const t = createClientTranslator(translations);
  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (logoRef.current) {
      // 每次点击都触发旋转动画
      logoRef.current.classList.add('shake-animation');
      setTimeout(() => {
        if (logoRef.current) {
          logoRef.current.classList.remove('shake-animation');
        }
      }, 500);
      
      // 每10次点击触发爆炸效果
      if (newCount >= 10) {
        logoRef.current.classList.add('explode-animation');
        setTimeout(() => {
          if (logoRef.current) {
            logoRef.current.classList.remove('explode-animation');
            // 重置样式
            logoRef.current.style.opacity = '1';
            logoRef.current.style.transform = '';
            logoRef.current.style.filter = '';
          }
          setClickCount(0); // 重置计数器
        }, 1000);
      }
    }
  };

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
    <div className="h-screen w-full relative overflow-hidden">
      {/* 径向渐变背景（位于背景图后面） */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse at left bottom, #34507B 0%, #2C3643 50%, #4E5F6A 100%)`
      }} />
      
      {/* 背景图（绝对定位，应用自定义动画） */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat banner-slide-in"
        style={{ backgroundImage: `url(${bannerImage.src})` }}
      />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      {/* 内容容器（相对定位，不受背景动画影响） */}
      <div className="relative h-full text-white">
        <div className="ease-bounce max-w-8xl relative z-10 mx-auto flex h-full flex-col items-start justify-center gap-4 px-8 transition-all duration-500 md:gap-8 md:px-12 lg:px-16 xl:px-24">
          <div
            data-aos="zoom-in"
            data-aos-duration="500"
            data-aos-once="true"
            ref={logoAnimationRef}
          >
            <img
              ref={logoRef}
              src={logoImage.src}
              alt="logo"
              className="ease-bounce size-24 transition-all duration-500 lg:size-32 xl:size-48"
              onMouseEnter={() => setLogoScale(1.1)}
              onMouseLeave={() => setLogoScale(1)}
              style={{ transform: `scale(${logoScale})` }}
              onClick={handleLogoClick}
            />
          </div>
          <div className="ease-bounce flex flex-col gap-4 transition-all duration-500 md:gap-8">
            <div className="ease-bounce gap-4 text-3xl leading-snug font-semibold whitespace-pre-line transition-all duration-500 lg:text-4xl xl:text-5xl">
              <h1 data-aos="zoom-in-right">{t("hero.title")}</h1>
            </div>
            <div
              className="ease-bounce flex flex-col gap-4 transition-all duration-500 md:flex-row md:gap-8"
              data-aos="zoom-in-right"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <Button
                  href={`${
                    translations.lang === "en" ? "" : "/" + translations.lang
                  }/download#${platform === "windows" ? "win" : platform}`}
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
                  <span className="text-lg lg:text-xl">{t("hero.download")}</span>
                </Button>
              </div>
              <div className="flex flex-row gap-4">
                <TransparentButton
                  href="https://cwdocs.rinlit.cn/about"
                  className="flex w-fit flex-row items-center gap-2"
                  data-aos="fade-up"
                >
                  <span className="text-lg lg:text-xl">{t("hero.docs")}</span>
                </TransparentButton>
                <TransparentButton
                  href="https://cwdocs.rinlit.cn/community/"
                  className="flex w-fit flex-row items-center gap-2"
                  data-aos="fade-up"
                >
                  <span className="text-lg lg:text-xl">{t("hero.community")}</span>
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
