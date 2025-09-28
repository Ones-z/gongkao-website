import React from 'react';
import FadeInDiv from "@/components/FadeInDiv.tsx";

const NotFound = () => {
  return (
    <FadeInDiv>
      <div
        className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="w-full max-w-md text-center"><div data-aos="fade-in">
          <h1
            style={{ fontSize: '100px', fontWeight: 'bold' }}
            className="font-extrabold tracking-wider text-white"
          >
            404
          </h1>
          <p className="mb-4 text-2xl font-semibold text-gray-300">页面未找到</p>
          <p className="mb-8 text-lg text-gray-400">
            抱歉，您访问的页面不存在，或者已被移动。
          </p></div>
          <div className="flex justify-center space-x-4">
            <a
              href="/exam-announcements"
              className="inline-flex items-center rounded-md border border-transparent bg-white px-6 py-3 text-base font-medium text-black shadow-sm transition-colors duration-300 hover:bg-gray-100"
            >
              返回职位
            </a>
            <p>&nbsp;&nbsp;&nbsp;</p>
            <a
              onClick={() => window.history.back()}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors duration-300 hover:bg-blue-700"
            >
              返回上一页
            </a>
          </div>
        </div>
      </div>
    </FadeInDiv>
  );
};

export default NotFound;