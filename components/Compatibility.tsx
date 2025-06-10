import linuxImage from "@/assets/images/screenshots/linux.png";
import macosImage from "@/assets/images/screenshots/macos.png";
import win7Image from "@/assets/images/screenshots/win7.png";
import win11Image from "@/assets/images/screenshots/win11.png";
import "aos/dist/aos.css";
import { useEffect, useState, useRef } from "preact/hooks";

const Personalization = () => {
  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.init({
        duration: 1000,
        once: true,
      });
    });
  }, []);

  const screenshots = [win11Image, linuxImage, win7Image, macosImage].map(
    (it) => it.src,
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  // 启动自动轮播
  const startAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = window.setInterval(() => {
      goToNext();
    }, 3000);
  };

  // 停止自动轮播
  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 切换到下一张
  const goToNext = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % screenshots.length
    );
  };

  // 切换到上一张
  const goToPrev = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + screenshots.length) % screenshots.length
    );
  };

  // 处理手动切换
  const handleManualChange = (direction: "prev" | "next") => {
    stopAutoPlay();
    if (direction === "prev") {
      goToPrev();
    } else {
      goToNext();
    }
    // 手动切换后立即重启轮播（如果不在悬停状态）
    if (!isHoveringRef.current) {
      startAutoPlay();
    }
  };


  useEffect(() => {
    startAutoPlay(); // 初始启动自动轮播
    return () => {
      stopAutoPlay(); // 组件卸载时清理
    };
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
      <div
        className="order-2 aspect-video min-h-[200px] w-full overflow-hidden rounded-lg border-2 border-[#303640] lg:order-1 relative"
        data-aos="fade-right"
        onMouseEnter={() => {
          stopAutoPlay();
          isHoveringRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveringRef.current = false;
          startAutoPlay();
        }}
      >
        {/* 滑动容器 */}
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {screenshots.map((src, index) => (
            <div key={index} className="min-w-full flex-shrink-0">
              <img
                src={src}
                className="ease-mobai-standard h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* 左右滑动按钮 */}
        <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 rounded-full p-2 text-white z-10"
          onClick={() => handleManualChange("prev")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 rounded-full p-2 text-white z-10"
          onClick={() => handleManualChange("next")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div
        className="order-1 flex flex-col justify-center gap-6 lg:order-2"
        data-aos="fade-left"
      >
        <p
          className="bg-gradient-to-r from-[#ffc182] to-[#5d64e4] bg-clip-text text-lg font-semibold text-transparent"
          data-aos="zoom-in"
        >
          # 多端支持
        </p>
        <h1
          className="ease-mobai-bounce text-2xl leading-snug font-semibold whitespace-pre-line transition-all duration-500 lg:gap-4 lg:text-3xl xl:gap-8 xl:text-4xl"
          data-aos="fade-up"
        >
          {`近乎完美的\n兼容性`}
        </h1>
        <p
          className="text-md leading-tight text-[#87878A] xl:text-lg"
          data-aos="fade-up"
        >
          {`Class Widgets 基于 PyQt 构建，为 Windows、Linux、MacOS 三大主流操作系统提供支持`}
        </p>
      </div>
    </div>
  );
};

export default Personalization;
