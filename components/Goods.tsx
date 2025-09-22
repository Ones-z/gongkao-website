// components/Goods.tsx
import orderService from "@/api/orderService";
import userService from "@/api/userService.ts";
import { getUserInfoSync } from "@/store/userStore";
import { CrownOutlined, StarOutlined } from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { Button, Card, Col, Row, Typography, message } from "antd";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;

interface MembershipPlan {
  id: string;
  goods_id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

export default function GoodsPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckTimer, setPaymentCheckTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [outOrderNo, setOutOrderNo] = useState("");
  const [userMembershipLevel, setUserMembershipLevel] = useState<number | null>(
    null,
  );
  const [showMembershipDialog, setShowMembershipDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { uuid, open_id } = getUserInfoSync();
  const membershipPlans: MembershipPlan[] = [
    {
      id: "monthly",
      goods_id: 1,
      name: "月卡会员",
      price: 0.01,
      originalPrice: 29.9,
      description: "适合短期体验",
      features: [
        "所有职位优先推荐",
        "简历优化建议",
        "专属客服支持",
        "月度数据分析报告",
      ],
      icon: <StarOutlined className="text-2xl" />,
    },
    {
      id: "quarterly",
      goods_id: 2,
      name: "季卡会员",
      price: 0.01,
      originalPrice: 89.7,
      description: "最受欢迎",
      features: [
        "所有月卡功能",
        "AI智能职位匹配",
        "面试技巧指导",
        "季度职业规划咨询",
        "优先参加线下活动",
      ],
      popular: true,
      icon: <CrownOutlined className="text-2xl" />,
    },
    {
      id: "annual",
      goods_id: 3,
      name: "年卡会员",
      price: 0.01,
      originalPrice: 238.8,
      description: "超值年度套餐",
      features: [
        "所有季卡功能",
        "一对一职业导师",
        "全年无限次简历优化",
        "模拟面试练习",
        "专属学习资料库",
        "免费参加所有线下活动",
      ],
      icon: <CrownOutlined className="text-2xl" />,
    },
    {
      id: "lifetime",
      goods_id: 4,
      name: "终身会员",
      price: 0.01,
      originalPrice: 717.6,
      description: "一次购买 永久享用",
      features: [
        "所有年卡功能",
        "终身免费升级",
        "专属职业发展顾问",
        "定制化求职方案",
        "家庭成员共享权益(2人)",
        "VIP线下活动优先参与权",
      ],
      icon: <CrownOutlined className="text-2xl" />,
    },
  ];

  const handlePurchase = async (planId: string) => {
    setSelectedPlan(planId);
    // 这里可以集成实际的支付逻辑
    console.log("购买计划:", planId);
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true);
      return;
    }
    const selectedPlanData = membershipPlans.find((p) => p.id === planId);

    if (selectedPlanData) {
      // 生成支付宝商户订单号（精确到毫秒）
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS
      const milliseconds = now.getTime().toString().slice(-3); // 毫秒(3位)
      const randomStr = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase(); // 6位随机字符串

      // 组合订单号: QY+日期+时间+毫秒+随机字符串
      const outTradeNo = `QY${dateStr}${timeStr}${milliseconds}${randomStr}`;
      setOutOrderNo(outTradeNo); // 保存已生成的订单号

      const res = await orderService.orderCreate({
        uuid,
        goods_id: selectedPlanData.goods_id,
        out_trade_no: outTradeNo,
        total_amount: selectedPlanData.price,
        subject: selectedPlanData.name,
      });
      // 处理支付宝表单提交
      if (res.data) {
        // 创建一个临时的div来存放表单
        const div = document.createElement("div");
        div.innerHTML = res.data; // 将返回的表单HTML插入到div中
        document.body.appendChild(div);

        // 获取表单
        const form = div.querySelector("form");
        if (form) {
          // 修改表单target属性，使其在新窗口打开
          form.target = "_blank";
          form.submit();
        }

        // 清理临时元素
        document.body.removeChild(div);
        // 显示支付确认弹窗
        setShowPaymentConfirm(true);
      }
    }
  };
  // 添加支付状态检查函数
  const checkPaymentStatus = async () => {
    if (!outOrderNo) return;
    setIsCheckingPayment(true);
    try {
      // 这里调用检查支付状态的API
      const res = await orderService.orderQuery(outOrderNo);
      if (res.code === 0) {
        if (
          res.data.trade_status === "TRADE_SUCCESS" ||
          res.data.trade_status === "TRADE_CLOSED"
        ) {
          // 支付成功，关闭弹窗并更新会员状态
          setShowPaymentConfirm(false);
          setIsCheckingPayment(false);

          // 清除定时器
          if (paymentCheckTimer) {
            clearTimeout(paymentCheckTimer);
            setPaymentCheckTimer(null);
          }

          // 显示成功消息
          if (res.data.trade_status === "TRADE_SUCCESS") {
            messageApi.success("支付成功，会员已生效！");
            // 刷新页面以显示会员状态
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else if (res.data.trade_status === "TRADE_CLOSED") {
            messageApi.warning("支付未完成，请重新支付！");
          }

          // 这里可以添加更新用户会员状态的逻辑
          // 例如刷新页面或更新用户信息状态
          return true;
        } else {
          // 支付未完成，继续检查
          setIsCheckingPayment(false);
          return false;
        }
      }
    } catch (error) {
      console.error("检查支付状态失败:", error);
      setIsCheckingPayment(false);
      messageApi.error("检查支付状态失败");
      return false;
    }
  };

  // 添加定时检查支付状态的函数
  const startPaymentCheck = () => {
    let checkCount = 0;
    const maxChecks = 12; // 1分钟内检查12次（每5秒一次）

    const timer = setInterval(async () => {
      checkCount++;
      const isPaid = await checkPaymentStatus();

      // 如果支付成功或者超过最大检查次数，停止检查
      if (isPaid || checkCount >= maxChecks) {
        clearInterval(timer);
        setPaymentCheckTimer(null);
        if (!isPaid && showPaymentConfirm) {
          messageApi.warning("支付检查超时，请手动确认支付状态");
        }
      }
    }, 3000); // 每3秒检查一次

    setPaymentCheckTimer(timer);
  };

  // 在支付确认弹窗中添加确认按钮的处理函数
  const handleConfirmPayment = async () => {
    // 立即检查一次支付状态
    await checkPaymentStatus();

    // 开始定时检查
    startPaymentCheck();
  };

  const getMembershipLevel = async () => {
    const res = await userService.purchasePlan(uuid);
    if (res.code === 0) {
      setUserMembershipLevel(res.data);
    }
  };
  useEffect(() => {
    getMembershipLevel();
  }, []);

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      {contextHolder}
      {userMembershipLevel ? (
        // 用户已是会员，显示当前会员等级和特权
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Title level={2} className="mb-4 text-gray-800">
              会员中心
            </Title>
            <Text className="text-lg text-gray-600">
              您当前是{" "}
              <span className="font-bold text-blue-600">
                {
                  membershipPlans.find(
                    (p) => p.goods_id === userMembershipLevel,
                  )?.name
                }
              </span>
            </Text>
          </div>

          {/* 当前会员信息卡片 */}
          <div className="mb-12 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 shadow-lg">
            <div className="mb-8 flex flex-col items-center justify-between md:flex-row">
              <div className="mb-4 flex items-center md:mb-0">
                <div className="mr-4 rounded-full bg-blue-500 p-3 text-white">
                  {
                    membershipPlans.find(
                      (p) => p.goods_id === userMembershipLevel,
                    )?.icon
                  }
                </div>
                <div>
                  <Title level={3} className="mb-1 text-gray-800">
                    {
                      membershipPlans.find(
                        (p) => p.goods_id === userMembershipLevel,
                      )?.name
                    }
                  </Title>
                  <Text className="text-gray-600">
                    {
                      membershipPlans.find(
                        (p) => p.goods_id === userMembershipLevel,
                      )?.description
                    }
                  </Text>
                </div>
              </div>
              <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
                当前会员等级
              </div>
            </div>

            {/* 当前会员特权展示 */}
            <div className="mb-8">
              <Title
                level={4}
                className="mb-6 border-b border-gray-200 pb-2 text-gray-800"
              >
                我的会员特权
              </Title>
              <Row gutter={[24, 24]}>
                {membershipPlans
                  .find((p) => p.goods_id === userMembershipLevel)
                  ?.features.map((feature, index) => (
                    <Col xs={24} sm={12} key={index}>
                      <div className="flex items-start rounded-lg bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                            <svg
                              className="h-4 w-4 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                        <Text className="text-gray-700">{feature}</Text>
                      </div>
                    </Col>
                  ))}
              </Row>
            </div>
          </div>

          {/* 升级会员入口 */}
          <div className="rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-100 p-8 shadow-lg">
            <div className="text-center">
              <Title level={3} className="mb-4 text-gray-800">
                升级会员
              </Title>
              <Text className="mx-auto mb-6 block max-w-2xl text-gray-600">
                想要更多特权？升级您的会员等级，解锁更多高级功能和专属服务
              </Text>
              <Button
                type="primary"
                size="large"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 px-8 py-5 text-base hover:from-purple-600 hover:to-indigo-700"
                onClick={() => {
                  // 清除当前会员状态以显示所有套餐选项
                  setShowMembershipDialog(true);
                }}
              >
                查看更多会员套餐
              </Button>
            </div>
          </div>
          {/* 会员套餐对话框 */}
          {showMembershipDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* 背景蒙层 */}
              <div className="bg-opacity-50 absolute inset-0"></div>

              {/* 对话框内容 */}
              <div className="relative max-h-[80vh] w-full max-w-7xl overflow-hidden rounded-3xl bg-white p-8 shadow-2xl">
                <div className="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <Title level={3} className="text-gray-800">
                      会员套餐升级
                    </Title>
                  </div>
                  <button
                    className="rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
                    onClick={() => setShowMembershipDialog(false)}
                  >
                    <svg
                      className="h-6 w-6 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* 会员套餐列表 - 横向布局 */}
                <div className="mt-5 overflow-x-auto pb-4">
                  <div className="flex min-w-max space-x-6">
                    {membershipPlans.map((plan) => (
                      <div key={plan.id} className="mt-3 w-70 flex-shrink-0">
                        <Card
                          className={`h-full transform overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                            plan.popular
                              ? "relative border-2 border-yellow-400"
                              : "border border-gray-200"
                          } ${
                            plan.goods_id === userMembershipLevel
                              ? "ring-3 ring-blue-400"
                              : ""
                          }`}
                          style={{
                            background: plan.popular
                              ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                              : "rgba(255, 255, 255, 0.95)",
                          }}
                        >
                          {plan.popular && (
                            <div className="absolute top-0 right-0 rounded-bl-lg bg-yellow-400 px-4 py-1 text-sm font-bold text-yellow-900">
                              热门推荐
                            </div>
                          )}

                          {plan.goods_id === userMembershipLevel && (
                            <div className="absolute top-0 left-0 rounded-br-lg bg-blue-500 px-4 py-1 text-sm font-bold text-white">
                              当前等级
                            </div>
                          )}

                          <div className="pt-6 text-center">
                            <div className="mb-4 flex justify-center">
                              <div
                                className={`rounded-full p-4 ${plan.popular ? "bg-yellow-500 text-white" : "bg-blue-100 text-blue-500"}`}
                              >
                                {plan.icon}
                              </div>
                            </div>
                            <Title level={4} className="mb-2 text-gray-800">
                              {plan.name}
                            </Title>
                            <Text className="text-gray-600">
                              {plan.description}
                            </Text>
                          </div>

                          <div className="mb-4 text-center">
                            <div className="flex items-baseline justify-center">
                              <span className="text-2xl font-bold text-gray-800">
                                ¥
                              </span>
                              <span className="text-4xl font-bold text-gray-800">
                                {plan.price}
                              </span>
                              {plan.originalPrice && (
                                <span className="ml-3 text-xl text-gray-500 line-through">
                                  ¥{plan.originalPrice}
                                </span>
                              )}
                            </div>
                            {plan.originalPrice && (
                              <div className="mt-2">
                                <Text className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-500">
                                  省 ¥
                                  {(plan.originalPrice - plan.price).toFixed(1)}
                                </Text>
                              </div>
                            )}
                          </div>

                          <div className="mb-6">
                            <Title
                              level={5}
                              className="mb-4 border-b border-gray-200 pb-2 text-gray-800"
                            >
                              套餐特权
                            </Title>
                            <ul className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="mt-1 mr-3 flex-shrink-0">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                      <svg
                                        className="h-3 w-3 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                  <Text className="text-sm text-gray-700">
                                    {feature}
                                  </Text>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <Button
                            type={plan.popular ? "primary" : "default"}
                            size="large"
                            className={`w-full rounded-xl font-semibold transition-all duration-300 ${
                              plan.popular
                                ? "border-none bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-md hover:from-yellow-500 hover:to-yellow-600"
                                : plan.goods_id === userMembershipLevel
                                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                                  : "shadow-sm hover:border-blue-500 hover:text-blue-500 hover:shadow-md"
                            }`}
                            disabled={plan.goods_id <= userMembershipLevel}
                            onClick={() => {
                              if (plan.goods_id !== userMembershipLevel) {
                                handlePurchase(plan.id);
                              }
                            }}
                          >
                            {plan.goods_id === userMembershipLevel
                              ? "当前等级"
                              : plan.goods_id < (userMembershipLevel || 0)
                                ? "降级套餐"
                                : "立即升级"}
                          </Button>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Button
                    size="large"
                    className="px-8"
                    onClick={() => setShowMembershipDialog(false)}
                  >
                    关闭
                  </Button>
                </div>
              </div>
            </div>
          )}
          {showPaymentConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* 背景蒙层 */}
              <div
                className="absolute inset-0 bg-black transition-opacity duration-300"
                style={{ opacity: 0.4 }}
              ></div>

              {/* 弹窗内容 */}
              <div className="relative w-full max-w-md scale-100 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      className="h-8 w-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    支付确认
                  </h3>
                  <p className="mb-2 font-medium text-blue-600">
                    请在新打开的支付宝页面完成支付
                  </p>
                  <p className="mb-6 text-gray-600">
                    支付完成后，请点击下方确认按钮
                  </p>

                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                      size="large"
                      className="px-6"
                      onClick={() => {
                        setShowPaymentConfirm(false);
                        // 清除定时器
                        if (paymentCheckTimer) {
                          clearTimeout(paymentCheckTimer);
                          setPaymentCheckTimer(null);
                        }
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 px-6"
                      loading={isCheckingPayment}
                      onClick={handleConfirmPayment}
                    >
                      {isCheckingPayment ? "检查中..." : "我已完成支付"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // 非会员用户显示所有套餐选项
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Title level={2} className="mb-4 text-gray-800">
              选择适合您的会员套餐
            </Title>
            <Text className="text-lg text-gray-600">
              解锁更多功能，提升求职成功率
            </Text>
          </div>

          <Row gutter={[32, 32]} justify="center">
            {membershipPlans.map((plan) => (
              <Col xs={24} sm={12} lg={6} key={plan.id}>
                <Card
                  className={`h-full overflow-hidden rounded-2xl shadow-xl transition-all duration-300 ${
                    plan.popular
                      ? "relative scale-105 transform border-2 border-yellow-400"
                      : "border border-gray-200 hover:shadow-2xl"
                  } ${selectedPlan === plan.id ? "ring-4 ring-blue-400" : ""} `}
                  style={{
                    background: plan.popular
                      ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                      : "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 rounded-bl-lg bg-yellow-400 px-4 py-1 text-sm font-bold text-yellow-900">
                      热门推荐
                    </div>
                  )}

                  <div className="mb-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div
                        className={`rounded-full p-3 ${plan.popular ? "bg-yellow-500 text-white" : "bg-blue-100 text-blue-500"}`}
                      >
                        {plan.icon}
                      </div>
                    </div>
                    <Title level={4} className="mb-2 text-gray-800">
                      {plan.name}
                    </Title>
                    <Text className="text-gray-600">{plan.description}</Text>
                  </div>

                  <div className="mb-6 text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-800">
                        ¥
                      </span>
                      <span className="text-4xl font-bold text-gray-800">
                        {plan.price}
                      </span>
                      <span className="ml-2 text-gray-500 line-through">
                        ¥{plan.originalPrice}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <div className="mt-1">
                        <Text className="font-medium text-red-500">
                          省 ¥{(plan.originalPrice - plan.price).toFixed(1)}
                        </Text>
                      </div>
                    )}
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-green-500">✓</span>
                        <Text className="text-gray-700">{feature}</Text>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type={plan.popular ? "primary" : "default"}
                    size="large"
                    className={`w-full rounded-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "border-none bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                        : "hover:border-blue-500 hover:text-blue-500"
                    } `}
                    onClick={() => handlePurchase(plan.id)}
                  >
                    {selectedPlan === plan.id ? "已选择" : "立即购买"}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mx-auto mt-16 max-w-4xl rounded-2xl bg-white p-8 shadow-lg">
            <Title level={3} className="mb-6 text-center text-gray-800">
              会员特权详情
            </Title>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={12}>
                <div className="mb-4 flex items-start">
                  <div className="mr-4 rounded-lg bg-blue-100 p-2">
                    <StarOutlined className="text-xl text-blue-500" />
                  </div>
                  <div>
                    <Title level={5} className="text-gray-800">
                      职位推荐优先权
                    </Title>
                    <Text className="text-gray-600">
                      会员用户的职位推荐将获得更高权重，系统优先推送匹配度高的职位信息。
                    </Text>
                  </div>
                </div>

                <div className="mb-4 flex items-start">
                  <div className="mr-4 rounded-lg bg-green-100 p-2">
                    <StarOutlined className="text-xl text-green-500" />
                  </div>
                  <div>
                    <Title level={5} className="text-gray-800">
                      简历优化服务
                    </Title>
                    <Text className="text-gray-600">
                      专业HR团队提供简历优化建议，提升简历通过率。
                    </Text>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="mb-4 flex items-start">
                  <div className="mr-4 rounded-lg bg-purple-100 p-2">
                    <StarOutlined className="text-xl text-purple-500" />
                  </div>
                  <div>
                    <Title level={5} className="text-gray-800">
                      专属客服支持
                    </Title>
                    <Text className="text-gray-600">
                      享受7×24小时专属客服支持，快速解决使用中的问题。
                    </Text>
                  </div>
                </div>

                <div className="mb-4 flex items-start">
                  <div className="mr-4 rounded-lg bg-red-100 p-2">
                    <StarOutlined className="text-xl text-red-500" />
                  </div>
                  <div>
                    <Title level={5} className="text-gray-800">
                      数据分析报告
                    </Title>
                    <Text className="text-gray-600">
                      定期提供求职数据分析报告，帮助用户了解求职趋势和自身竞争力。
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          {showPaymentConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* 背景蒙层 */}
              <div
                className="absolute inset-0 bg-black transition-opacity duration-300"
                style={{ opacity: 0.4 }}
              ></div>

              {/* 弹窗内容 */}
              <div className="relative w-full max-w-md scale-100 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300">
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      className="h-8 w-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    支付确认
                  </h3>
                  <p className="mb-2 font-medium text-blue-600">
                    请在新打开的支付宝页面完成支付
                  </p>
                  <p className="mb-6 text-gray-600">
                    支付完成后，请点击下方确认按钮
                  </p>

                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                      size="large"
                      className="px-6"
                      onClick={() => {
                        setShowPaymentConfirm(false);
                        // 清除定时器
                        if (paymentCheckTimer) {
                          clearTimeout(paymentCheckTimer);
                          setPaymentCheckTimer(null);
                        }
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 px-6"
                      loading={isCheckingPayment}
                      onClick={handleConfirmPayment}
                    >
                      {isCheckingPayment ? "检查中..." : "我已完成支付"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showLoginDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* 背景蒙层 */}
              <div
                className="bg-opacity-50 absolute inset-0"
                onClick={() => setShowLoginDialog(false)}
              ></div>

              {/* 弹窗内容 */}
              <div
                className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <svg
                      className="h-8 w-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>

                  <h3 className="mb-3 text-2xl font-bold text-gray-800">
                    请登录
                  </h3>
                  <p className="mb-6 text-gray-600">
                    购买会员套餐需要先登录账户
                  </p>

                  <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                      size="large"
                      className="px-6"
                      onClick={() => setShowLoginDialog(false)}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      className="bg-gradient-to-r from-blue-500 to-blue-600 px-6"
                      onClick={() => {
                        window.location.replace("/login");
                      }}
                    >
                      去登录
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
