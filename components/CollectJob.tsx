// components/CollectJob.tsx
import jobService from "@/api/jobService";
import type { Job } from "@/entity";
import { getUserInfoSync } from "@/store/userStore";
import {
  ClockCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ReadOutlined,
  StarFilled, StarOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import {
  Button,
  Card,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Tag,
  Typography,
  message,
} from "antd";
import type { ProgressProps } from "antd";
import { useEffect, useState } from "react";

const { Text, Title } = Typography;
const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#87d068",
  "25%": "#ffc069",
  "50%": "#ffe58f",
  "75%": "#ffe7ba",
  "100%": "#ffccc7",
};

export default function CollectJobPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { uuid } = getUserInfoSync();
  const [comparedJobs, setComparedJobs] = useState<number[]>([]); // 添加对比职位状态

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

  // 获取收藏的职位
  const fetchCollectJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getCollectJobs(uuid);
      if (res.code === 0) {
        setJobs(res.data);
        // 默认选中第一个职位
        if (res.data.length > 0) {
          setSelectedJob(res.data[0]);
        } else {
          setSelectedJob(null);
        }
      } else {
        message.error("获取收藏职位失败");
      }
    } catch (error) {
      message.error("获取收藏职位出错");
    } finally {
      setLoading(false);
    }
  };

  // 添加获取对比职位的函数
  const getUserComparedJobs = async () => {
    try {
      const res = await jobService.getCompareJobs(uuid);
      if (res.code === 0) {
        const comparedIds = res.data.map((job: Job) => job.id);
        setComparedJobs(comparedIds);
      }
    } catch (error) {
      console.error("获取对比职位失败:", error);
    }
  };

  useEffect(() => {
    fetchCollectJobs();
    getUserComparedJobs(); // 获取用户已对比的职位
  }, [uuid]);

  // 取消收藏职位
  const handleUnCollect = async (jobId: number) => {
    try {
      const res = await jobService.unCollectJob({ uuid, job_id: jobId });
      if (res.code === 0) {
        message.success("取消收藏成功");
        // 从列表中移除该职位
        const updatedJobs = jobs.filter((job) => job.id !== jobId);
        setJobs(updatedJobs);

        // 如果取消收藏的是当前选中的职位，则选择下一个或清空选择
        if (selectedJob?.id === jobId) {
          if (updatedJobs.length > 0) {
            setSelectedJob(updatedJobs[0]);
          } else {
            setSelectedJob(null);
          }
        }
      } else {
        message.error("取消收藏失败");
      }
    } catch (error) {
      message.error("取消收藏出错");
    }
  };

  // 处理对比功能
  const handleCompare = async (jobId: number) => {
    try {
      // 检查是否已在对比列表中
      const isCompared = comparedJobs.includes(jobId);

      if (isCompared) {
        // 从对比列表中移除
        const res = await jobService.unCompareJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          message.success("已从对比列表中移除");
          setComparedJobs((prev) => prev.filter((id) => id !== jobId));
        } else {
          message.error("移除失败");
        }
      } else {
        // 添加到对比列表
        const res = await jobService.compareJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          message.success("已添加到对比列表");
          setComparedJobs((prev) => [...prev, jobId]);
        } else {
          message.error("添加失败");
        }
      }
    } catch (error) {
      message.error("操作失败");
    }
  };

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部标题区域 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-center">
            <Title level={2} className="mb-2 text-gray-800">
              收藏的职位
            </Title>
            <Text className="text-gray-600">
              管理您收藏的职位，随时查看详细信息
            </Text>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="mx-auto max-w-7xl px-4 py-6" style={{ maxWidth: 1600 }}>
        {jobs.length === 0 ? (
          // 空状态
          <div className="py-20 text-center">
            <div className="mb-6">
              <StarFilled className="text-6xl text-gray-300" />
            </div>
            <Title level={4} className="mb-4 text-gray-500">
              暂无收藏职位
            </Title>
            <Text className="mb-6 block text-gray-400">
              您还没有收藏任何职位，快去职位页面看看吧
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={() => (window.location.replace("/exam-announcements"))}
            >
              浏览职位
            </Button>
          </div>
        ) : (
          <Row gutter={isMobile ? 12 : 24}>
            {/* 左侧职位列表 */}
            <Col
              span={isMobile ? 24 : 10}
              className={isMobile && selectedJob ? "hidden" : ""}
            >
              <div
                className="hide-scrollbar rounded-xl bg-white/50 p-2 shadow-inner backdrop-blur-sm"
                style={{
                  height: isMobile ? "auto" : "calc(100vh - 220px)",
                  maxHeight: isMobile ? "none" : "calc(100vh - 220px)",
                  overflowY: isMobile ? "visible" : "auto",
                  paddingRight: 10,
                }}
              >
                <List
                  loading={{
                    spinning: loading,
                    tip: "收藏职位加载中...",
                  }}
                  dataSource={jobs}
                  renderItem={(job) => (
                    <Card
                      key={job.id}
                      hoverable
                      onClick={() => {
                        setSelectedJob(job);
                        // 移动端点击后滚动到详情区域
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
                        borderRadius: 20,
                        marginBottom: 12,
                        border:
                          selectedJob?.id === job.id
                            ? "1px solid #3b82f6"
                            : "1px solid #e5e7eb",
                        boxShadow:
                          selectedJob?.id === job.id
                            ? "0 4px 12px rgba(59, 130, 246, 0.15)"
                            : "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-start">
                            <Title
                              level={5}
                              className="m-0 mr-3 text-gray-800 transition-colors hover:text-blue-600"
                              style={{
                                fontSize: isMobile ? "14px" : "16px",
                                lineHeight: isMobile ? "1.4" : "1.5",
                              }}
                            >
                              {job.name}
                            </Title>
                            {job.is_urgent && (
                              <Tag
                                color="red"
                                className="mt-1"
                                style={{ fontSize: isMobile ? "10px" : "12px" }}
                              >
                                急聘
                              </Tag>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Tag
                              bordered={false}
                              className="border-blue-200 bg-blue-50 text-blue-700"
                              style={{
                                fontSize: isMobile ? "10px" : "12px",
                                padding: isMobile ? "0 4px" : "0 7px",
                              }}
                            >
                              {job.seniority}
                            </Tag>
                            <Tag
                              bordered={false}
                              className="border-purple-200 bg-purple-50 text-purple-700"
                              style={{
                                fontSize: isMobile ? "10px" : "12px",
                                padding: isMobile ? "0 4px" : "0 7px",
                              }}
                            >
                              {job.education_requirement}
                            </Tag>
                            {job.recruitment !== "不限" && (
                              <Tag
                                bordered={false}
                                className="border-green-200 bg-green-50 text-green-700"
                                style={{
                                  fontSize: isMobile ? "10px" : "12px",
                                  padding: isMobile ? "0 4px" : "0 7px",
                                }}
                              >
                                {job.recruitment}
                              </Tag>
                            )}
                            {job.political_status !== "不限" && (
                              <Tag
                                bordered={false}
                                className="border-yellow-200 bg-yellow-50 text-yellow-700"
                                style={{
                                  fontSize: isMobile ? "10px" : "12px",
                                  padding: isMobile ? "0 4px" : "0 7px",
                                }}
                              >
                                {job.political_status}
                              </Tag>
                            )}
                            {job.major_requirement !== "不限" && (
                              <Tag
                                bordered={false}
                                className="border-pink-200 bg-pink-50 text-pink-700"
                                style={{
                                  fontSize: isMobile ? "10px" : "12px",
                                  padding: isMobile ? "0 4px" : "0 7px",
                                }}
                              >
                                {job.major_requirement.split("，")[0] ?? ""}
                              </Tag>
                            )}
                          </div>
                        </div>
                        <div className="ml-2">
                          <Progress
                            size={isMobile ? "small" : "small"}
                            type="dashboard"
                            percent={93}
                            strokeColor={conicColors}
                            width={isMobile ? 40 : 50}
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
                          style={{ fontSize: isMobile ? "11px" : "12px" }}
                        >
                          <TeamOutlined className="mr-1" />
                          <span
                            className="truncate"
                            style={{ maxWidth: isMobile ? 80 : 120 }}
                          >
                            {job.sponsor}
                          </span>
                        </div>
                        <div
                          className="flex items-center text-gray-600"
                          style={{ fontSize: isMobile ? "11px" : "12px" }}
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
              span={isMobile ? 24 : 14}
              id="job-detail"
              className={isMobile && !selectedJob ? "hidden" : ""}
            >
              <div
                className="hide-scrollbar rounded-xl bg-white/50 p-2 shadow-inner backdrop-blur-sm"
                style={{
                  height: isMobile ? "auto" : "calc(100vh - 220px)",
                  maxHeight: isMobile ? "none" : "calc(100vh - 220px)",
                  overflowY: isMobile ? "visible" : "auto",
                  paddingLeft: isMobile ? 0 : 10,
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
                    <div className="mb-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <Title
                            level={isMobile ? 5 : 4}
                            className="m-0 text-gray-800"
                            style={{ fontSize: isMobile ? "18px" : "20px" }}
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
                            icon={<StarFilled style={{ color:'orange' }} />}
                            className="flex items-center border-red-500 text-red-500 hover:border-red-700 hover:text-red-700"
                            onClick={() => handleUnCollect(selectedJob.id)}
                          >
                            {isMobile ? "" : "感兴趣"}
                          </Button>
                          <Button
                            color="primary"
                            variant="filled"
                            size={isMobile ? "small" : "middle"}
                            icon={
                              comparedJobs.includes(selectedJob.id) ? (
                                <DeleteOutlined style={{ color: "gray" }} />
                              ) : (
                                <PlusOutlined style={{ color: "green" }} />
                              )
                            }
                            className="flex items-center"
                            onClick={() => handleCompare(selectedJob.id)}
                          >
                            {isMobile
                              ? ""
                              : comparedJobs.includes(selectedJob.id)
                                ? "取消对比"
                                : "添加对比"}
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
        )}
      </div>
    </div>
  );
}
