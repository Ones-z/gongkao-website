import userService from "@/api/userService";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import React, {useState, useEffect } from "react";
import {
  getUserInfoSync,
  useUserActions,
} from "@/store/userStore";

export default function AlipayLoginCallbackPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [countdown, setCountdown] = useState(5);
  const { setUserInfo } = useUserActions();
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      app_id: params.get("app_id"),
      auth_code: params.get("auth_code"),
      uuid: params.get("uuid"),
      scope: params.get("scope"),
    };
  };

  const getUserInfo = async () => {
    const { uuid } = getQueryParams();
    const info = await userService.getUuidInfo(uuid,"支付宝-WEB" );
    if (info.code == 0) {
      setUserInfo(info.data);
    }
  };

  const handleAlipayCallback = async () => {
    const { app_id, auth_code, uuid, scope } = getQueryParams();
    console.log("app_id", app_id);
    // 调用后端API处理支付宝授权码
    // 注意：这里需要替换为你的实际API端点
    await userService.loginByAlipay({
      app_id,
      auth_code,
      scope,
      uuid,
    });
    await getUserInfo();

  };

  useEffect(() => {
    // 处理支付宝回调
    handleAlipayCallback();
  }, []);
  useEffect(() => {
    // 倒计时逻辑
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // 倒计时结束，跳转到职位页面
      window.location.href = "/exam-announcements";
    }
  }, [countdown]);

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">登录成功！</h1>
        </div>
        <div className="p-8 text-center">
          <p className="text-xl text-gray-700 mb-6">
            您现在可以挑选自己心仪的岗位了
          </p>
          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-gray-500 italic">
            页面将在 <span className="font-bold text-blue-600">{countdown}</span> 秒后自动跳转到职位页面...
          </p>
          <button
            onClick={() => window.location.href = "/exam-announcements"}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            立即进入职位页面
          </button>
        </div>
      </div>
    </div>
  );
}
