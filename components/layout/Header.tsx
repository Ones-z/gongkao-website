import React from 'react';

const Header = () => {
  const navItems = [
    { href: "/", label: "主页" },
    { href: "/download", label: "下载" },
    { href: "/user_docs", label: "用户文档" },
    { href: "/dev_docs", label: "开发者文档" },
  ];
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-opacity-10 backdrop-blur-md shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/"><div className="flex items-center space-x-2">
          <img src="/favicon.png" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-100">Class Widgets</span>
        </div></a>
        <div className="space-x-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-200 hover:text-blue-500 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;