// Job.tsx (移动端样式优化部分)
import jobService from "@/api/jobService";
import userService from "@/api/userService";
import type { Job, JobFilter } from "@/entity";
import {
  getUserInfoSync,
  isUserLoggedIn,
  useUserActions,
} from "@/store/userStore";
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
import { useCallback, useEffect, useState } from "react";

const { Text, Title } = Typography;
const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#87d068",
  "25%": "#ffc069",
  "50%": "#ffe58f",
  "75%": "#ffe7ba",
  "100%": "#ffccc7",
};

export default function JobPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const { setUserInfo } = useUserActions();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({
    cityCode: "SH",
    jobName: "",
    category: undefined,
    experience: undefined,
    educationLevel: undefined,
  });
  const [isMobile, setIsMobile] = useState(false);
  const { uuid, open_id } = getUserInfoSync();
  const [collectedJobs, setCollectedJobs] = useState<number[]>([]);
  const [comparedJobs, setComparedJobs] = useState<number[]>([]);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);

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

  const generateUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  };

  const handleRecommendJobs = async () => {
    if (!open_id) {
      messageApi.warning("请先完成登录");
      setShowLoginDialog(true);
      return;
    }

    setIsRecommending(true);
    try {
      // 调用推荐接口（这里假设有一个推荐接口）
      // 如果没有专门的推荐接口，可以使用默认筛选条件
      const res = await jobService.getJobs({
        city_code: filters.cityCode,
        name: filters.jobName,
        category: filters.category,
        experience: filters.experience,
        education_level: filters.educationLevel,
      });

      if (res.data.length > 0) {
        setJobs(res.data);
        setSelectedJob(res.data[0]); // 选择第一个推荐职位
        messageApi.success("已为您推荐相关职位");
      } else {
        messageApi.info("暂无推荐职位");
      }
    } catch (error) {
      messageApi.error("推荐失败，请稍后重试");
      console.error("推荐职位失败:", error);
    } finally {
      setIsRecommending(false);
    }
  };

  const checkLogin = async () => {
    const isLogin = isUserLoggedIn();
    console.log("isLogin", isLogin);
    if (!isLogin) {
      const uuid = generateUuid();
      setUserInfo({ uuid: uuid, status: "guest" });
      await userService.createUuid({ status: "guest", uuid });
    } else {
      await getUserInfo();
    }
  };

  const getUserInfo = async () => {
    const { uuid, source } = getUserInfoSync();
    const info = await userService.getUuidInfo(uuid, source);
    if (info.code == 0) {
      setUserInfo(info.data);
    }
  };

  const onSearch = useCallback(async (params: JobFilter) => {
    setLoading(true);
    try {
      const res = await jobService.getJobs(params);
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
  }, []);

  useEffect(() => {
    checkLogin();
    onSearch({
      city_code: filters.cityCode,
      name: filters.jobName,
      category: filters.category,
      experience: filters.experience,
      education_level: filters.educationLevel,
    });
    if (uuid) {
      getUserJobStatus();
    }
  }, [filters, onSearch, uuid]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
    const url = `${window.location.origin}/job-detail?id=${jobId}`;
    // 使用 Clipboard API 复制链接到剪贴板
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

  const cities = [
    { value: "SH", label: "上海" },
    { value: "BJ", label: "北京" },
    { value: "GZ", label: "广州" },
    { value: "SZ", label: "深圳" },
    { value: "HZ", label: "杭州" },
    { value: "NJ", label: "南京" },
    { value: "WH", label: "武汉" },
    { value: "CD", label: "成都" },
  ];

  const categories = [
    { value: "专技岗位", label: "专技岗位" },
    { value: "管理岗位", label: "管理岗位" },
  ];

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {contextHolder}
      {/* 顶部搜索区域 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 flex justify-center">
            <Input
              placeholder="搜索职位、公司"
              size="large"
              className="shadow-md transition-shadow duration-300 hover:shadow-lg"
              style={{
                width: isMobile ? "100%" : 600,
                borderRadius: 24,
                border: "1px solid #e5e5e5",
              }}
              prefix={<SearchOutlined className="text-gray-400" />}
              value={filters.jobName}
              onChange={(e) => handleFilterChange("jobName", e.target.value)}
              onPressEnter={() =>
                onSearch({
                  city_code: filters.cityCode,
                  name: filters.jobName,
                  category: filters.category,
                  experience: filters.experience,
                  education_level: filters.educationLevel,
                })
              }
            />
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap justify-center gap-2">
            <Select
              className="shadow-sm"
              style={{
                width: isMobile ? 100 : 120,
                height: 40,
                borderRadius: 20,
              }}
              value={filters.cityCode}
              onChange={(value) => handleFilterChange("cityCode", value)}
              placeholder="城市"
              size="middle"
            >
              {cities.map((city) => (
                <Select.Option key={city.value} value={city.value}>
                  {city.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              className="shadow-sm"
              style={{
                width: isMobile ? 120 : 150,
                height: 40,
                borderRadius: 20,
              }}
              value={filters.category}
              onChange={(value) => handleFilterChange("category", value)}
              placeholder="职位类别"
              allowClear
              size="middle"
            >
              {categories.map((category) => (
                <Select.Option key={category.value} value={category.value}>
                  {category.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              className="shadow-sm"
              style={{
                width: isMobile ? 120 : 150,
                height: 40,
                borderRadius: 20,
              }}
              value={filters.experience}
              onChange={(value) => handleFilterChange("experience", value)}
              placeholder="工作经验"
              allowClear
              size="middle"
            >
              <Select.Option value="应届">应届毕业生</Select.Option>
              <Select.Option value="1年">1年以内</Select.Option>
              <Select.Option value="1-3年">1-3年</Select.Option>
              <Select.Option value="3-5年">3-5年</Select.Option>
              <Select.Option value="5-10年">5-10年</Select.Option>
              <Select.Option value="10年以上">10年以上</Select.Option>
            </Select>

            <Button
              type="primary"
              loading={isRecommending}
              className="flex items-center shadow-md"
              style={{
                height: isMobile ? 30 : 40,
                borderRadius: 20,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
              onClick={handleRecommendJobs}
            >
              <StarOutlined />
              <span
                className="ml-2"
                style={{ fontSize: isMobile ? "12px" : "14px" }}
              >
                一键推荐
              </span>
            </Button>

            <Button
              type="link"
              className="self-center p-0"
              onClick={() =>
                setFilters({
                  cityCode: "SH",
                  jobName: "",
                  category: undefined,
                  experience: undefined,
                  educationLevel: undefined,
                })
              }
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              清除
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="mx-auto max-w-7xl px-4 py-6" style={{ maxWidth: 1600 }}>
        <Row gutter={isMobile ? 12 : 24}>
          {/* 左侧职位列表 */}
          <Col
            span={isMobile ? 24 : 10}
            className={isMobile && selectedJob ? "hidden" : ""}
          >
            <div
              className="hide-scrollbar rounded-xl bg-white/50 p-2 shadow-inner backdrop-blur-sm"
              style={{
                height: isMobile ? "auto" : "calc(100vh - 180px)",
                maxHeight: isMobile ? "none" : "calc(100vh - 180px)",
                overflowY: isMobile ? "visible" : "auto",
                paddingRight: 10,
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
                height: isMobile ? "auto" : "calc(100vh - 180px)",
                maxHeight: isMobile ? "none" : "calc(100vh - 180px)",
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
                  {/* 移动端返回按钮 */}
                  {isMobile && (
                    <Button
                      type="link"
                      onClick={() => setSelectedJob(null)}
                      className="mb-4 p-0"
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
                          icon={
                            collectedJobs.includes(selectedJob.id) ? (
                              <StarOutlined style={{ color: "gray" }} />
                            ) : (
                              <StarFilled style={{ color: "orange" }} />
                            )
                          }
                          className="flex items-center"
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
                              : "对比职位"}
                        </Button>
                        <Button
                          size={isMobile ? "small" : "middle"}
                          color="primary"
                          variant="solid"
                          icon={<ShareAltOutlined />}
                          className="flex items-center"
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

              <h3 className="mb-3 text-2xl font-bold text-gray-800">请登录</h3>
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
    </div>
  );
}
