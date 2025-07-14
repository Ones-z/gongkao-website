import logoImage from "@/assets/images/icons/favicon.svg";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";

interface VersionProps {
  latestVer: string | null;
  publishedDate: string | null;
  loading: boolean;
  size?: "auto"; // 新增 size 属性
  translations: Translations;
}

const Version = ({ latestVer, publishedDate, loading, size, translations }: VersionProps) => {
  const t = createClientTranslator(translations);
  const containerClasses = size === "auto"
    ? "w-full h-full flex flex-col items-center justify-center p-4 bg-white/5 rounded-lg shadow-md border border-white/10"
    : "p-4 bg-white/5 rounded-lg shadow-md inline-flex items-center gap-4 border border-white/10";

  return (
    <a href="https://classwidgets.rinlit.cn/download/" target="_blank" rel="noopener noreferrer" className={containerClasses}>
      {loading ? (
        <span className="text-sm text-gray-400">{t("version.loading")}</span>
      ) : (
        <>
          <img
            src={logoImage.src}
            alt="Class Widgets Logo"
            className="size-12"
          />
          <div className={size === "auto" ? "text-center" : ""}>
            <span className="text-lg font-semibold text-white block">{t("version.latest")}: {latestVer}</span>
            {publishedDate && <span className="text-sm text-gray-400 block">{t("version.published")}: {publishedDate}</span>}
          </div>
        </>
      )}
    </a>
  );
};

export default Version;