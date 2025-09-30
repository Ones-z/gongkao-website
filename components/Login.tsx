// Login.tsx
import userService from "@/api/userService";
import { getUserInfoSync, useUserActions } from "@/store/userStore";
import { AlipayOutlined } from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { Button, Card, QRCode, Result, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";





const { Title, Text } = Typography;

export default function LoginPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loginStatus, setLoginStatus] = useState<
    "pending" | "scanned" | "success" | "expired"
  >("pending");
  const { updateUserInfo } = useUserActions();

  const checkLoginStatus = async () => {
    const { uuid, source } = getUserInfoSync();
    const res = await userService.getUuidInfo(uuid, source);
    if (res.code === 0) {
      setLoginStatus("success");
    }
  };

  // 模拟获取二维码
  useEffect(() => {
    // 这里应该调用后端API获取支付宝登录二维码
    const fetchQRCode = async () => {
      const { uuid } = getUserInfoSync();
      try {
        setLoading(true);
        // 模拟API调用
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // 实际项目中这里应该是真实的支付宝登录二维码URL
        setQrCodeValue(
          `https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2021005190675084&scope=auth_user&redirect_uri=https://gongkao.me/alipay-login-callback&uuid=${uuid}`,
        );
        setLoading(false);
      } catch (error) {
        message.error("获取二维码失败，请刷新重试");
        setLoading(false);
      }
    };
    fetchQRCode();
  }, []);

  // 模拟检查登录状态
  useEffect(() => {
    if (!qrCodeValue) return;
    checkLoginStatus();
    const interval = setInterval(async () => {
      // 模拟登录状态检查
      // 实际项目中应该调用后端API检查登录状态
      // const random = Math.random();
      // if (random < 0.05) {
      //   setLoginStatus("scanned");
      // } else if (random < 0.1) {
      //   setLoginStatus("success");
      //   message.success("登录成功");
      //   // 实际项目中这里应该跳转到首页或其他页面
      // } else if (random < 0.15) {
      //   setLoginStatus("expired");
      // }
      const { uuid, source } = getUserInfoSync();
      const res = await userService.getUuidInfo(uuid, source);

      if (res.code === 0) {
        setLoginStatus("success");
        updateUserInfo({
          id: res.data.id,
          source: source,
          avatar: res.data.avatar,
          nick_name: res.data.nick_name,
          gender: res.data.gender,
          open_id: res.data.open_id,
          status: res.data.status,
        });
        clearInterval(interval);
        // 可以在这里添加登录成功后的回调或跳转逻辑
        setTimeout(() => {
          window.location.href = "/exam-announcements";
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrCodeValue,updateUserInfo]);

  const handleRefresh = () => {
    setLoginStatus("pending");
    // 重新获取二维码
    setQrCodeValue("");
    setLoading(true);

    setTimeout(() => {
      setQrCodeValue("https://auth.alipay.com/login/index.htm");
      setLoading(false);
    }, 500);
  };

  return (
    <div className="mt-10 flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
      {loginStatus === "success" ? (
        <Result
          status="success"
          title="您已成功登录！"
          subTitle="完成个人资料填写后推荐的岗位更精准"
          extra={[
            <Button type="primary" key="console">
              完成资料
            </Button>,
            <Button key="buy">挑选职位</Button>,
          ]}
        />
      ) : (
        <Card
          className="w-full max-w-md overflow-hidden rounded-2xl shadow-xl"
          style={{
            border: "none",
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <div className="py-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-blue-500 p-4">
                <AlipayOutlined className="text-3xl text-white" />
              </div>
            </div>

            <Title level={3} className="mb-2">
              支付宝扫码登录
            </Title>
            <Text type="secondary" className="mb-8 block">
              请使用支付宝APP扫描二维码登录
            </Text>

            <div className="mb-6 flex justify-center">
              <div className="relative rounded-lg border bg-white p-4">
                {loading ? (
                  <div className="flex h-48 w-48 items-center justify-center">
                    <Spin size="large" />
                  </div>
                ) : (
                  <>
                    <QRCode value={qrCodeValue} size={192} bordered={false} />
                    {(loginStatus === "scanned" ||
                      loginStatus === "expired") && (
                      <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-lg bg-black">
                        <div className="rounded bg-white px-4 py-2 text-center">
                          {loginStatus === "scanned" ? (
                            <Text strong>已扫码，请确认</Text>
                          ) : (
                            <Text strong>二维码已过期</Text>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              {loginStatus === "expired" ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleRefresh}
                  className="w-full"
                >
                  刷新二维码
                </Button>
              ) : (
                <div className="space-y-3">
                  <Text type="secondary" className="block">
                    二维码有效期10分钟
                  </Text>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <AlipayOutlined />
                    <span>打开支付宝APP扫码登录</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500">
              <Text type="secondary">
                登录即表示您同意相关服务条款和隐私政策
              </Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
