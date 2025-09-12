// Job.tsx
import jobService from "@/api/jobService";
import userService from "@/api/userService";
import type { Job, JobFilter } from "@/entity";
import { useUserActions, isUserLoggedIn, getUserInfoSync } from "@/store/userStore";
import {
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
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
  Typography
} from "antd";
import type { ProgressProps } from "antd";
import { useCallback, useEffect, useState } from "react";

const { Text, Title } = Typography;
const conicColors: ProgressProps["strokeColor"] = {
  "0%": "#87d068",
  "25%": "#ffc069",
  "50%": "#ffe58f",
  "75%": "#ffe7ba",
  "100%": "#ffccc7"
};

export default function JobPage({
                                  translations
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
    educationLevel: ""
  });

  const generateUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function(c) {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
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
    const info = await userService.getUserInfo(uuid, source);
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
        if (res.data.length > 0 && !selectedJob) {
          setSelectedJob(res.data[0]);
        }
      } catch (error) {
        console.error("获取职位列表失败:", error);
      } finally {
        setLoading(false);
      }
    },
    [selectedJob]
  );
  useEffect(() => {
    checkLogin();
    onSearch({
      city_code: filters.cityCode,
      name: filters.jobName,
      category: filters.category,
      experience: filters.experience,
      education: filters.educationLevel
    });
  }, [filters, onSearch]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
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
    { value: "CD", label: "成都" }
  ];

  const categories = [
    { value: "技术", label: "技术" },
    { value: "产品", label: "产品" },
    { value: "设计", label: "设计" },
    { value: "运营", label: "运营" },
    { value: "市场", label: "市场" },
    { value: "人事", label: "人事" },
    { value: "财务", label: "财务" },
    { value: "行政", label: "行政" }
  ];

  return (
    <div className="mt-10 min-h-screen bg-gray-50">
      {/* 顶部搜索区域 */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6 flex justify-center">
            <Input
              placeholder="搜索职位、公司"
              size="large"
              style={{
                width: 600,
                borderRadius: 20,
                border: "1px solid #e5e5e5",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
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
                  education: filters.educationLevel
                })
              }
            />
          </div>

          {/* 筛选器 */}
          <div className="flex flex-wrap gap-3">
            <Select
              style={{ width: 100, height: 40, borderRadius: 20 }}
              value={filters.cityCode}
              prefix={<EnvironmentOutlined />}
              onChange={(value) => handleFilterChange("cityCode", value)}
              placeholder="城市"
            >
              {cities.map((city) => (
                <Select.Option key={city.value} value={city.value}>
                  {city.label}
                </Select.Option>
              ))}
            </Select>

            <Select
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
              onClick={() =>
                setFilters({
                  cityCode: "SH",
                  jobName: "",
                  category: "",
                  experience: "",
                  educationLevel: ""
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
              style={{
                height: "calc(100vh - 180px)",
                overflowY: "auto",
                paddingRight: 10
              }}
            >
              <List
                loading={{
                  spinning: loading,
                  tip: "职位加载中..."
                }}
                dataSource={jobs}
                renderItem={(job) => (
                  <Card
                    key={job.id}
                    hoverable
                    onClick={() => setSelectedJob(job)}
                    style={{
                      marginBottom: 12,
                      borderRadius: 8,
                      border:
                        selectedJob?.id === job.id
                          ? "1px solid #1890ff"
                          : "1px solid #f0f0f0",
                      boxShadow:
                        selectedJob?.id === job.id
                          ? "0 2px 8px rgba(24, 144, 255, 0.1)"
                          : "none"
                    }}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          <Title
                            level={5}
                            style={{ margin: 0, marginRight: 12 }}
                          >
                            {job.name}
                          </Title>
                          {job.is_urgent && <Tag color="red">急聘</Tag>}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-1">
                          <Tag bordered={false} style={{ fontSize: 14 }}>
                            {job.seniority}
                          </Tag>
                          <Tag bordered={false} style={{ fontSize: 14 }}>
                            {job.education_requirement}
                          </Tag>
                          {job.recruitment !== "不限" && (
                            <Tag bordered={false} style={{ fontSize: 14 }}>
                              {job.recruitment}
                            </Tag>
                          )}
                          {job.political_status !== "不限" && (
                            <Tag bordered={false} style={{ fontSize: 14 }}>
                              {job.political_status}
                            </Tag>
                          )}
                          {job.major_requirement !== "不限" && (
                            <Tag bordered={false} style={{ fontSize: 14 }}>
                              {job.major_requirement.split("、")[0] ?? ""}
                            </Tag>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress
                          size="small"
                          type="dashboard"
                          percent={93}
                          strokeColor={conicColors}
                        />
                      </div>
                    </div>

                    <div className="mt-3 -mb-3 flex justify-between">
                      <div>
                        <TeamOutlined style={{ color: "gray" }} />
                        <span className="ml-2">{job.sponsor}</span>
                      </div>
                      <div>
                        <EnvironmentOutlined style={{ color: "gray" }} />
                        <span className="ml-2">{job.city}</span>
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
              style={{
                height: "calc(100vh - 180px)",
                overflowY: "auto",
                paddingLeft: 10
              }}
            >
              {selectedJob ? (
                <Card style={{ borderRadius: 8 }}>
                  <div className="mb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <Title level={4} style={{ margin: 0 }}>
                          {selectedJob.name}
                        </Title>
                        <div className="mt-2 flex items-center">
                          <div>
                            <span className="text-black-800 text-sm">
                              招聘人数:
                            </span>
                            <span className="ml-5 text-sm text-red-800">
                              {selectedJob?.headcount}
                            </span>
                          </div>
                          <div className="ml-20">
                            <span className="text-black-800 text-sm">
                              匹配度:
                            </span>
                            <span className="ml-5 text-sm text-red-800">
                              {93}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Space>
                          <Button
                            color="cyan"
                            variant="outlined"
                            size="large"
                            icon={<StarOutlined />}
                          >
                            收藏
                          </Button>
                          <Button
                            color="cyan"
                            variant="filled"
                            size="large"
                            icon={<PlusOutlined />}
                            className="ml-3"
                          >
                            添加对比
                          </Button>
                          <Button
                            size="large"
                            color="cyan"
                            variant="solid"
                            icon={<ShareAltOutlined />}
                            className="ml-3"
                          >
                            分享
                          </Button>
                        </Space>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <EnvironmentOutlined className="mr-2 text-gray-400" />
                        <Text type="secondary">{selectedJob.city}</Text>
                      </div>
                      <div className="flex items-center">
                        <UserOutlined className="mr-2 text-gray-400" />
                        <Text type="secondary">{selectedJob.seniority}</Text>
                      </div>
                      <div className="flex items-center">
                        <DollarOutlined className="mr-2 text-gray-400" />
                        <Text type="secondary">
                          {selectedJob.education_requirement}
                        </Text>
                      </div>
                      <div className="flex items-center">
                        <ClockCircleOutlined className="mr-2 text-gray-400" />
                        <Text type="secondary">{selectedJob.publish_time}</Text>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div className="mb-6">
                    <Title level={5}>职位描述</Title>
                    <div className="mb-2 flex items-start">
                      <Text className="mr-2">岗位类别:</Text>
                      <Text type="secondary">{selectedJob.category}</Text>
                    </div>
                    <div className="mb-2 flex items-start">
                      <Text className="mr-2">岗位编号:</Text>
                      <Text type="secondary">{selectedJob.No}</Text>
                    </div>
                    <div className="mb-2 flex items-start">
                      <Text className="mr-2">主管单位:</Text>
                      <Text type="secondary">{selectedJob.sponsor}</Text>
                    </div>
                    <div className="mb-2 flex items-start">
                      <Text className="mr-2">用人单位:</Text>
                      <Text type="secondary">{selectedJob.employer}</Text>
                    </div>
                    <div className="mb-2 flex items-start">
                      <Text className="mr-2">岗位职责:</Text>
                      <Text type="secondary">{selectedJob.duty}</Text>
                    </div>
                  </div>

                  <Divider />

                  <div className="mb-6">
                    <Title level={5}>任职要求</Title>
                    <div className="mt-3">
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">学位:</Text>
                        <Text type="secondary">
                          {selectedJob.degree_requirement}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">学历:</Text>
                        <Text type="secondary">
                          {selectedJob.education_requirement}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">经验:</Text>
                        <Text type="secondary">{selectedJob.seniority}</Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">专业:</Text>
                        <Text type="secondary">
                          {selectedJob.major_requirement}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">是否应届:</Text>
                        <Text type="secondary">{selectedJob.recruitment}</Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">政治面貌:</Text>
                        <Text type="secondary">
                          {selectedJob.political_status}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">最低合格分数线:</Text>
                        <Text type="secondary">
                          {selectedJob.qualified_score}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">户籍要求:</Text>
                        <Text type="secondary">
                          {selectedJob.residency_requirement}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">年龄上限:</Text>
                        <Text type="secondary">{selectedJob.age_limit}</Text>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <div className="mb-6">
                    <Title level={5}>其他</Title>
                    <div className="mt-3">
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">面试比例:</Text>
                        <Text type="secondary">
                          {selectedJob.interview_ratio}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text className="mr-2">笔试面试成绩比例:</Text>
                        <Text type="secondary">{selectedJob.score_ratio}</Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text
                          className="mr-2"
                          style={{ width: 60, flexShrink: 0 }}
                        >
                          其他要求:
                        </Text>
                        <Text type="secondary">
                          {selectedJob.other_requirement}
                        </Text>
                      </div>
                      <div className="mb-2 flex items-start">
                        <Text
                          className="mr-2"
                          style={{ width: 60, flexShrink: 0 }}
                        >
                          注意事项:
                        </Text>
                        <Text type="secondary">{selectedJob.notes}</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card style={{ borderRadius: 8, textAlign: "center" }}>
                  <Text type="secondary">请选择一个职位查看详细信息</Text>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
