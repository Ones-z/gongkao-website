// JobDetail.tsx
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
  Button,
  Card,
  Divider,
  Progress,
  Tag,
  Typography,
  message,
} from "antd";
import type { ProgressProps } from "antd";
import React, { useEffect, useState } from "react";

const { Title, Text } = Typography;

const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#87d068",
  "25%": "#ffc069",
  "50%": "#ffe58f",
  "75%": "#ffe7ba",
  "100%": "#ffccc7",
};

export default function JobDetailPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [messageApi, contextHolder] = message.useMessage();
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return { id: params.get("id") };
  };
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [collectedJobs, setCollectedJobs] = useState<number[]>([]);
  const [comparedJobs, setComparedJobs] = useState<number[]>([]);
  const { uuid } = getUserInfoSync();

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
    const { id } = getQueryParams();
    if (id) {
      fetchJobDetail(id);
    }
    if (uuid) {
      getUserJobStatus();
    }
  }, []);

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

  const fetchJobDetail = async (jobId: string) => {
    try {
      setLoading(true);
      const response = await jobService.getJobDetail(jobId);
      if (response.code === 0) {
        setJob(response.data);
      } else {
        setError("获取职位详情失败");
      }
    } catch (err) {
      setError("获取职位详情时发生错误");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (jobId: number) => {
    if (!uuid) {
      console.error("用户未登录");
      return;
    }

    try {
      // 检查是否已收藏
      const isCollected = collectedJobs.includes(jobId);

      if (isCollected) {
        // 取消收藏
        const res = await jobService.unCollectJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          setCollectedJobs((prev) => prev.filter((id) => id !== jobId));
        }
        messageApi.success("取消收藏成功");
      } else {
        // 添加收藏
        const res = await jobService.collectJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          setCollectedJobs((prev) => [...prev, jobId]);
        }
        messageApi.success("收藏成功");
      }
    } catch (error) {
      console.error("收藏操作失败:", error);
    }
  };

  const handleCompare = async (jobId: number) => {
    if (!uuid) {
      console.error("用户未登录");
      return;
    }

    try {
      // 检查是否已在对比列表中
      const isCompared = comparedJobs.includes(jobId);

      if (isCompared) {
        // 从对比列表中移除
        const res = await jobService.unCompareJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          setComparedJobs((prev) => prev.filter((id) => id !== jobId));
        }
        messageApi.success("已从对比列表中移除");
      } else {
        // 添加到对比列表
        const res = await jobService.compareJob({ uuid, job_id: jobId });
        if (res.code === 0) {
          setComparedJobs((prev) => [...prev, jobId]);
        }
        messageApi.success("已添加到对比列表");
      }
    } catch (error) {
      console.error("对比操作失败:", error);
    }
  };

  const handleShare = async (jobId: number) => {
    const url = `${window.location.origin}/job-detail?id=${jobId}`;
    // 使用 Clipboard API 复制链接到剪贴板
    await navigator.clipboard.writeText(url);
    messageApi.success("链接已复制到剪贴板");
  };

  if (loading) {
    return (
      <div className="job-detail-container py-12 text-center">加载中...</div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-container py-12 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-container py-12 text-center">
        未找到职位信息
      </div>
    );
  }

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      {contextHolder}
      <div className="mx-auto max-w-4xl px-4">
        <Card
          className="rounded-xl border border-gray-200 shadow-md"
          style={{ borderRadius: 12 }}
        >
          <div className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Title
                  level={isMobile ? 4 : 3}
                  className="m-0 text-gray-800"
                  style={{ fontSize: isMobile ? "20px" : "24px" }}
                >
                  {job.name}
                </Title>
                <div className="mt-3 flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">招聘人数:</span>
                    <span className="ml-2 text-sm font-semibold text-blue-600">
                      {job.headcount}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">匹配度:</span>
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
                    collectedJobs.includes(job.id) ? (
                      <StarFilled style={{ color: "orange" }} />
                    ) : (
                      <StarOutlined style={{ color: "gray" }} />
                    )
                  }
                  className="flex items-center"
                  onClick={() => handleCollect(job.id)}
                >
                  {isMobile ? "" : "感兴趣"}
                </Button>
                <Button
                  color="primary"
                  variant="filled"
                  size={isMobile ? "small" : "middle"}
                  icon={
                    comparedJobs.includes(job.id) ? (
                      <DeleteOutlined style={{ color: "gray" }} />
                    ) : (
                      <PlusOutlined style={{ color: "green" }} />
                    )
                  }
                  className="flex items-center"
                  onClick={() => handleCompare(job.id)}
                >
                  {isMobile
                    ? ""
                    : comparedJobs.includes(job.id)
                      ? "取消对比"
                      : "对比职位"}
                </Button>
                <Button
                  size={isMobile ? "small" : "middle"}
                  color="primary"
                  variant="solid"
                  icon={<ShareAltOutlined />}
                  className="flex items-center"
                  onClick={() => handleShare(job.id)}
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
                  <Text className="text-sm font-medium">{job.city}</Text>
                </div>
              </div>
              <div className="flex items-center rounded-lg bg-purple-50 p-3">
                <UserOutlined className="mr-3 text-lg text-purple-500" />
                <div>
                  <Text type="secondary" className="block text-xs">
                    经验要求
                  </Text>
                  <Text className="text-sm font-medium">{job.seniority}</Text>
                </div>
              </div>
              <div className="flex items-center rounded-lg bg-green-50 p-3">
                <ReadOutlined className="mr-3 text-lg text-green-500" />
                <div>
                  <Text type="secondary" className="block text-xs">
                    学历要求
                  </Text>
                  <Text className="text-sm font-medium">
                    {job.education_requirement}
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
                    {job.publish_time}
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
                  {job.category}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  岗位编号:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.No}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  主管单位:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.sponsor}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  用人单位:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.employer}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  岗位职责:
                </Text>
                <Text type="secondary" className="flex-1 text-sm">
                  {job.duty}
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
                  {job.degree_requirement}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  学历:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.education_requirement}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  经验:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.seniority}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  专业:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.major_requirement}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  是否应届:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.recruitment}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  政治面貌:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.political_status}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-30 flex-shrink-0 text-sm text-gray-600">
                  最低合格分数线:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.qualified_score}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  户籍要求:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.residency_requirement}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  年龄上限:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.age_limit}
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
                  {job.interview_ratio}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  成绩比例:
                </Text>
                <Text type="secondary" className="text-sm">
                  {job.score_ratio}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  其他要求:
                </Text>
                <Text type="secondary" className="flex-1 text-sm">
                  {job.other_requirement || "无"}
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Text className="w-24 flex-shrink-0 text-sm text-gray-600">
                  注意事项:
                </Text>
                <Text type="secondary" className="flex-1 text-sm">
                  {job.notes || "无"}
                </Text>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
