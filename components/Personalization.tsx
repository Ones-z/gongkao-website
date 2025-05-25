import Theme_Plugin_1 from "@/assets/theme&plugin_1.png";

const Personalization = () => {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
      <div className="flex flex-col justify-center gap-6">
        <p className="bg-gradient-to-r from-[#8e82ff] to-[#16e647] bg-clip-text text-lg font-semibold text-transparent">
          # 个性化
        </p>
        <h1 className="ease-mobai-bounce text-2xl leading-snug font-semibold whitespace-pre-line transition-all duration-500 lg:gap-4 lg:text-3xl xl:gap-8 xl:text-4xl">
          {`插件 & 主题\n极致的自定义`}
        </h1>
        <p className="text-md leading-tight text-[#87878A] xl:text-lg">
          在 Class Widgets 中，提供了基于 Python
          的插件系统和插件广场；你可以在插件广场中安装您需要的插件。以及彰显个性的主题系统，让你搭建出独一无二的
          Class Widgets。
        </p>
      </div>
      <div className="rounded-lg border-2 border-[#303640]">
        <img
          src={Theme_Plugin_1.src}
          alt="theme&plugin"
          className="h-fit w-full"
        />
      </div>
    </div>
  );
};

export default Personalization;
