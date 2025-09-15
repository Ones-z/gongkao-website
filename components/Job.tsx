// Job.tsx
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
  DollarOutlined,
  EnvironmentOutlined,
  PlusOutlined, ReadOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarOutlined,
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
  Input,
  List,
  Progress,
  Row,
  Select,
  Space,
  Tag,
  Typography,
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
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const { setUserInfo } = useUserActions();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState({
    cityCode: "SH",
    jobName: "",
    category: "",
    experience: "",
    educationLevel: "",
  });

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

  const onSearch = useCallback(
    async (params: JobFilter) => {
      setLoading(true);
      try {
        const res = await jobService.getJobs(params);
        setJobs(res.data);
        // 默认选中第一个职位
        if (res.data.length > 0 ) {
          setSelectedJob(res.data[0]);
        }
      } catch (error) {
        console.error("获取职位列表失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    checkLogin();
    onSearch({
      city_code: filters.cityCode,
      name: filters.jobName,
      category: filters.category,
      experience: filters.experience,
      education: filters.educationLevel,
    });
  }, [filters, onSearch]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
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
    { value: "技术", label: "技术" },
    { value: "产品", label: "产品" },
    { value: "设计", label: "设计" },
    { value: "运营", label: "运营" },
    { value: "市场", label: "市场" },
    { value: "人事", label: "人事" },
    { value: "财务", label: "财务" },
    { value: "行政", label: "行政" },
  ];

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部搜索区域 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 flex justify-center">
            <Input
              placeholder="搜索职位、公司"
              size="large"
              className="shadow-md transition-shadow duration-300 hover:shadow-lg"
              style={{
                width: 600,
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
                  education: filters.educationLevel,
                })
              }
            />
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap justify-center gap-3">
            <Select
              className="shadow-sm"
              style={{ width: 120, height: 40, borderRadius: 20 }}
              value={filters.cityCode}
              onChange={(value) => handleFilterChange("cityCode", value)}
              prefix={<EnvironmentOutlined />}
              placeholder="城市"
            >
              {cities.map((city) => (
                <Select.Option key={city.value} value={city.value}>
                  {city.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              className="shadow-sm"
              style={{ width: 150, height: 40, borderRadius: 20 }}
              value={filters.category}
              onChange={(value) => handleFilterChange("category", value)}
              placeholder="职位类别"
              allowClear
            >
              {categories.map((category) => (
                <Select.Option key={category.value} value={category.value}>
                  {category.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              className="shadow-sm"
              style={{ width: 150, height: 40, borderRadius: 20 }}
              value={filters.experience}
              onChange={(value) => handleFilterChange("experience", value)}
              placeholder="工作经验"
              allowClear
            >
              <Select.Option value="应届">应届毕业生</Select.Option>
              <Select.Option value="1年">1年以内</Select.Option>
              <Select.Option value="1-3年">1-3年</Select.Option>
              <Select.Option value="3-5年">3-5年</Select.Option>
              <Select.Option value="5-10年">5-10年</Select.Option>
              <Select.Option value="10年以上">10年以上</Select.Option>
            </Select>

            <Select
              className="shadow-sm"
              style={{ width: 150, height: 40, borderRadius: 20 }}
              value={filters.educationLevel}
              onChange={(value) => handleFilterChange("educationLevel", value)}
              placeholder="学历要求"
              allowClear
            >
              <Select.Option value="大专">大专</Select.Option>
              <Select.Option value="本科">本科</Select.Option>
              <Select.Option value="硕士">硕士</Select.Option>
              <Select.Option value="博士">博士</Select.Option>
            </Select>

            <Button
              type="link"
              className="self-center"
              onClick={() =>
                setFilters({
                  cityCode: "SH",
                  jobName: "",
                  category: "",
                  experience: "",
                  educationLevel: "",
                })
              }
            >
              清除筛选
            </Button>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="mx-auto max-w-7xl px-4 py-6" style={{ maxWidth: 1600 }}>
        <Row gutter={24}>
          {/* 左侧职位列表 */}
          <Col span={10}>
            <div
              className="rounded-xl bg-white/50 p-2 shadow-inner backdrop-blur-sm hide-scrollbar"
              style={{
                height: "calc(100vh - 180px)",
                overflowY: "auto",
                paddingRight: 10
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
                    onClick={() => setSelectedJob(job)}
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
                            style={{ fontSize: "16px" }}
                          >
                            {job.name}
                          </Title>
                          {job.is_urgent && (
                            <Tag color="red" className="mt-1">
                              急聘
                            </Tag>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Tag
                            bordered={false}
                            className="border-blue-200 bg-blue-50 text-blue-700"
                          >
                            {job.seniority}
                          </Tag>
                          <Tag
                            bordered={false}
                            className="border-purple-200 bg-purple-50 text-purple-700"
                          >
                            {job.education_requirement}
                          </Tag>
                          {job.recruitment !== "不限" && (
                            <Tag
                              bordered={false}
                              className="border-green-200 bg-green-50 text-green-700"
                            >
                              {job.recruitment}
                            </Tag>
                          )}
                          {job.political_status !== "不限" && (
                            <Tag
                              bordered={false}
                              className="border-yellow-200 bg-yellow-50 text-yellow-700"
                            >
                              {job.political_status}
                            </Tag>
                          )}
                          {job.major_requirement !== "不限" && (
                            <Tag
                              bordered={false}
                              className="border-pink-200 bg-pink-50 text-pink-700"
                            >
                              {job.major_requirement.split("，")[0] ?? ""}
                            </Tag>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <Progress
                          size="small"
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

                    <div className="mt-4 -mb-2 flex justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <TeamOutlined className="mr-1" />
                        <span>{job.sponsor}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
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
          <Col span={14}>
            <div
              className="rounded-xl bg-white/50 p-2 shadow-inner backdrop-blur-sm hide-scrollbar"
              style={{
                height: "calc(100vh - 180px)",
                overflowY: "auto",
                paddingLeft: 10
              }}
            >
              {selectedJob ? (
                <Card
                  className="rounded-xl border border-gray-200 shadow-md"
                  style={{ borderRadius: 12 }}
                >
                  <div className="mb-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <Title level={4} className="m-0 text-gray-800">
                          {selectedJob.name}
                        </Title>
                        <div className="mt-3 flex flex-wrap gap-6">
                          <div className="flex items-center">
                            <span className="text-gray-600">招聘人数:</span>
                            <span className="ml-2 font-semibold text-blue-600">
                              {selectedJob?.headcount}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">匹配度:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              93%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          color="primary"
                          variant="outlined"
                          size="middle"
                          icon={<StarOutlined />}
                          className="flex items-center"
                        >
                          收藏
                        </Button>
                        <Button
                          color="primary"
                          variant="filled"
                          size="middle"
                          icon={<PlusOutlined />}
                        >
                          添加对比
                        </Button>
                        <Button
                          size="middle"
                          color="primary"
                          variant="solid"
                          icon={<ShareAltOutlined />}
                        >
                          分享
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center rounded-lg bg-blue-50 p-3">
                        <EnvironmentOutlined className="mr-3 text-lg text-blue-500" />
                        <div>
                          <Text type="secondary" className="block text-xs">
                            工作地点
                          </Text>
                          <Text className="font-medium">
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
                          <Text className="font-medium">
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
                          <Text className="font-medium">
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
                          <Text className="font-medium">
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
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          岗位类别:
                        </Text>
                        <Text type="secondary">{selectedJob.category}</Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          岗位编号:
                        </Text>
                        <Text type="secondary">{selectedJob.No}</Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          主管单位:
                        </Text>
                        <Text type="secondary">{selectedJob.sponsor}</Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          用人单位:
                        </Text>
                        <Text type="secondary">{selectedJob.employer}</Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          岗位职责:
                        </Text>
                        <Text type="secondary" className="flex-1">
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
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          学位:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.degree_requirement}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          学历:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.education_requirement}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          经验:
                        </Text>
                        <Text type="secondary">{selectedJob.seniority}</Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          专业:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.major_requirement}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          是否应届:
                        </Text>
                        <Text type="secondary">{selectedJob.recruitment}</Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          政治面貌:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.political_status}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          最低合格分数线:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.qualified_score}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          户籍要求:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.residency_requirement}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          年龄上限:
                        </Text>
                        <Text type="secondary">{selectedJob.age_limit}</Text>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-6" />

                  <div className="mb-6">
                    <Title level={5} className="mb-4 text-gray-800">
                      其他信息
                    </Title>
                    <div className="space-y-3">
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          面试比例:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.interview_ratio}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          成绩比例:
                        </Text>
                        <Text type="secondary">{selectedJob.score_ratio}</Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          其他要求:
                        </Text>
                        <Text type="secondary" className="flex-1">
                          {selectedJob.other_requirement || "无"}
                        </Text>
                      </div>
                      <div className="flex">
                        <Text className="w-24 flex-shrink-0 text-gray-600">
                          注意事项:
                        </Text>
                        <Text type="secondary" className="flex-1">
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
    </div>
  );
}
