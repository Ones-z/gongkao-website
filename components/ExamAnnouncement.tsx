// ExamAnnouncement.tsx
import jobService from "@/api/jobService";
import type { Recruitment } from "@/entity";
import { getUserInfoSync, useUserActions } from "@/store/userStore";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import { BackTop, message } from "antd";
import React, { useEffect, useState } from "react";
import userService from "@/api/userService.ts";

export default function ExamAnnouncementPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [messageApi, contextHolder] = message.useMessage();
  const [announcements, setAnnouncements] = useState<Recruitment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedYear, setSelectedYear] = useState("全部");
  const [selectedRegion, setSelectedRegion] = useState("全部");
  // 动态获取年份选项
  const years = ["全部", "2025", "2024", "2023"];
  // 动态获取地区选项
  const provinces = ["全部", "上海市"];
  const categories = ["全部", "国考", "省考", "事业单位"];
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { uuid,open_id,profile_finished,preference } = getUserInfoSync();
  const { setUserInfo} = useUserActions();
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPreferenceModal, setShowPreferenceModal] = useState(false);
  const [examType, setExamType] = useState("");
  const [workCity, setWorkCity] = useState("");
  const [membershipLevel, setMembershipLevel]=useState(0);
  const [showMembershipModal, setShowMembershipModal] = useState(false);

  const searchAnnouncements = async (
    name: string,
    category: string,
    year: string,
    province: string,
    pageSize: number,
    current: number,
  ) => {
    const params: any = {};
    params.pageSize = pageSize;
    params.current = current;
    if (name) {
      params.name = name;
    }
    if (category && category !== "全部") {
      params.category = category;
    }
    if (year && year !== "全部") {
      params.year = year;
    }
    if (province && province !== "全部") {
      params.province = province;
    }
    const res = await jobService.getRecruitments(params);
    setAnnouncements(res.data);
    setTotalPages(Math.ceil(res.total / pageSize));
  };

  // 添加处理一键推荐的函数
  const handleRecommend = () => {
    if (!open_id) {
      // 未登录，显示登录弹窗
      setShowLoginModal(true);
      return;
    }

    // 检查用户是否填写资料
    if (!profile_finished) {
      // 未完善资料，显示完善资料弹窗
      setShowProfileModal(true);
      return;
    }

    console.log("preference:", preference);

    // 检查用户是否已填写考试偏好
    if (!preference) {
      // 未填写考试偏好，显示填写偏好弹窗
      setShowPreferenceModal(true);
      return;
    }

    // 检查用户会员等级
    if (!membershipLevel){
      messageApi.warning("请先购买会员");
      setShowMembershipModal(true);
      return;
    }

    // 用户已登录且资料完整，执行推荐逻辑
    // 这里可以添加实际的推荐逻辑
    window.location.href = `/recommend-jobs`;
    console.log("执行智能推荐");
  };

  // 添加提交选岗意向的函数
  const handleSubmitPreference = () => {
    if (!examType) {
      messageApi.warning("请选择考试类型");
      return;
    }

    if (!workCity) {
      messageApi.warning("请选择工作城市");
      return;
    }

    if (workCity !== "上海") {
      messageApi.warning("暂不支持其它城市");
      return;
    }

    const userInfo = getUserInfoSync();
    const updatedInfo = {
      ...userInfo,
      preference: {
        exam_type: examType,
        work_city: workCity,
      }
    };

    // 使用 setUserInfo 更新全局状态
    setUserInfo(updatedInfo);
    // 关闭弹窗
    setShowPreferenceModal(false);

    // 执行推荐逻辑，可以将选岗意向作为参数传递
    window.location.href = `/recommend-jobs?examType=${examType}&city=${workCity}`;
    console.log("执行智能推荐，考试类型:", examType, "工作城市:", workCity);
  };

  // 添加登录处理函数
  const handleLogin = () => {
    // 关闭登录弹窗
    setShowLoginModal(false);
    // 跳转到登录页面的逻辑
    window.location.href = "/login"; // 根据实际路径调整
  };

  // 添加完善资料处理函数
  const handleCompleteProfile = () => {
    // 关闭资料弹窗
    setShowProfileModal(false);
    // 跳转到完善资料页面的逻辑
    window.location.href = "/profile"; // 根据实际路径调整
  };

  // 添加会员购买处理函数
  const handlePurchaseMembership = () => {
    // 关闭会员弹窗
    setShowMembershipModal(false);
    // 跳转到会员购买页面
    window.location.href = "/goods"; // 根据实际路径调整
  };

  const handlePrevPage = () => {
    if (current > 1) {
      setCurrent(current - 1);
    }
  };

  const handleNextPage = () => {
    if (current < totalPages) {
      setCurrent(current + 1);
    }
  };
  const handleAnnouncementClick = (id: number) => {
    window.location.href = `/exam-announcement-jobs?id=${id}`;
  };

  const getMembershipLevel = async () => {
    const res = await userService.purchasePlan(uuid);
    if (res.code === 0) {
      setMembershipLevel(res.data);
    }
  };
  useEffect(() => {
    getMembershipLevel();
  }, []);

  useEffect(() => {
    searchAnnouncements(
      searchTerm,
      selectedCategory,
      selectedYear,
      selectedRegion,
      pageSize,
      current,
    );
  }, [
    searchTerm,
    selectedCategory,
    selectedYear,
    selectedRegion,
    pageSize,
    current,
  ]);

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      {contextHolder}
      {/* 搜索和筛选区域 */}
      <div className="mx-auto mb-8 max-w-6xl rounded-xl bg-white p-4 shadow-lg sm:p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="搜索城市、地区、招考类型"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-3 placeholder-gray-500 shadow-md transition-shadow hover:shadow-lg focus:border-blue-500 focus:outline-none"
          />
          <button className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-white shadow-md transition-all hover:from-blue-600 hover:to-indigo-700">
            搜索
          </button>
        </div>

        {/* 筛选器容器 - 响应式布局 */}
        <div className="space-y-4 sm:space-y-0">
          {/* 考试类型筛选 */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <span className="mb-2 text-sm font-medium text-gray-600 sm:mr-4 sm:mb-0 sm:w-20">
              考试类型:
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 年份筛选 */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <span className="mb-2 text-sm font-medium text-gray-600 sm:mr-4 sm:mb-0 sm:w-20">
              招录年份:
            </span>
            <div className="flex flex-wrap gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 ${
                    selectedYear === year
                      ? "bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* 地区筛选 */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <span className="mb-2 text-sm font-medium text-gray-600 sm:mr-4 sm:mb-0 sm:w-20">
              报考地区:
            </span>
            <div className="flex flex-wrap gap-2">
              {provinces.map((province) => (
                <button
                  key={province}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:px-4 sm:py-2 ${
                    selectedRegion === province
                      ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedRegion(province)}
                >
                  {province}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* 一键选岗卡片区域 */}
        <div className="mt-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 shadow-lg">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left">
            <div className="mb-4 sm:mr-6 sm:mb-0">
              <div className="text-3xl font-bold text-white">🚀</div>
            </div>
            <div className="flex-1 text-white">
              <h3 className="mb-2 text-xl font-bold">智能选岗助手</h3>
              <p className="text-orange-100">
                根据您的专业、学历、地区偏好，智能推荐最适合您的岗位
              </p>
            </div>
            <button
              onClick={handleRecommend}
              className="mt-4 w-full rounded-lg bg-white px-6 py-3 font-bold text-orange-500 shadow-md transition-all hover:bg-gray-100 sm:mt-0 sm:w-auto"
            >
              一键智能选岗
            </button>
          </div>
        </div>
      </div>
      {/* 公告列表 */}
      <div className="mx-auto max-w-6xl space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="cursor-pointer rounded-xl border-l-4 border-blue-500 bg-white p-4 shadow-md transition-shadow hover:border-indigo-500 hover:shadow-xl sm:p-6"
            onClick={() => handleAnnouncementClick(item.id)}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold sm:px-3 sm:py-1 ${
                  item.category === "国考"
                    ? "bg-red-100 text-red-800"
                    : item.category === "省考"
                      ? "bg-blue-100 text-blue-800"
                      : item.category === "事业单位"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.category}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 sm:px-3 sm:py-1">
                {item.province}
              </span>
            </div>
            <h3 className="mb-3 text-base font-semibold text-gray-800 transition-colors hover:text-blue-600 sm:text-lg">
              {item.name}
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="flex min-w-[120px] items-center rounded px-2 py-1 sm:min-w-[140px]">
                  <svg
                    className="mr-1 h-4 w-4 flex-shrink-0 text-blue-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                  </svg>
                  <span className="text-xs whitespace-nowrap sm:text-sm">
                    发布日期：{item.publish_date.replace(/T.*/, "")}
                  </span>
                </span>
                <span className="flex min-w-[40px] items-center rounded px-2 py-1 sm:min-w-[50px]">
                  <svg
                    className="mr-1 h-4 w-4 flex-shrink-0 text-purple-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    ></path>
                  </svg>
                  <span className="text-xs whitespace-nowrap sm:text-sm">
                    {item.batch || 1}批
                  </span>
                </span>
                <span className="flex min-w-[80px] items-center rounded px-2 py-1 sm:min-w-[100px]">
                  <svg
                    className="mr-1 h-4 w-4 flex-shrink-0 text-green-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                  <span className="text-xs whitespace-nowrap sm:text-sm">
                    招聘 {item.headcounts} 人
                  </span>
                </span>
              </div>
              <div className="flex items-center rounded bg-gray-100 px-2 py-1">
                <svg
                  className="mr-1 h-4 w-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
                <span className="whitespace-nowrap">
                  浏览量: {item.view_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* 分页组件 */}
      <div className="mx-auto mt-8 flex max-w-6xl items-center justify-center space-x-2 sm:space-x-4">
        <button
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 sm:px-4 sm:py-2"
          onClick={handlePrevPage}
          disabled={current === 1}
        >
          上一页
        </button>
        <span className="px-3 py-2 text-sm text-gray-600 sm:px-4">
          {current}/{totalPages}
        </span>
        <button
          className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-sm text-white transition-all hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 sm:px-4 sm:py-2"
          onClick={handleNextPage}
          disabled={current === totalPages}
        >
          下一页
        </button>
      </div>
      <BackTop />
      {/* 登录引导弹窗 */}
      {showLoginModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-gray-800">请先登录</h3>
              <p className="mt-2 text-gray-600">登录后可享受个性化推荐服务</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white hover:from-blue-600 hover:to-indigo-700"
              >
                支付宝登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完善资料引导弹窗 */}
      {showProfileModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-gray-800">完善个人资料</h3>
              <p className="mt-2 text-gray-600">
                完善资料后可获得更精准的职位推荐
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                稍后完善
              </button>
              <button
                onClick={handleCompleteProfile}
                className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 px-4 py-2 text-white hover:from-green-600 hover:to-teal-600"
              >
                去完善资料
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 会员购买引导弹窗 */}
      {showMembershipModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-center">
              <h3 className="text-xl font-bold text-gray-800">升级为VIP会员</h3>
              <p className="mt-2 text-gray-600">
                购买会员后可享受智能选岗等专属服务
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowMembershipModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                稍后购买
              </button>
              <button
                onClick={handlePurchaseMembership}
                className="flex-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-white hover:from-yellow-600 hover:to-orange-600"
              >
                立即购买
              </button>
            </div>
          </div>
        </div>
      )}
      {showPreferenceModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <svg
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">选岗意向</h3>
              <p className="mt-2 text-gray-600">
                请填写您的选岗意向以获得更精准的推荐
              </p>
            </div>

            {/* 考试类型选择 */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                您关注的考试类型是？
              </label>
              <div className="space-y-3">
                {["国考", "省考", "事业编"].map((type) => (
                  <div
                    key={type}
                    className={`flex items-center rounded-xl border-2 p-4 transition-all duration-200 ${
                      examType === type
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    <input
                      type="radio"
                      id={`exam-${type}`}
                      name="examType"
                      value={type}
                      checked={examType === type}
                      onChange={(e) => setExamType(e.target.value)}
                      className="h-5 w-5 text-orange-500 focus:ring-orange-500"
                    />
                    <label
                      htmlFor={`exam-${type}`}
                      className="ml-3 block text-base font-medium text-gray-800"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 工作城市选择 */}
            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-gray-700">
                您想在哪个城市工作？
              </label>
              <div className="space-y-3">
                <div
                  className={`flex items-center rounded-xl border-2 p-4 transition-all duration-200 ${
                    workCity === "上海"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <input
                    type="radio"
                    id="city-shanghai"
                    name="workCity"
                    value="上海"
                    checked={workCity === "上海"}
                    onChange={(e) => setWorkCity(e.target.value)}
                    className="h-5 w-5 text-green-500 focus:ring-green-500"
                  />
                  <label
                    htmlFor="city-shanghai"
                    className="ml-3 block text-base font-medium text-gray-800"
                  >
                    上海
                  </label>
                </div>
                <div
                  className={`flex items-center rounded-xl border-2 p-4 transition-all duration-200 ${
                    workCity === "其他"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-red-300"
                  }`}
                >
                  <input
                    type="radio"
                    id="city-other"
                    name="workCity"
                    value="其他"
                    checked={workCity === "其他"}
                    onChange={(e) => setWorkCity(e.target.value)}
                    className="h-5 w-5 text-red-500 focus:ring-red-500"
                  />
                  <label
                    htmlFor="city-other"
                    className="ml-3 block text-base font-medium text-gray-800"
                  >
                    其他
                  </label>
                </div>
              </div>
              {workCity === "其他" && (
                <div className="mt-3 rounded-lg bg-red-50 p-3">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="ml-2 text-sm text-red-700">
                      暂不支持其它城市
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowPreferenceModal(false)}
                className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSubmitPreference}
                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-3 text-base font-bold text-white shadow-md transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-lg"
              >
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
