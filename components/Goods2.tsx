// components/VIPMembershipPage.tsx
import goodsService from "@/api/goodsService";
import orderService from "@/api/orderService";
import userService from "@/api/userService";
import type { Goods } from "@/entity";
import { getUserInfoSync } from "@/store/userStore";
import { CheckOutlined, CrownOutlined, StarOutlined } from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { Button, Card, Col, Row, Typography, message } from "antd";
import { useEffect, useState } from "react";
import {trackEvent} from "@/utils/analytics";

const { Title, Text } = Typography;

export default function VIPMembershipPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentCheckTimer, setPaymentCheckTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [outOrderNo, setOutOrderNo] = useState("");
  const [userMembershipLevel, setUserMembershipLevel] = useState<number | 0>(0);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [plans, setPlans] = useState<Goods[]>([]);
  const { uuid, open_id } = getUserInfoSync();

  // 会员套餐选项
  const handleSearchGoods = async () => {
    const res = await goodsService.queryGoods();
    setPlans(res.data);
  };
  const handlePurchase = async (planId: string) => {
    setSelectedPlan(planId);
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true);
      return;
    }
    const selectedPlanData = plans.find((p) => p.code === planId);
    if (!selectedPlanData) return;

    // 检查是否是升级操作
    if (userMembershipLevel > 0 && userMembershipLevel < selectedPlanData.id) {
      handleUpgrade(planId);
      return;
    }

    // 生成支付宝商户订单号（精确到毫秒）
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const milliseconds = now.getTime().toString().slice(-3);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();

    const outTradeNo = `QY${dateStr}${timeStr}${milliseconds}${randomStr}`;
    setOutOrderNo(outTradeNo);

    const res = await orderService.orderCreate({
      uuid,
      goods_id: selectedPlanData.id,
      out_trade_no: outTradeNo,
      total_amount: selectedPlanData.price,
      subject: selectedPlanData.name,
    });

    if (res.data) {
      const div = document.createElement("div");
      div.innerHTML = res.data;
      document.body.appendChild(div);

      const form = div.querySelector("form");
      if (form) {
        form.target = "_blank";
        form.submit();
      }

      document.body.removeChild(div);
      setShowPaymentConfirm(true);
      trackEvent("会员购买", {
        planId,
        uuid,
      });
    }
  };

  const handleUpgrade = async (targetPlanId: string) => {
    const targetPlan = plans.find((p) => p.code === targetPlanId);
    if (!targetPlan) return;

    const currentPlan = plans.find((p) => p.id === userMembershipLevel);
    const priceDifference = targetPlan.price - (currentPlan?.price || 0);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const milliseconds = now.getTime().toString().slice(-3);
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();

    const outTradeNo = `QY${dateStr}${timeStr}${milliseconds}${randomStr}`;
    setOutOrderNo(outTradeNo);

    const res = await orderService.orderCreate({
      uuid,
      goods_id: targetPlan.id,
      out_trade_no: outTradeNo,
      total_amount: priceDifference > 0 ? priceDifference : 0.01,
      subject: `会员升级-${targetPlan.name}`,
    });

    if (res.data) {
      const div = document.createElement("div");
      div.innerHTML = res.data;
      document.body.appendChild(div);

      const form = div.querySelector("form");
      if (form) {
        form.target = "_blank";
        form.submit();
      }

      document.body.removeChild(div);
      setShowPaymentConfirm(true);
    }
    trackEvent("会员升级", {
      currentPlanId: userMembershipLevel,
      targetPlanId,
      uuid,
    });
  };

  const checkPaymentStatus = async () => {
    if (!outOrderNo) return;
    setIsCheckingPayment(true);
    try {
      const res = await orderService.orderQuery(outOrderNo);
      if (res.code === 0) {
        if (
          res.data.trade_status === "TRADE_SUCCESS" ||
          res.data.trade_status === "TRADE_CLOSED"
        ) {
          setShowPaymentConfirm(false);
          setIsCheckingPayment(false);

          if (paymentCheckTimer) {
            clearTimeout(paymentCheckTimer);
            setPaymentCheckTimer(null);
          }

          if (res.data.trade_status === "TRADE_SUCCESS") {
            messageApi.success("支付成功，会员已生效！");
            trackEvent("会员生效", {
              planId: selectedPlan,
              uuid,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else if (res.data.trade_status === "TRADE_CLOSED") {
            messageApi.warning("支付未完成，请重新支付！");
          }
          return true;
        } else {
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

  const startPaymentCheck = () => {
    let checkCount = 0;
    const maxChecks = 12;

    const timer = setInterval(async () => {
      checkCount++;
      const isPaid = await checkPaymentStatus();

      if (isPaid || checkCount >= maxChecks) {
        clearInterval(timer);
        setPaymentCheckTimer(null);
        if (!isPaid && showPaymentConfirm) {
          messageApi.warning("支付检查超时，请手动确认支付状态");
          setShowPaymentConfirm(false);
          setIsCheckingPayment(false);
        }
      }
    }, 3000);

    setPaymentCheckTimer(timer);
    trackEvent("会员支付确认", {
      planId: selectedPlan,
      uuid,
    })
  };

  const handleConfirmPayment = async () => {
    await checkPaymentStatus();
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
    handleSearchGoods();
  }, []);

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 text-white sm:py-12">
      {contextHolder}

      {/* 页面标题 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-yellow-400 sm:text-3xl">
          VIP会员套餐
        </h1>
        <p className="mt-2 text-gray-300">
          选择最适合您的会员方案，享受专属权益
        </p>
      </div>

      {/* 会员套餐区域 */}
      <section className="mb-12">
        <div className="mx-auto max-w-6xl">
          <Row gutter={[16, 16]} justify="center">
            {plans.map((plan) => (
              <Col xs={24} sm={12} lg={8} key={plan.code}>
                <Card
                  className={`h-full overflow-hidden rounded-2xl shadow-xl transition-all duration-300 ${
                    plan.popular
                      ? "relative scale-105 transform border-2 border-yellow-400"
                      : "border border-gray-200 hover:shadow-2xl"
                  } ${selectedPlan === plan.code ? "ring-4 ring-blue-400" : ""} `}
                  style={{
                    background: plan.popular
                      ? "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                      : "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {plan.popular!==0 && (
                    <div className="absolute top-0 right-0 rounded-bl-lg bg-yellow-400 px-4 py-1 text-sm font-bold text-yellow-900">
                      热门推荐
                    </div>
                  )}

                  <div className="mb-3 text-center">
                    <div className="mb-4 flex justify-center">
                      <div
                        className={`rounded-full p-3 ${plan.popular ? "bg-yellow-500 text-white" : "bg-blue-100 text-blue-500"}`}
                      >
                        {plan.code === "monthly" ? (
                          <StarOutlined className="text-2xl" />
                        ) : plan.code === "yearly" ? (
                          <CrownOutlined className="text-2xl" />
                        ) : (
                          <StarOutlined className="text-2xl" />
                        )}
                      </div>
                    </div>
                    <Title level={4} className="mb-2 text-gray-800">
                      {plan.name}
                    </Title>
                    <Text className="text-gray-600">{plan.description}</Text>
                  </div>

                  <div className="mb-4 text-center">
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-800">
                        ¥
                      </span>
                      <span className="text-4xl font-bold text-gray-800">
                        {plan.price}
                      </span>
                      <span className="ml-2 text-gray-500 line-through">
                        ¥{plan.origin_price}
                      </span>
                    </div>
                    {plan.origin_price && (
                      <div className="mt-1">
                        <Text className="font-medium text-red-500">
                          省 ¥{(plan.origin_price - plan.price).toFixed(1)}
                        </Text>
                      </div>
                    )}
                  </div>

                  <Button
                    type={plan.popular ? "primary" : "default"}
                    size="large"
                    className={`w-full rounded-lg font-semibold transition-all duration-300 ${
                      plan.popular
                        ? "border-none bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                        : "hover:border-blue-500 hover:text-blue-500"
                    } ${
                      userMembershipLevel > 0 && userMembershipLevel < plan.id
                        ? "animate-pulse bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:from-green-500 hover:to-blue-600"
                        : ""
                    }`}
                    onClick={() => handlePurchase(plan.code)}
                    disabled={userMembershipLevel >= plan.id}
                  >
                    {userMembershipLevel > plan.id ? (
                      "会员等级更高"
                    ) : userMembershipLevel === plan.id ? (
                      "当前等级"
                    ) : userMembershipLevel > 0 &&
                      userMembershipLevel < plan.id ? (
                      <span className="flex items-center justify-center text-red-400">
                        <svg
                          className="mr-1 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        升级仅需¥
                        {(
                          plan.price -
                          (plans.find((p) => p.id === userMembershipLevel)
                            ?.price || 0)
                        ).toFixed(2)}
                      </span>
                    ) : (
                      `立即购买`
                    )}
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* VIP对比区域 */}
      <section className="mb-12 px-2">
        <h2 className="mb-6 flex items-center justify-center text-center text-xl font-bold sm:text-2xl">
          <span className="mr-2 text-yellow-500">★</span>
          VIP vs 免费会员
        </h2>
        <div className="bg-opacity-50 mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gray-800">
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4 text-left">特权项目</th>
                  <th className="p-4 text-center">免费</th>
                  <th className="p-4 text-center">VIP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="p-4">岗位多条件筛选</td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-4">一键收藏岗位</td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="p-4">多个岗位对比</td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">掌握一手资讯</td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">整理汇总历年考试</td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                  <td className="p-4 text-center text-green-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">优先专业匹配岗位</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center text-yellow-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">实时竞争力分析</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center text-yellow-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">一键智能推荐</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center text-yellow-500">
                    <CheckOutlined />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">历年分数线查询</td>
                  <td className="p-4 text-center">-</td>
                  <td className="p-4 text-center text-yellow-500">
                    <CheckOutlined />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 移动端展示方式 */}
          <div className="sm:hidden">
            <div className="space-y-4 p-4">
              <div className="rounded-lg bg-gray-700 p-4">
                <h3 className="mb-3 text-lg font-bold text-yellow-400">
                  免费会员
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-green-500" />
                    <span>岗位多条件筛选</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-green-500" />
                    <span>一键收藏岗位</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-green-500" />
                    <span>多个岗位对比</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-green-500" />
                    <span>掌握一手资讯</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-green-500" />
                    <span>整理汇总历年考试</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-800 p-4">
                <h3 className="mb-3 text-lg font-bold">VIP会员</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>岗位多条件筛选</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>一键收藏岗位</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>多个岗位对比</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>掌握一手资讯</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>整理汇总历年考试</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>优先专业匹配岗位</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>实时竞争力分析</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>一键智能推荐</span>
                  </li>
                  <li className="flex items-center">
                    <CheckOutlined className="mr-2 text-white" />
                    <span>历年分数线查询</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部说明 */}
      <section className="mb-8 px-4 text-center text-sm text-gray-500">
        <p>所有会员服务均为虚拟商品，购买后不支持退款</p>
        <p className="mt-1">如有疑问请联系客服</p>
      </section>

      {/* 支付确认弹窗 */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black transition-opacity duration-300"
            style={{ opacity: 0.6 }}
            onClick={() => {
              setShowPaymentConfirm(false);
              if (paymentCheckTimer) {
                clearTimeout(paymentCheckTimer);
                setPaymentCheckTimer(null);
              }
            }}
          ></div>

          <div className="relative w-full max-w-md scale-100 transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 sm:mb-6 sm:h-16 sm:w-16">
                <svg
                  className="h-7 w-7 text-blue-500 sm:h-8 sm:w-8"
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

              <h3 className="mb-2 text-xl font-bold text-gray-800 sm:mb-3 sm:text-2xl">
                支付确认
              </h3>
              <p className="mb-1 font-medium text-blue-600 sm:mb-2">
                请在新打开的支付宝页面完成支付
              </p>
              <p className="mb-4 text-gray-600 sm:mb-6">
                支付完成后，请点击下方确认按钮
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Button
                  size="large"
                  block
                  className="px-6 sm:w-auto"
                  onClick={() => {
                    setShowPaymentConfirm(false);
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
                  block
                  className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 sm:w-auto"
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

      {/* 登录提示弹窗 */}
      {showLoginDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-opacity-50 absolute inset-0 bg-black"
            onClick={() => setShowLoginDialog(false)}
          ></div>

          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 sm:mb-6 sm:h-16 sm:w-16">
                <svg
                  className="h-7 w-7 text-blue-500 sm:h-8 sm:w-8"
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

              <h3 className="mb-2 text-xl font-bold text-gray-800 sm:mb-3 sm:text-2xl">
                请登录
              </h3>
              <p className="mb-4 text-gray-600 sm:mb-6">
                购买会员套餐需要先登录账户
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                <Button
                  size="large"
                  block
                  className="px-6 sm:w-auto"
                  onClick={() => setShowLoginDialog(false)}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="large"
                  block
                  className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 sm:w-auto"
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
  );
}
