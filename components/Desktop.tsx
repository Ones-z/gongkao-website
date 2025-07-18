import desktopImage from "@/assets/images/desktop.png";
import "aos/dist/aos.css";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { useEffect } from "react";

const Desktop = ({ translations }: { translations: Translations }) => {
  const t = createClientTranslator(translations);

  return (
    <div className="flex w-full flex-col items-center rounded-2xl border-2 border-[#303640] px-4 sm:px-6 md:px-12">
      <div
        className="pb-16"
      >
        <img
          src={desktopImage.src}
          data-aos="zoom-in"
          className="w-full h-auto"
        />
        <p
          className="ease-bounce flex flex-row justify-center gap-2 text-xl font-semibold transition-all duration-500 md:text-2xl lg:gap-4 lg:text-3xl xl:gap-8 xl:text-4xl"
          data-aos="zoom-out"
        >
          <span dangerouslySetInnerHTML={{ __html: t('desktop.title') }} />
        </p>
      </div>
    </div>
  );
};

export default Desktop;
