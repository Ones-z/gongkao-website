import { Block } from "@/components/ui/Block";
import "aos/dist/aos.css";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";

const Test = ({ translations }: { translations: Translations }) => {
  const t = createClientTranslator(translations);
  return (
    <div className="max-w-8xl mx-auto">
      <div className="grid gap-24 md:grid-cols-3">
        <div data-aos="fade-up" data-aos-delay="100">
          <Block
            tag={t("misc.notification.tag")}
            colorFrom="#ff6b9d"
            colorTo="#c44569"
            title={t("misc.notification.title")}
            content={t("misc.notification.content")}
          />
        </div>
        <div data-aos="fade-up" data-aos-delay="300">
          <Block
            tag={t("misc.floating.tag")}
            colorFrom="#4ecdc4"
            colorTo="#44a08d"
            title={t("misc.floating.title")}
            content={t("misc.floating.content")}
          />
        </div>
        <div data-aos="fade-up" data-aos-delay="500">
          <Block
            tag={t("misc.design.tag")}
            colorFrom="#a8edea"
            colorTo="#fed6e3"
            title={t("misc.design.title")}
            content={t("misc.design.content")}
          />
        </div>
      </div>
    </div>
  );
};

export default Test;
