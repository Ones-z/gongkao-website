import userService from "@/api/userService";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { Button, Result } from "antd";
import React, { useEffect, useState } from "react";

export default function AlipayLoginCallbackPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      app_id: params.get("app_id"),
      auth_code: params.get("auth_code"),
      uuid: params.get("uuid"),
      scope: params.get("scope"),
    };
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
  };

  useEffect(() => {
    // 处理支付宝回调
    handleAlipayCallback();
  }, []);

  return (
    <Result
      status="success"
      title="登录成功！"
      subTitle="您现在可以挑选自己心仪的岗位了。"
      extra={[<Button key="buy" onClick={() => window.close()}>返回支付宝</Button>]}
    />
  );
}
