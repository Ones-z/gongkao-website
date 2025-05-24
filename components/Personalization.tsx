const Personalization = () => {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-8">
        <h1 className="flex flex-col gap-4 text-3xl font-semibold lg:text-4xl xl:gap-8 xl:text-5xl 2xl:flex-row">
          <span className="bg-gradient-to-r from-[#8e82ff] to-[#16e647] bg-clip-text text-transparent">
            插件 & 主题
          </span>
          <span>极致自定义</span>
        </h1>
        <p className="text-xl leading-tight xl:text-2xl">
          在 Class Widgets 中，提供了基于 Python
          的插件系统和插件广场；你可以在插件广场中安装您需要的插件。以及彰显个性的主题系统，让你搭建出独一无二的
          Class Widgets。
        </p>
      </div>
      <img
        src="/assets/theme&plugin_1.png"
        alt="theme&plugin"
        className="h-fit w-full"
      />
    </div>
  );
};

export default Personalization;
