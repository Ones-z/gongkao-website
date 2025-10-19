import userService from "@/api/userService";
import type { UserInfo } from "@/entity";
import { getUserInfoSync, useUserActions } from "@/store/userStore";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import React, { useEffect, useState } from "react";

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

  const getUserInfo = async (open_id?: string) => {
    if (open_id) {
      const info = await userService.getUuidInfo(
        undefined,
        open_id,
        "支付宝-WEB",
      );
      if (info.code == 0) {
        setUserInfo(info.data);
      }
    } else {
      const { uuid } = getQueryParams();
      const info = await userService.getUuidInfo(uuid, undefined, "支付宝-WEB");
      if (info.code == 0) {
        setUserInfo(info.data);
      }
    }
  };

  const handleAlipayCallback = async () => {
    const { app_id, auth_code, uuid, scope } = getQueryParams();
    console.log("app_id", app_id);
    // 调用后端API处理支付宝授权码
    // 注意：这里需要替换为你的实际API端点
    const res = await userService.loginByAlipay({
      app_id,
      auth_code,
      scope,
      uuid,
    });
    if (typeof res.data === "number") {
      await getUserInfo();
    } else {
      await getUserInfo(res.data.open_id);
    }
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
    <div className="mt-10 flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-white p-3">
              <svg
                className="h-16 w-16 text-green-500"
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
          <h1 className="mb-2 text-3xl font-bold text-white">登录成功！</h1>
        </div>
        <div className="p-8 text-center">
          <p className="mb-6 text-xl text-gray-700">
            您现在可以挑选自己心仪的岗位了
          </p>
          <div className="mb-6 flex justify-center space-x-4">
            <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-purple-500"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-green-500"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <p className="text-gray-500 italic">
            页面将在{" "}
            <span className="font-bold text-blue-600">{countdown}</span>{" "}
            秒后自动跳转到职位页面...
          </p>
          <button
            onClick={() => (window.location.href = "/exam-announcements")}
            className="mt-6 transform rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700"
          >
            立即进入职位页面
          </button>
        </div>
      </div>
    </div>
  );
}
