import "aos/dist/aos.css";
import { useEffect } from "preact/hooks";
import personalizationImage from "@/assets/images/personalization.png";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";

const Personalization = ({
  translations,
}: {
  translations: Translations;
}) => {
  const t = createClientTranslator(translations);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
      <div className="flex flex-col justify-center gap-6">
        <p
          className="bg-gradient-to-r from-[#8e82ff] to-[#16e647] bg-clip-text text-lg font-semibold text-transparent"
          data-aos="zoom-in"
        >
          {t("personalization.tag")}
        </p>
        <h1
          className="ease-bounce text-2xl leading-snug font-semibold whitespace-pre-line transition-all duration-500 lg:gap-4 lg:text-3xl xl:gap-8 xl:text-4xl"
          data-aos="fade-up"
        >
          {t("personalization.title")}
        </h1>
        <p
          className="text-md leading-tight text-[#87878A] xl:text-lg"
          data-aos="fade-up"
        >
          {t("personalization.content")}
        </p>
      </div>
      <div className="rounded-lg border-2 border-[#303640]" data-aos="fade-left">
        <img
          src={personalizationImage.src}
          alt="theme&plugin"
          className="h-fit w-full"
        />
      </div>
    </div>
  );
};

export default Personalization;
