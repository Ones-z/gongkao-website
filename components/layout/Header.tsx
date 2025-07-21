import { useState, useEffect } from 'react';
import logoImage from "@/assets/images/icons/favicon.svg";
import LanguageSwitcher from "@/components/LanguageSwitcher.tsx";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";


const Header = ({ translations }: { translations: Translations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [overHero, setOverHero] = useState(true);
  const t = createClientTranslator(translations);

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
    if (translations && translations.lang) {
      return `/${translations.lang}${path}`;
    }
    return path;
  };
  const navItems = [
    { href: getLocalizedPath("/"), label: t("navs.home") },
    { href: getLocalizedPath("/download"), label: t("navs.download") },
    { href: "https://cwdocs.rinlit.cn/about/", label: t("navs.user_docs") },
    { href: "https://cwdocs.rinlit.cn/dev/", label: t("navs.dev_docs") },
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
            <span className="text-xl font-bold text-gray-100">Class Widgets</span>
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
          <LanguageSwitcher />
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
        className={`md:hidden shadow-sm overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? `max-h-[calc(100vh-64px)] opacity-100 bg-opacity-10 backdrop-blur-md` : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 flex flex-col space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block text-gray-200 hover:text-blue-500 transition-colors py-2 relative ${
                currentPath === normalizePath(item.href)
                  ? "after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-[#7dd3fc] after:transition-all"
                  : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="py-2 border-t border-gray-600 mt-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;