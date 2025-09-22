import { useState, useEffect } from 'react';
import logoImage from "@/assets/images/icons/favicon.svg";
// import LanguageSwitcher from "@/components/LanguageSwitcher.tsx";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { getUserInfoSync } from "@/store/userStore";
import { Avatar, Dropdown } from "antd";
import type { MenuProps } from 'antd';
import { UserOutlined } from "@ant-design/icons";

const Header = ({ translations }: { translations: Translations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [overHero, setOverHero] = useState(true);
  const userInfo = getUserInfoSync();
  const t = createClientTranslator(translations);
  const isLoggedIn = !!userInfo.open_id;

  const normalizePath = (path: string) => {
    // 移除语言前缀，例如 /en/about -> /about
    const withoutLang = path.replace(/^\/[a-z]{2}\//, '/');
    // 移除尾部的斜杠，但保留根路径的斜杠
    if (withoutLang.length > 1 && withoutLang.endsWith('/')) {
      return withoutLang.slice(0, -1);
    }
    return withoutLang;
  };
  const getLocalizedPath = (path: string) => {
    // if (translations && translations.lang) {
    //   return `/${translations.lang}${path}`;
    // }
    return path;
  };
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: <a href={getLocalizedPath("/profile")}>个人资料</a>
    },
    {
      key: 'collect',
      label: <a href={getLocalizedPath("/collect")}>感兴趣</a>
    },
    {
      key: 'compare',
      label: <a href={getLocalizedPath("/compare")}>职位对比</a>
    },
    // {
    //   type: 'divider',
    // },
    // {
    //   key: 'logout',
    //   label: <a href={getLocalizedPath("/logout")}>退出登录</a>
    // }
  ];
  const navItems = [
    { href: getLocalizedPath("/"), label: t("navs.home") },
    { href: getLocalizedPath("/job"), label: t("navs.job") },
    { href: getLocalizedPath("/goods"), label: t("navs.goods") },
    // { href: getLocalizedPath("/login"), label: t("navs.login") },
    // { href: getLocalizedPath("/download"), label: t("navs.download") },
    // { href: "https://cwdocs.rinlit.cn/about/", label: t("navs.user_docs") },
    // { href: "https://cwdocs.rinlit.cn/dev/", label: t("navs.dev_docs") },
  ];

  useEffect(() => {
    setCurrentPath(normalizePath(new URL(window.location.href).pathname));

    const handlePopstate = () => {
      setCurrentPath(normalizePath(new URL(window.location.href).pathname));
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setOverHero(window.scrollY === 0);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 ${overHero ? '' : 'shadow-sm bg-gray-900/80 backdrop-blur-md'}`}>
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href={getLocalizedPath("/")}>
          <div className="flex items-center space-x-2">
            <img src={logoImage.src} alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-100">青云选岗</span>
          </div>
        </a>
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-gray-200 hover:text-blue-500 transition-colors relative ${
                  currentPath === normalizePath(item.href)
                    ? "after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-[#7dd3fc] after:transition-all"
                    : ""
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Avatar
                    src={userInfo.avatar}
                    icon={<UserOutlined />}
                    size="small"
                    className="bg-blue-500"
                  />
                  <span className="text-gray-500 text-sm ml-2">
                    {userInfo.nick_name}
                  </span>
                </div>
              </Dropdown>
            </div>
          ) : (
            <a
              href={getLocalizedPath("/login")}
              className="text-gray-200 hover:text-blue-500 transition-colors"
            >
              登录
            </a>
          )}
          {/*<LanguageSwitcher />*/}
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-200 focus:outline-none">
            <svg
              className="w-6 h-6 transition-all duration-300 ease-in-out"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>
      </nav>
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'bg-opacity-10 backdrop-blur-sm' : 'pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={`absolute top-16 right-4 w-64 rounded-lg shadow-xl transition-all duration-300 ease-in-out ${
            isOpen 
              ? 'opacity-100 translate-y-0 bg-gray-800' 
              : 'opacity-0 -translate-y-2 pointer-events-none bg-gray-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col py-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 text-gray-200 hover:text-blue-500 hover:bg-gray-700 transition-colors ${
                  currentPath === normalizePath(item.href)
                    ? "font-medium text-blue-400 bg-gray-750"
                    : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {isLoggedIn && (
              <>
                <div className="border-t border-gray-700 my-1"></div>
                <a
                  href={getLocalizedPath("/profile")}
                  className={`block px-4 py-3 text-gray-200 hover:text-blue-500 hover:bg-gray-700 transition-colors ${
                    currentPath === normalizePath(getLocalizedPath("/profile"))
                      ? "font-medium text-blue-400 bg-gray-750"
                      : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  个人资料
                </a>
                <a
                  href={getLocalizedPath("/collect")}
                  className={`block px-4 py-3 text-gray-200 hover:text-blue-500 hover:bg-gray-700 transition-colors ${
                    currentPath === normalizePath(getLocalizedPath("/collect"))
                      ? "font-medium text-blue-400 bg-gray-750"
                      : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  感兴趣
                </a>
                <a
                  href={getLocalizedPath("/compare")}
                  className={`block px-4 py-3 text-gray-200 hover:text-blue-500 hover:bg-gray-700 transition-colors ${
                    currentPath === normalizePath(getLocalizedPath("/compare"))
                      ? "font-medium text-blue-400 bg-gray-750"
                      : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  职位对比
                </a>
              </>
            )}
            {!isLoggedIn && (
              <div className="border-t border-gray-700 my-1"></div>
            )}
            {!isLoggedIn && (
              <a
                href={getLocalizedPath("/login")}
                className={`block px-4 py-3 text-gray-200 hover:text-blue-500 hover:bg-gray-700 transition-colors ${
                  currentPath === normalizePath(getLocalizedPath("/login"))
                    ? "font-medium text-blue-400 bg-gray-750"
                    : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                登录
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
