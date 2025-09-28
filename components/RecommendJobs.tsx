// RecommendJobs.tsx
import jobService from "@/api/jobService";
import type { Job } from "@/entity";
import { getUserInfoSync } from "@/store/userStore";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ReadOutlined,
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
  List,
  Progress,
  Row,
  Select,
  Tag,
  Typography,
  message, Tabs,
} from "antd";
import type { ProgressProps } from "antd";
import React, { useCallback, useEffect, useState } from "react";

const { Text, Title } = Typography;

export default function RecommendJobsPage({
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [collectedJobs, setCollectedJobs] = useState<number[]>([]);
  const [comparedJobs, setComparedJobs] = useState<number[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const { uuid, open_id } = getUserInfoSync();
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({ year: "2025" });
  const years = [
    { value: "2025", label: "2025年" },
    { value: "2024", label: "2024年" },
    { value: "2023", label: "2023年" },
  ];
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const recommendReason ="分别在您的专业、所在省市、学历程度、竞聘趋势几个维度分析出匹配度最高的职位"

  const onSearch = useCallback(
    async () => {
      setLoading(true);
      try {
        // 调用推荐接口获取推荐职位
        const res = await jobService.getRecommendJobs(uuid);
        setJobs(res.data);
        // 默认选中第一个职位
        if (res.data.length > 0) {
          setSelectedJob(res.data[0]);
        }
      } catch (error) {
        console.error("获取推荐职位失败:", error);
        messageApi.error("获取推荐职位失败");
      } finally {
        setLoading(false);
      }
    },
    [uuid],
  );

  const handleCollect = async (jobId: number) => {
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true);
      return;
    }
    try {
      const isCollected = collectedJobs.includes(jobId);

      if (isCollected) {
        const res = await jobService.unCollectJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          messageApi.success("取消收藏成功");
          setCollectedJobs((prev) => prev.filter((id) => id !== jobId));
        } else {
          messageApi.error("取消收藏失败");
        }
      } else {
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

  const getUserJobStatus = async () => {
    try {
      const collectRes = await jobService.getCollectJobs(uuid);
      if (collectRes.code === 0) {
        const collectedIds = collectRes.data.map((job) => job.id);
        setCollectedJobs(collectedIds);
      }

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
      setShowLoginDialog(true);
      return;
    }
    const url = `${window.location.origin}/job-detail?id=${jobId}`;
    await navigator.clipboard.writeText(url);
    messageApi.success("链接已复制到剪贴板");
  };

  const handleCompare = async (jobId: number) => {
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true);
      return;
    }
    try {
      const isCompared = comparedJobs.includes(jobId);

      if (isCompared) {
        const res = await jobService.unCompareJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          messageApi.success("已从对比列表中移除");
          setComparedJobs((prev) => prev.filter((id) => id !== jobId));
        } else {
          messageApi.error("移除失败");
        }
      } else {
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
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTabChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      year: value,
    }));
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
    onSearch();
    if (uuid) {
      getUserJobStatus();
    }
  }, [filters, onSearch, uuid]);

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-12">
      {contextHolder}
      <div className="mx-auto max-w-6xl rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-800">智能推荐职位</h1>
          <p className="mt-2 text-gray-600">
            根据您的个人信息和偏好为您精心推荐
          </p>
        </div>

        {/* 推荐理由卡片 */}
        <div className="mb-6 rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
          <div className="flex items-start">
            <div className="mr-3 flex-shrink-0">
              <div className="rounded-full bg-indigo-100 p-2">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-800">为您推荐的原因</h3>
              <p className="mt-1 text-gray-700">{recommendReason}</p>
            </div>
          </div>
        </div>

        {/* 年份筛选和搜索 */}
        <div className="mb-6">
          <Tabs
            activeKey={filters.year}
            onChange={handleTabChange}
            items={years.map((year) => ({
              key: year.value,
              label: year.label,
            }))}
            className="mb-4"
            tabBarStyle={{
              marginBottom: 0,
              border: "none",
            }}
          />
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
                                <StarOutlined style={{ color: "#6b7280" }} />
                              ) : (
                                <StarFilled style={{ color: "#f59e0b" }} />
                              )
                            }
                            className="flex items-center border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:text-indigo-800"
                            onClick={() => handleCollect(selectedJob.id)}
                          >
                            {isMobile
                              ? ""
                              : collectedJobs.includes(selectedJob.id)
                                ? "不感兴趣"
                                : "感兴趣"}
                          </Button>
                          <Button
                            color="primary"
                            variant="filled"
                            size={isMobile ? "small" : "middle"}
                            icon={
                              comparedJobs.includes(selectedJob.id) ? (
                                <DeleteOutlined style={{ color: "#6b7280" }} />
                              ) : (
                                <PlusOutlined style={{ color: "#10b981" }} />
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
                            <Text type="secondary" className="block text-xs">
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
                            <Text type="secondary" className="block text-xs">
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
                            <Text type="secondary" className="block text-xs">
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
                            <Text type="secondary" className="block text-xs">
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
                          <Text type="secondary" className="flex-1 text-sm">
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
                          <Text type="secondary" className="flex-1 text-sm">
                            {selectedJob.other_requirement || "无"}
                          </Text>
                        </div>
                        <div className="flex flex-col sm:flex-row">
                          <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                            注意事项:
                          </Text>
                          <Text type="secondary" className="flex-1 text-sm">
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
            <div
              className="bg-opacity-50 absolute inset-0"
              onClick={() => setShowLoginDialog(false)}
            ></div>
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
    </div>
  );
}
