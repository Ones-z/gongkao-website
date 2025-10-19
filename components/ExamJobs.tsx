// ExamJobs.tsx
import jobService from "@/api/jobService";
import type { Job, JobFilter, Recruitment } from "@/entity";
import { getUserInfoSync } from "@/store/userStore";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ReadOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import {
  BackTop,
  Button,
  Card,
  Col,
  Divider,
  Input,
  List,
  Progress,
  Row,
  Select,
  Tag,
  Typography,
  message,
} from "antd";
import type { ProgressProps } from "antd";
import React, { useCallback, useEffect, useState } from "react";

const { Text, Title } = Typography;

export default function ExamJobsPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const conicColors: ProgressProps["strokeColor"] = {
    "0%": "#87d068",
    "25%": "#ffc069",
    "50%": "#ffe58f",
    "75%": "#ffe7ba",
    "100%": "#ffccc7",
  };
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [activeTab, setActiveTab] = useState<"announcement" | "jobs">(
    "announcement",
  );
  const [jobs, setJobs] = useState<Job[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [collectedJobs, setCollectedJobs] = useState<number[]>([]);
  const [comparedJobs, setComparedJobs] = useState<number[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { uuid, open_id } = getUserInfoSync();
  const [isMobile, setIsMobile] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return { id: params.get("id") };
  };
  const [sortBy, setSortBy] = useState<string>("default");
  // 添加状态来控制下拉菜单的显示
  const [showSortMenu, setShowSortMenu] = useState(false);
  const politicalStatus = [
    { value: "群众", label: "群众" },
    { value: "共青团员", label: "共青团员" },
    { value: "中共党员", label: "中共党员" },
    { value: "民主党派", label: "民主党派" },
    { value: "无党派人士", label: "无党派人士" },
  ];
  const experienceLevels = [
    { value: "无经验", label: "无经验" },
    { value: "1-3年", label: "1-3年" },
    { value: "3-5年", label: "3-5年" },
    { value: "5-10年", label: "5-10年" },
    { value: "10年以上", label: "10年以上" },
  ];
  const recruitmentTargets = [
    { value: "应届毕业生", label: "应届毕业生" },
    { value: "非应届毕业生", label: "非应届毕业生" },
  ];
  const [filters, setFilters] = useState({
    jobName: "",
    major: undefined,
    political_status: undefined,
    experience: undefined,
    recruitment_target: undefined,
  });
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const getRecruitment = async () => {
    const { id } = getQueryParams();
    const res = await jobService.getRecruitment(id);
    setRecruitment(res.data);
  };
  const onSearch = useCallback(
    async (params: JobFilter) => {
      setLoading(true);
      try {
        const { id } = getQueryParams();
        const newParams = { ...params, recruitment_id: id };
        // 添加排序参数
        if (sortBy === "headcount_asc") {
          newParams.order_by = "headcount";
          newParams.sort_order = "asc";
        } else if (sortBy === "headcount_desc") {
          newParams.order_by = "headcount";
          newParams.sort_order = "desc";
        }

        const res = await jobService.getJobs(newParams);
        setJobs(res.data);
        // 默认选中第一个职位
        if (res.data.length > 0) {
          setSelectedJob(res.data[0]);
        }
      } catch (error) {
        console.error("获取职位列表失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [sortBy],
  );
  const handleCollect = async (jobId: number) => {
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true); // 打开登录弹窗
      return;
    }
    try {
      // 检查是否已收藏
      const isCollected = collectedJobs.includes(jobId);

      if (isCollected) {
        // 取消收藏
        const res = await jobService.unCollectJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          messageApi.success("取消收藏成功");
          setCollectedJobs((prev) => prev.filter((id) => id !== jobId));
        } else {
          messageApi.error("取消收藏失败");
        }
      } else {
        // 添加收藏
        const res = await jobService.collectJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          messageApi.success("收藏成功");
          setCollectedJobs((prev) => [...prev, jobId]);
        } else {
          messageApi.error("收藏失败");
        }
      }
    } catch (error) {
      messageApi.error("操作失败");
    }
  };
  // 添加获取用户收藏和对比职位的函数
  const getUserJobStatus = async () => {
    try {
      // 获取收藏的职位
      const collectRes = await jobService.getCollectJobs(uuid);
      if (collectRes.code === 0) {
        const collectedIds = collectRes.data.map((job) => job.id);
        setCollectedJobs(collectedIds);
      }

      // 获取对比的职位
      const compareRes = await jobService.getCompareJobs(uuid);
      if (compareRes.code === 0) {
        const comparedIds = compareRes.data.map((job) => job.id);
        setComparedJobs(comparedIds);
      }
    } catch (error) {
      console.error("获取用户职位状态失败:", error);
    }
  };
  const handleShare = async (jobId: number) => {
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true); // 打开登录弹窗
      return;
    }
    const urlSafeBase64Encode = (str: string) => {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    const encodedId = urlSafeBase64Encode(jobId.toString()+uuid);
    const url = `${window.location.origin}/job-detail?id=${encodedId}`;
    // 使用 Clipboard API 复制链接到剪贴板
    console.log(url);
    await navigator.clipboard.writeText(url);
    messageApi.success("链接已复制到剪贴板");
  };
  const handleCompare = async (jobId: number) => {
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true); // 打开登录弹窗
      return;
    }
    try {
      // 检查是否已在对比列表中
      const isCompared = comparedJobs.includes(jobId);

      if (isCompared) {
        // 从对比列表中移除
        const res = await jobService.unCompareJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          messageApi.success("已从对比列表中移除");
          setComparedJobs((prev) => prev.filter((id) => id !== jobId));
        } else {
          messageApi.error("移除失败");
        }
      } else {
        // 添加到对比列表
        const res = await jobService.compareJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          messageApi.success("已添加到对比列表");
          setComparedJobs((prev) => [...prev, jobId]);
        } else {
          messageApi.error("添加失败");
        }
      }
    } catch (error) {
      messageApi.error("操作失败");
    }
  };

  const handleFilterChange = (field: string, value: any) => {
    if (field === "major") {
      // 对于级联选择器，value是一个数组，取最后一个值作为筛选条件
      const majorValue = Array.isArray(value) ? value[value.length - 1] : value;
      setFilters((prev) => ({
        ...prev,
        [field]: majorValue,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handlePrevPage = () => {
    if (current > 1) {
      setCurrent(current - 1);
      // 可能需要重新获取数据
      onSearch({
        name: filters.jobName,
        major: filters.major,
        political_status: filters.political_status,
        experience: filters.experience,
        recruitment_target: filters.recruitment_target,
        current: current - 1,
        pageSize: pageSize,
      });
    }
  };

  const handleNextPage = () => {
    if (current < totalPages) {
      setCurrent(current + 1);
      // 可能需要重新获取数据
      onSearch({
        name: filters.jobName,
        major: filters.major,
        political_status: filters.political_status,
        experience: filters.experience,
        recruitment_target: filters.recruitment_target,
        current: current + 1,
        pageSize: pageSize,
      });
    }
  };

  // 检测是否为移动端
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  useEffect(() => {
    onSearch({
      name: filters.jobName,
      major: filters.major,
      political_status: filters.political_status,
      experience: filters.experience,
      recruitment_target: filters.recruitment_target,
      current: current,
      pageSize: pageSize,
    });
    if (uuid) {
      getUserJobStatus();
    }
  }, [filters, onSearch, uuid]);

  useEffect(() => {
    getRecruitment();
  }, []);

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      {contextHolder}
      {/* 考试公告详情 */}
      {recruitment && (
        <div className="mx-auto mb-8 max-w-6xl rounded-xl bg-white p-6 shadow-lg">
          {/* Tab 导航栏 */}
          <div className="mb-6 flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium sm:text-base ${
                activeTab === "announcement"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("announcement")}
            >
              公告详情
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium sm:text-base ${
                activeTab === "jobs"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("jobs")}
            >
              招聘职位
            </button>
          </div>

          {/* 公告详情 Tab 内容 */}
          {activeTab === "announcement" && (
            <div>
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  {recruitment.name}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      recruitment.category === "国考"
                        ? "bg-red-100 text-red-800"
                        : recruitment.category === "省考"
                          ? "bg-blue-100 text-blue-800"
                          : recruitment.category === "事业单位"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {recruitment.category}
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                    {recruitment.province}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center rounded-lg bg-blue-50 p-4">
                  <ClockCircleOutlined
                    className="mr-3 text-lg"
                    style={{ fontSize: "1.5rem", color: "#0070f3" }}
                  />
                  <div>
                    <p className="text-xs text-gray-600">发布日期</p>
                    <p className="font-medium text-black">
                      {recruitment.publish_date.replace(/T.*/, "")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center rounded-lg bg-purple-50 p-4">
                  <UserOutlined
                    className="mr-3 text-lg"
                    style={{ fontSize: "1.5rem", color: "#5a67d8" }}
                  />
                  <div>
                    <p className="text-xs text-gray-600">批次</p>
                    <p className="font-medium text-black">
                      第{recruitment.batch || 1}批
                    </p>
                  </div>
                </div>
                <div className="flex items-center rounded-lg bg-green-50 p-4">
                  <TeamOutlined
                    className="mr-3 text-lg"
                    style={{ fontSize: "1.5rem", color: "#10b981" }}
                  />
                  <div>
                    <p className="text-xs text-gray-600">招聘人数</p>
                    <p className="font-medium text-black">
                      共 {recruitment.headcounts} 人
                    </p>
                  </div>
                </div>
                <div className="flex items-center rounded-lg bg-gray-50 p-4">
                  <EnvironmentOutlined
                    className="mr-3 text-lg"
                    style={{ fontSize: "1.5rem", color: "#6b7280" }}
                  />
                  <div>
                    <p className="text-xs text-gray-600">浏览量</p>
                    <p className="font-medium text-black">
                      {recruitment.view_count}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h2 className="mb-3 text-lg font-semibold text-gray-800">
                  公告详情
                </h2>
                <div
                  className="relative rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4"
                  style={{
                    maxHeight: isContentExpanded ? "none" : "80px",
                    overflow: "hidden",
                  }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                    {recruitment.content || "暂无详细描述"}
                  </p>
                  {!isContentExpanded &&
                    recruitment?.content &&
                    recruitment.content.length > 100 && (
                      <div className="absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-gray-50 to-transparent"></div>
                    )}
                </div>
                {recruitment?.content && recruitment.content.length > 100 && (
                  <button
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                    className="mt-2 flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {isContentExpanded ? (
                      <>
                        <span>收起详情</span>
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span className="mt-2">展开详情</span>
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="mt-8 flex justify-center">
                <Button
                  color="cyan"
                  variant="filled"
                  size="large"
                  className="px-8 py-5 text-base font-bold"
                  onClick={() => setActiveTab("jobs")}
                >
                  查看招聘职位
                  <svg
                    className="ml-2 inline-block h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          )}

          {/* 招聘职位 Tab 内容 */}
          {activeTab === "jobs" && (
            <div>
              // 优化移动端的搜索区域
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="搜索职位、公司"
                  size={isMobile ? "middle" : "large"}
                  className="flex-1 shadow-md transition-shadow duration-300 hover:shadow-lg"
                  style={{
                    borderRadius: isMobile ? 16 : 24,
                    border: "1px solid #e5e5e5",
                  }}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  value={filters.jobName}
                  onChange={(e) =>
                    handleFilterChange("jobName", e.target.value)
                  }
                  onPressEnter={() =>
                    onSearch({
                      name: filters.jobName,
                      major: filters.major,
                      political_status: filters.political_status,
                      experience: filters.experience,
                      recruitment_target: filters.recruitment_target,
                      current: current,
                      pageSize: pageSize,
                    })
                  }
                />
                <Button
                  type="primary"
                  size={isMobile ? "middle" : "large"}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                  onClick={() =>
                    onSearch({
                      name: filters.jobName,
                      major: filters.major,
                      political_status: filters.political_status,
                      experience: filters.experience,
                      recruitment_target: filters.recruitment_target,
                      current: current,
                      pageSize: pageSize,
                    })
                  }
                >
                  搜索
                </Button>
              </div>
              // 优化移动端筛选器 // 替换原来的筛选器区域代码
              <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                {/* 排序下拉菜单 */}
                <div className="relative">
                  <button
                    className="flex items-center rounded-full bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200 sm:px-4 sm:py-2 sm:text-sm"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                  >
                    {sortBy === "default"
                      ? "默认排序"
                      : sortBy === "headcount_asc"
                        ? "招录人数↑"
                        : "招录人数↓"}
                    <svg
                      className={`ml-1 inline-block h-3 w-3 transition-transform sm:h-4 sm:w-4 ${showSortMenu ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showSortMenu && (
                    <div className="absolute left-0 z-10 mt-2 w-32 rounded-md border border-gray-200 bg-white shadow-lg sm:w-36">
                      <div className="py-1">
                        <button
                          className={`block w-full px-4 py-2 text-left text-xs sm:text-sm ${
                            sortBy === "default"
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setSortBy("default");
                            setShowSortMenu(false);
                          }}
                        >
                          默认排序
                        </button>
                        <button
                          className={`block w-full px-4 py-2 text-left text-xs sm:text-sm ${
                            sortBy === "headcount_asc"
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setSortBy("headcount_asc");
                            setShowSortMenu(false);
                          }}
                        >
                          招录人数↑
                        </button>
                        <button
                          className={`block w-full px-4 py-2 text-left text-xs sm:text-sm ${
                            sortBy === "headcount_desc"
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setSortBy("headcount_desc");
                            setShowSortMenu(false);
                          }}
                        >
                          招录人数↓
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 点击其他区域关闭菜单 */}
                  {showSortMenu && (
                    <div
                      className="fixed inset-0 z-0"
                      onClick={() => setShowSortMenu(false)}
                    />
                  )}
                </div>

                {/* 专业筛选 */}
                <Button
                  className="max-w-[100px] min-w-[60px] flex-1 shadow-sm sm:min-w-[80px]"
                  style={{
                    height: isMobile ? 32 : 36,
                    borderRadius: isMobile ? 16 : 18,
                    borderColor: "orange",
                  }}
                  size={isMobile ? "middle" : "middle"}
                  onClick={() => handleFilterChange("major", "1")}
                >
                  专业可报
                </Button>
                {/*<Cascader*/}
                {/*  className="min-w-[100px] flex-1 shadow-sm sm:min-w-[120px]"*/}
                {/*  style={{*/}
                {/*    height: isMobile ? 32 : 36,*/}
                {/*    borderRadius: isMobile ? 16 : 18,*/}
                {/*  }}*/}
                {/*  value={filters.major}*/}
                {/*  onChange={(value) => handleFilterChange("major", value)}*/}
                {/*  placeholder="专业"*/}
                {/*  options={majors}*/}
                {/*  fieldNames={{*/}
                {/*    label: "name",*/}
                {/*    value: "name",*/}
                {/*    children: "children",*/}
                {/*  }}*/}
                {/*  allowClear*/}
                {/*  showSearch*/}
                {/*  size={isMobile ? "middle" : "middle"}*/}
                {/*  placement={isMobile ? "bottomRight" : "bottomLeft"}*/}
                {/*/>*/}

                {/* 政治面貌筛选 */}
                <Select
                  className="min-w-[100px] flex-1 shadow-sm sm:min-w-[120px]"
                  style={{
                    height: isMobile ? 32 : 36,
                    borderRadius: isMobile ? 16 : 18,
                  }}
                  value={filters.political_status}
                  onChange={(value) =>
                    handleFilterChange("political_status", value)
                  }
                  placeholder="政治面貌"
                  allowClear
                  size={isMobile ? "middle" : "middle"}
                >
                  {politicalStatus.map((political_status) => (
                    <Select.Option
                      key={political_status.value}
                      value={political_status.value}
                    >
                      {political_status.label}
                    </Select.Option>
                  ))}
                </Select>

                {/* 是否应届筛选 */}
                <Select
                  className="min-w-[100px] flex-1 shadow-sm sm:min-w-[120px]"
                  style={{
                    height: isMobile ? 32 : 36,
                    borderRadius: isMobile ? 16 : 18,
                  }}
                  value={filters.recruitment_target}
                  onChange={(value) =>
                    handleFilterChange("recruitment_target", value)
                  }
                  placeholder="是否应届"
                  allowClear
                  size={isMobile ? "middle" : "middle"}
                >
                  {recruitmentTargets.map((recruitment_target) => (
                    <Select.Option
                      key={recruitment_target.value}
                      value={recruitment_target.value}
                    >
                      {recruitment_target.label}
                    </Select.Option>
                  ))}
                </Select>

                {/* 工作经验筛选 */}
                <Select
                  className="min-w-[100px] flex-1 shadow-sm sm:min-w-[120px]"
                  style={{
                    height: isMobile ? 32 : 36,
                    borderRadius: isMobile ? 16 : 18,
                  }}
                  value={filters.experience}
                  onChange={(value) => handleFilterChange("experience", value)}
                  placeholder="工作经验"
                  allowClear
                  size={isMobile ? "middle" : "middle"}
                >
                  {experienceLevels.map((experience) => (
                    <Select.Option
                      key={experience.value}
                      value={experience.value}
                    >
                      {experience.label}
                    </Select.Option>
                  ))}
                </Select>

                {/* 清除按钮 */}
                <Button
                  type="link"
                  className="self-center p-0 text-xs sm:text-sm"
                  onClick={() =>
                    setFilters({
                      jobName: "",
                      major: undefined,
                      political_status: undefined,
                      experience: undefined,
                      recruitment_target: undefined,
                    })
                  }
                >
                  清除
                </Button>
              </div>
              {/* 主要内容区域 */}
              <div className="mx-auto max-w-7xl px-4 py-6">
                <Row gutter={[16, 16]}>
                  {/* 左侧职位列表 */}
                  <Col
                    xs={24}
                    md={10}
                    className={isMobile && selectedJob ? "hidden" : ""}
                  >
                    <div
                      className="hide-scrollbar rounded-xl border border-gray-200 bg-white/80 p-3 shadow-inner backdrop-blur-sm"
                      style={{
                        height: isMobile ? "auto" : "calc(100vh - 200px)",
                        maxHeight: isMobile ? "none" : "calc(100vh - 200px)",
                        overflowY: isMobile ? "visible" : "auto",
                      }}
                    >
                      <List
                        loading={{
                          spinning: loading,
                          tip: "职位加载中...",
                        }}
                        dataSource={jobs}
                        renderItem={(job) => (
                          <Card
                            key={job.id}
                            hoverable
                            onClick={() => {
                              setSelectedJob(job);
                              if (isMobile) {
                                setTimeout(() => {
                                  const detailElement =
                                    document.getElementById("job-detail");
                                  if (detailElement) {
                                    detailElement.scrollIntoView({
                                      behavior: "smooth",
                                    });
                                  }
                                }, 100);
                              }
                            }}
                            className="mb-4 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-lg"
                            style={{
                              borderRadius: 16,
                              marginBottom: 12,
                              border:
                                selectedJob?.id === job.id
                                  ? "2px solid #4f46e5"
                                  : "1px solid #e5e7eb",
                              boxShadow:
                                selectedJob?.id === job.id
                                  ? "0 4px 12px rgba(79, 70, 229, 0.2)"
                                  : "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <div className="flex justify-between">
                              <div className="flex-1">
                                <div className="flex items-start">
                                  <Title
                                    level={isMobile ? 5 : 4}
                                    className="m-0 mr-2 text-gray-800 transition-colors hover:text-indigo-600"
                                    style={{
                                      fontSize: isMobile ? "15px" : "16px",
                                      lineHeight: isMobile ? "1.4" : "1.5",
                                    }}
                                  >
                                    {job.name}
                                  </Title>
                                  {job.is_urgent && (
                                    <Tag
                                      color="red"
                                      className="mt-1"
                                      style={{
                                        fontSize: isMobile ? "9px" : "10px",
                                        padding: isMobile ? "0 4px" : "0 5px",
                                        height: isMobile ? "18px" : "20px",
                                      }}
                                    >
                                      急聘
                                    </Tag>
                                  )}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                  <Tag
                                    bordered={false}
                                    className="border-indigo-200 bg-indigo-50 text-indigo-700"
                                    style={{
                                      fontSize: isMobile ? "9px" : "10px",
                                      padding: isMobile ? "0 4px" : "0 6px",
                                      height: isMobile ? "18px" : "20px",
                                    }}
                                  >
                                    {job.seniority}
                                  </Tag>
                                  <Tag
                                    bordered={false}
                                    className="border-purple-200 bg-purple-50 text-purple-700"
                                    style={{
                                      fontSize: isMobile ? "9px" : "10px",
                                      padding: isMobile ? "0 4px" : "0 6px",
                                      height: isMobile ? "18px" : "20px",
                                    }}
                                  >
                                    {job.education_requirement}
                                  </Tag>
                                  {job.recruitment !== "不限" && (
                                    <Tag
                                      bordered={false}
                                      className="border-green-200 bg-green-50 text-green-700"
                                      style={{
                                        fontSize: isMobile ? "9px" : "10px",
                                        padding: isMobile ? "0 4px" : "0 6px",
                                        height: isMobile ? "18px" : "20px",
                                      }}
                                    >
                                      {job.recruitment}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                              <div className="ml-2">
                                <Progress
                                  size={isMobile ? 36 : 44}
                                  type="dashboard"
                                  percent={93}
                                  strokeColor={conicColors}
                                  format={() => (
                                    <span className="text-xs font-bold text-gray-600">
                                      93%
                                    </span>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="mt-3 -mb-1 flex justify-between text-sm">
                              <div
                                className="flex items-center text-gray-600"
                                style={{
                                  fontSize: isMobile ? "10px" : "11px",
                                }}
                              >
                                <TeamOutlined className="mr-1" />
                                <span
                                  className="truncate"
                                  style={{ maxWidth: isMobile ? 70 : 100 }}
                                >
                                  {job.sponsor}
                                </span>
                              </div>
                              <div
                                className="flex items-center text-gray-600"
                                style={{
                                  fontSize: isMobile ? "10px" : "11px",
                                }}
                              >
                                <EnvironmentOutlined className="mr-1" />
                                <span>{job.city}</span>
                              </div>
                            </div>
                          </Card>
                        )}
                      />
                      // 在职位列表的 List 组件下方添加分页组件
                      <div className="mt-4 flex justify-center">
                        <div className="flex items-center space-x-2">
                          <button
                            className={`rounded-md px-3 py-1 text-sm font-medium ${
                              current === 1
                                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            } border border-gray-300 shadow-sm`}
                            onClick={handlePrevPage}
                            disabled={current === 1}
                          >
                            上一页
                          </button>

                          <span className="text-sm text-gray-600">
                            {current} / {totalPages}
                          </span>

                          <button
                            className={`rounded-md px-3 py-1 text-sm font-medium ${
                              current === totalPages
                                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            } border border-gray-300 shadow-sm`}
                            onClick={handleNextPage}
                            disabled={current === totalPages}
                          >
                            下一页
                          </button>
                        </div>
                      </div>
                    </div>
                  </Col>

                  {/* 右侧职位详情 */}
                  <Col
                    xs={24}
                    md={14}
                    id="job-detail"
                    className={isMobile && !selectedJob ? "hidden" : ""}
                  >
                    <div
                      className="hide-scrollbar rounded-xl border border-gray-200 bg-white/80 p-3 shadow-inner backdrop-blur-sm"
                      style={{
                        height: isMobile ? "auto" : "calc(100vh - 200px)",
                        maxHeight: isMobile ? "none" : "calc(100vh - 200px)",
                        overflowY: isMobile ? "visible" : "auto",
                      }}
                    >
                      {selectedJob ? (
                        <Card
                          className="rounded-xl border border-gray-200 shadow-md"
                          style={{
                            borderRadius: 12,
                            marginBottom: isMobile ? 60 : 0,
                          }}
                        >
                          {/* 移动端返回按钮 */}
                          {isMobile && (
                            <Button
                              type="link"
                              onClick={() => setSelectedJob(null)}
                              className="mb-4 p-0 text-indigo-600"
                              style={{ fontSize: "14px" }}
                            >
                              ← 返回职位列表
                            </Button>
                          )}

                          <div className="mb-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <Title
                                  level={isMobile ? 5 : 4}
                                  className="m-0 text-gray-800"
                                  style={{
                                    fontSize: isMobile ? "18px" : "20px",
                                  }}
                                >
                                  {selectedJob.name}
                                </Title>
                                <div className="mt-3 flex flex-wrap gap-4">
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-600">
                                      招聘人数:
                                    </span>
                                    <span className="ml-2 text-sm font-semibold text-blue-600">
                                      {selectedJob?.headcount}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-600">
                                      匹配度:
                                    </span>
                                    <span className="ml-2 text-sm font-semibold text-green-600">
                                      93%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  color="primary"
                                  variant="outlined"
                                  size={isMobile ? "small" : "middle"}
                                  icon={
                                    collectedJobs.includes(selectedJob.id) ? (
                                      <StarFilled
                                        style={{ color: "#f59e0b" }}
                                      />
                                    ) : (
                                      <StarOutlined
                                        style={{ color: "#6b7280" }}
                                      />
                                    )
                                  }
                                  className="flex items-center border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:text-indigo-800"
                                  onClick={() => handleCollect(selectedJob.id)}
                                >
                                  {isMobile ? "" : "感兴趣"}
                                </Button>
                                <Button
                                  color="primary"
                                  variant="filled"
                                  size={isMobile ? "small" : "middle"}
                                  icon={
                                    comparedJobs.includes(selectedJob.id) ? (
                                      <DeleteOutlined
                                        style={{ color: "#6b7280" }}
                                      />
                                    ) : (
                                      <PlusOutlined
                                        style={{ color: "#10b981" }}
                                      />
                                    )
                                  }
                                  className="flex items-center bg-indigo-600 hover:bg-indigo-700"
                                  onClick={() => handleCompare(selectedJob.id)}
                                >
                                  {isMobile
                                    ? ""
                                    : comparedJobs.includes(selectedJob.id)
                                      ? "取消对比"
                                      : "对比职位"}
                                </Button>
                                <Button
                                  size={isMobile ? "small" : "middle"}
                                  color="primary"
                                  variant="solid"
                                  icon={<ShareAltOutlined />}
                                  className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                  onClick={() => handleShare(selectedJob.id)}
                                >
                                  {isMobile ? "" : "分享"}
                                </Button>
                              </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                              <div className="flex items-center rounded-lg bg-blue-50 p-3">
                                <EnvironmentOutlined className="mr-3 text-lg text-blue-500" />
                                <div>
                                  <Text
                                    type="secondary"
                                    className="block text-xs"
                                  >
                                    工作地点
                                  </Text>
                                  <Text className="text-sm font-medium">
                                    {selectedJob.city}
                                  </Text>
                                </div>
                              </div>
                              <div className="flex items-center rounded-lg bg-purple-50 p-3">
                                <UserOutlined className="mr-3 text-lg text-purple-500" />
                                <div>
                                  <Text
                                    type="secondary"
                                    className="block text-xs"
                                  >
                                    经验要求
                                  </Text>
                                  <Text className="text-sm font-medium">
                                    {selectedJob.seniority}
                                  </Text>
                                </div>
                              </div>
                              <div className="flex items-center rounded-lg bg-green-50 p-3">
                                <ReadOutlined className="mr-3 text-lg text-green-500" />
                                <div>
                                  <Text
                                    type="secondary"
                                    className="block text-xs"
                                  >
                                    学历要求
                                  </Text>
                                  <Text className="text-sm font-medium">
                                    {selectedJob.education_requirement}
                                  </Text>
                                </div>
                              </div>
                              <div className="flex items-center rounded-lg bg-amber-50 p-3">
                                <ClockCircleOutlined className="mr-3 text-lg text-amber-500" />
                                <div>
                                  <Text
                                    type="secondary"
                                    className="block text-xs"
                                  >
                                    发布时间
                                  </Text>
                                  <Text className="text-sm font-medium">
                                    {selectedJob.publish_time}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Divider className="my-6" />

                          <div className="mb-6">
                            <Title level={5} className="mb-4 text-gray-800">
                              职位描述
                            </Title>
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  岗位类别:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.category}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  岗位编号:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.No}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  主管单位:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.sponsor}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  用人单位:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.employer}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  岗位职责:
                                </Text>
                                <Text
                                  type="secondary"
                                  className="flex-1 text-sm"
                                >
                                  {selectedJob.duty}
                                </Text>
                              </div>
                            </div>
                          </div>

                          <Divider className="my-6" />

                          <div className="mb-6">
                            <Title level={5} className="mb-4 text-gray-800">
                              任职要求
                            </Title>
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  学位:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.degree_requirement}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  学历:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.education_requirement}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  经验:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.seniority}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  专业:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.major_requirement}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  是否应届:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.recruitment}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  政治面貌:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.political_status}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-30 flex-shrink-0 text-sm text-gray-600">
                                  最低合格分数线:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.qualified_score}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  户籍要求:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.residency_requirement}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  年龄上限:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.age_limit}
                                </Text>
                              </div>
                            </div>
                          </div>

                          <Divider className="my-6" />

                          <div className="mb-6">
                            <Title level={5} className="mb-4 text-gray-800">
                              其他信息
                            </Title>
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  面试比例:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.interview_ratio}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  成绩比例:
                                </Text>
                                <Text type="secondary" className="text-sm">
                                  {selectedJob.score_ratio}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  其他要求:
                                </Text>
                                <Text
                                  type="secondary"
                                  className="flex-1 text-sm"
                                >
                                  {selectedJob.other_requirement || "无"}
                                </Text>
                              </div>
                              <div className="flex flex-col sm:flex-row">
                                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                                  注意事项:
                                </Text>
                                <Text
                                  type="secondary"
                                  className="flex-1 text-sm"
                                >
                                  {selectedJob.notes || "无"}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ) : (
                        <Card
                          className="rounded-xl border border-gray-200 py-12 text-center"
                          style={{ borderRadius: 12 }}
                        >
                          <Text type="secondary" className="text-lg">
                            请选择一个职位查看详细信息
                          </Text>
                        </Card>
                      )}
                    </div>
                  </Col>
                </Row>
              </div>
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
                        登录后才能收藏、添加对比、分享职位哦！
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
              <BackTop />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
