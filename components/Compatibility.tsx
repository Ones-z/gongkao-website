import Linux from "@/assets/screenshots/linux.png";
import MacOS from "@/assets/screenshots/macos.png";
import Win7 from "@/assets/screenshots/win7.png";
import Win from "@/assets/screenshots/win.png";
import { useEffect, useState } from "react";

const Personalization = () => {
  const screenshots = [Win, Linux, Win7, MacOS].map((it) => it.src);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % screenshots.length,
        );
        setIsTransitioning(false);
      }, 250);
    }, 3000);

    return () => clearInterval(interval);
  }, [screenshots.length]);

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="order-2 aspect-video overflow-hidden rounded-lg border-2 border-[#303640] lg:order-1">
        <img
          src={screenshots[currentImageIndex]}
          className={`ease-mobai-standard h-full w-full object-contain transition-opacity duration-500 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
      <div className="order-1 flex flex-col justify-center gap-6 lg:order-2">
        <p className="bg-gradient-to-r from-[#ffc182] to-[#5d64e4] bg-clip-text text-lg font-semibold text-transparent">
          # 多端支持
        </p>
        <h1 className="ease-mobai-bounce text-2xl leading-snug font-semibold whitespace-pre-line transition-all duration-500 lg:gap-4 lg:text-3xl xl:gap-8 xl:text-4xl">
          {`近乎完美的\n兼容性`}
        </h1>
        <p className="text-md leading-tight text-[#87878A] xl:text-lg">
          {`Class Widgets 基于 PyQt 构建，为 Windows、Linux、MacOS 三大主流操作系统提供支持`}
        </p>
      </div>
    </div>
  );
};

export default Personalization;
