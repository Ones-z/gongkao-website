// components/VIPMembershipPage.tsx
import orderService from "@/api/orderService";
import userService from "@/api/userService.ts";
import { getUserInfoSync } from "@/store/userStore";
import { CrownOutlined, StarOutlined } from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { Button, Card, Col, Row, Typography, message } from "antd";
import { useEffect, useState } from "react";

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
  const [userMembershipLevel, setUserMembershipLevel] = useState<number | 0>(
    0,
  );
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { uuid, open_id } = getUserInfoSync();
  // 免费会员特权
  const freeBenefits = [
    "免费筛选职位",
    "免费收藏、对比心仪职位",
    "免费掌握职位一手信息",
    "免费整理汇总历年考试公告",
  ];

  // 专业会员特权
  const proBenefits = [
    "享有所有免费会员特权",
    "根据专业、通勤条件等动态匹配职位",
    "实时提供竞争力分析",
    "一键推荐智能选岗",
    "支持历年分数线查询",
  ];

  // 会员套餐选项
  const plans = [
    {
      id: "monthly",
      goods_id: 1,
      name: "月卡",
      price: 0.01,
      originalPrice: 49.0,
      period: "月",
      description: "适合短期提升",
      icon: <StarOutlined className="text-2xl" />,
    },
    {
      id: "quarterly",
      goods_id: 2,
      name: "季卡",
      price: 0.01,
      originalPrice: 147.0,
      period: "季度",
      description: "性价比优选",
      popular: true,
      icon: <CrownOutlined className="text-2xl" />,
    },
    {
      id: "yearly",
      goods_id: 3,
      name: "年卡",
      price: 0.01,
      originalPrice: 588.0,
      period: "年",
      description: "全年备考无忧",
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
    const selectedPlanData = plans.find((p) => p.id === planId);

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

  const getUpgradePrice = (fromPlan: string, toPlan: string) => {
    // 计算升级所需补差价的简单示例
    const prices: Record<string, number> = {
      monthly: 19.9,
      quarterly: 49.9,
      yearly: 179.9,
    };

    // 实际应用中应考虑已使用时间等因素
    return Math.max(0, prices[toPlan] - prices[fromPlan]).toFixed(1);
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
      {/* 页面标题 */}
      <div className="page-header">
        <h1>公考VIP会员</h1>
        <p>全面提升您的备考效率与通过率</p>
      </div>

      {/* 免费会员特权展示 */}
      <section className="benefits-section">
        <h2>免费会员特权</h2>
        <div className="benefits-grid">
          {freeBenefits.map((benefit, index) => (
            <div key={index} className="benefit-item">
              <span className="check-icon">✓</span>
              <span className="text-gray-600">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 专业会员套餐 */}
      <section className="plans-section">
        <h2>专业会员套餐</h2>
        <p className="section-description">解锁全部备考资源，享受专属服务</p>

        <div className="mx-auto max-w-6xl">
          <Row gutter={[32, 32]} justify="center">
          {plans.map((plan) => (
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

                <div className="mb-3 text-center">
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

                <div className="mb-4 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-800">¥</span>
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

                <Button
                  type={plan.popular ? "primary" : "default"}
                  size="large"
                  className={`w-full rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? "border-none bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                      : "hover:border-blue-500 hover:text-blue-500"
                  }`}
                  onClick={() => handlePurchase(plan.id)}
                  disabled={userMembershipLevel> plan.goods_id}
                >
                  {userMembershipLevel> plan.goods_id ? (
                    "会员等级更高"
                  ) : userMembershipLevel === plan.goods_id ? (
                    "当前等级"
                  ) : selectedPlan === plan.id ? (
                    "已选择"
                  ) : (
                    "立即购买"
                  )}
                </Button>
              </Card>
            </Col>
          ))}
          </Row>
        </div>
      </section>

      {/* 专业会员特权展示 */}
      <section className="pro-benefits-section">
        <h2>专业会员独享特权</h2>
        <div className="benefits-grid">
          {proBenefits.map((benefit, index) => (
            <div key={index} className="benefit-item pro">
              <span className="crown-icon">👑</span>
              <span className="text-yellow-500">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 升级说明 */}
      {/*<section className="upgrade-section">*/}
      {/*  <h2>会员升级说明</h2>*/}
      {/*  <div className="upgrade-info">*/}
      {/*    <p className="text-gray-600">*/}
      {/*      已拥有专业会员？支持套餐升级，只需补差价即可享受更长有效期：*/}
      {/*    </p>*/}
      {/*    <ul>*/}
      {/*      <li>*/}
      {/*        月卡 → 季卡：补差价 ¥{getUpgradePrice("monthly", "quarterly")} 元*/}
      {/*      </li>*/}
      {/*      <li>*/}
      {/*        月卡 → 年卡：补差价 ¥{getUpgradePrice("monthly", "yearly")} 元*/}
      {/*      </li>*/}
      {/*      <li>*/}
      {/*        季卡 → 年卡：补差价 ¥{getUpgradePrice("quarterly", "yearly")} 元*/}
      {/*      </li>*/}
      {/*    </ul>*/}
      {/*    <div className="text-center">*/}
      {/*      <button className="upgrade-button">立即升级</button>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</section>*/}
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
  );
}
