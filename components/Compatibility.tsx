import linuxImage from "@/assets/images/screenshots/linux.png";
import macosImage from "@/assets/images/screenshots/macos.png";
import win7Image from "@/assets/images/screenshots/win7.png";
import win11Image from "@/assets/images/screenshots/win11.png";
import "aos/dist/aos.css";
import { useEffect, useState } from "preact/hooks";

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex: number) => (prevIndex + 1) % screenshots.length,
        );
        setIsTransitioning(false);
      }, 250);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [screenshots.length]);

  return (
    <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
      <div
        className="order-2 aspect-video min-h-[200px] w-full overflow-hidden rounded-lg border-2 border-[#303640] lg:order-1"
        data-aos="fade-right"
      >
        <img
          src={screenshots[currentImageIndex]}
          className={`ease-mobai-standard h-full w-full object-cover transition-opacity duration-500 ${
            isTransitioning ? "opacity-0" : "opacity-100"
          }`}
        />
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
