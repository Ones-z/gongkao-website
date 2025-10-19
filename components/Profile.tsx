// components/Profile.tsx
import queryService from "@/api/queryService.ts";
import userService from "@/api/userService";
import type { Majors, UserProfile } from "@/entity";
import { getUserInfoSync, useUserActions } from "@/store/userStore";
import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import {
  Button,
  Card,
  Cascader,
  Col,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
} from "antd";
import locale from "antd/locale/zh_CN";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { useEffect, useState } from "react";

dayjs.locale("zh-cn");

const { Title, Text } = Typography;
const { Option } = Select;

export default function ProfilePage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { uuid } = getUserInfoSync();
  const { updateUserInfo } = useUserActions();
  const [undergraduateMajors, setUndergraduateMajors] = useState<Majors[]>([]);
  const [postgraduateMajors, setPostgraduateMajors] = useState<Majors[]>([]);
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  // 获取用户详细信息
  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const res = await userService.getUserDetail(uuid);
      if (res.code === 0) {
        const userData = { ...res.data };
        // 转换日期格式
        if (userData.birth_date) {
          userData.birth_date = dayjs(userData.birth_date);
        }
        setUserInfo(userData);
        form.setFieldsValue(userData);
      }
    } catch (error) {
      message.error("获取用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  const processMajorsData = (majors: Majors[]): Majors[] => {
    return majors.map((major) => ({
      ...major,
      name: `${major.code} ${major.name}`,
      code: major.code,
      children: major.children ? processMajorsData(major.children) : undefined,
    }));
  };

  const fetchUndergraduateMajors = async () => {
    const res = await queryService.queryMajors("bachelor");
    const processedMajors = processMajorsData(res.data);
    setUndergraduateMajors(processedMajors);
  };

  const fetchPostgraduateMajors = async () => {
    const res = await queryService.queryMajors("master");
    const processedMajors = processMajorsData(res.data);
    setPostgraduateMajors(processedMajors);
  };

  useEffect(() => {
    fetchUserDetail();
    fetchUndergraduateMajors();
    fetchPostgraduateMajors();
  }, [uuid]);

  // 保存用户信息
  const handleSave = async (values: UserProfile) => {
    try {
      const formattedValues = { ...values };
      if (
        formattedValues.birth_date &&
        typeof formattedValues.birth_date === "object" &&
        "format" in formattedValues.birth_date
      ) {
        formattedValues.birth_date =
          formattedValues.birth_date.format("YYYY-MM-DD");
      }

      const res = await userService.createUser({
        ...userInfo,
        ...formattedValues,
        uuid,
      } as UserProfile);
      if (res.code === 0) {
        messageApi.success("保存成功");
        console.log("profile_finished");
        const info = { ...userInfo, profile_finished: true } as UserProfile;
        setUserInfo(info);
        // 更新全局状态
        updateUserInfo(info);
        setIsEditing(false);
        setShowRecommendModal(true);
      } else {
        messageApi.error("保存失败");
      }
    } catch (error) {
      messageApi.error("保存失败");
    }
  };

  // 取消编辑
  const handleCancel = () => {
    form.setFieldsValue(userInfo);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-blue-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <ConfigProvider locale={locale}>
        {contextHolder}
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <Title level={2} className="mb-2 text-gray-800">
              个人资料
            </Title>
            <Text className="text-gray-600">管理您的个人信息和偏好设置</Text>
          </div>

          <Card className="overflow-hidden rounded-2xl border-0 shadow-xl">
            <div className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
                <div>
                  <Title level={3} className="mb-2 text-white">
                    基本信息
                  </Title>
                  <Text className="text-blue-100">
                    请确保您的个人信息准确无误
                  </Text>
                </div>
                <div className="mt-4 md:mt-0">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => form.submit()}
                        className="border-none bg-green-500 hover:bg-green-600"
                      >
                        保存
                      </Button>
                      <Button
                        icon={<CloseOutlined />}
                        onClick={handleCancel}
                        className="border-none bg-white/20 text-white hover:bg-white/30"
                      >
                        取消
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      className="border-none bg-white/20 text-white hover:bg-white/30"
                    >
                      编辑资料
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              className="px-6 pb-6"
            >
              <Row gutter={[32, 0]}>
                <Col xs={24} md={12}>
                  <div className="mb-8">
                    <Title
                      level={4}
                      className="mb-6 border-b border-gray-200 pb-3 text-gray-800"
                    >
                      <span className="rounded-lg bg-blue-100 px-3 py-1 text-blue-800">
                        基本信息
                      </span>
                    </Title>

                    <Form.Item label="姓名" name="username">
                      <Input
                        placeholder="请输入姓名"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      />
                    </Form.Item>

                    <Form.Item
                      label="出生日期"
                      name="birth_date"
                      rules={[{ required: true, message: "请输入出生日期" }]}
                    >
                      <DatePicker
                        allowClear
                        placeholder="请选择出生日期"
                        disabled={!isEditing}
                        className={
                          isEditing ? "w-full border-blue-300" : "w-full"
                        }
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>

                    <Form.Item
                      label="性别"
                      name="gender"
                      rules={[{ required: true, message: "请选择性别" }]}
                    >
                      <Select
                        placeholder="请选择性别"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      >
                        <Option value="男">男</Option>
                        <Option value="女">女</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="政治面貌"
                      name="political_status"
                      rules={[{ required: true, message: "请选择政治面貌" }]}
                    >
                      <Select
                        placeholder="请选择政治面貌"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      >
                        <Option value="群众">群众</Option>
                        <Option value="共青团员">共青团员</Option>
                        <Option value="中共党员">中共党员</Option>
                        <Option value="民主党派">民主党派</Option>
                        <Option value="无党派人士">无党派人士</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="所在城市" name="city">
                      <Input
                        placeholder="请输入所在城市"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      />
                    </Form.Item>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div className="mb-8">
                    <Title
                      level={4}
                      className="mb-6 border-b border-gray-200 pb-3 text-gray-800"
                    >
                      <span className="rounded-lg bg-purple-100 px-3 py-1 text-purple-800">
                        教育背景
                      </span>
                    </Title>

                    <Form.Item
                      label="学历"
                      name="education_level"
                      rules={[{ required: true, message: "请选择学历" }]}
                    >
                      <Select
                        placeholder="请选择学历"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      >
                        <Option value="大专">大专</Option>
                        <Option value="本科">本科</Option>
                        <Option value="硕士研究生">硕士研究生</Option>
                        <Option value="博士研究生">博士研究生</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="学位"
                      name="degree_level"
                      rules={[{ required: true, message: "请选择学位" }]}
                    >
                      <Select
                        placeholder="请选择学位"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      >
                        <Option value="学士">学士</Option>
                        <Option value="硕士">硕士</Option>
                        <Option value="博士">博士</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="本科专业" name="bachelor_major">
                      <Cascader
                        allowClear
                        options={undergraduateMajors}
                        placeholder="请选择本科专业"
                        disabled={!isEditing}
                        showSearch
                        fieldNames={{
                          label: "name",
                          value: "code",
                          children: "children",
                        }}
                        displayRender={(label) => label.join(" - ")}
                        onChange={(value) => {
                          form.setFieldsValue({
                            education_level: "大学本科",
                            degree_level: "学士",
                          });
                        }}
                      />
                    </Form.Item>
                    <Form.Item label="研究生专业" name="master_major">
                      <Cascader
                        options={postgraduateMajors}
                        placeholder="请选择研究生专业"
                        disabled={!isEditing}
                        showSearch
                        fieldNames={{
                          label: "name",
                          value: "code",
                          children: "children",
                        }}
                        displayRender={(label) => label.join(" - ")}
                        onChange={(value) => {
                          form.setFieldsValue({
                            education_level: "研究生",
                            degree_level: "硕士",
                          });
                        }}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>

              <Row gutter={[32, 0]}>
                <Col xs={24} md={12}>
                  <div className="mb-8">
                    <Title
                      level={4}
                      className="mb-6 border-b border-gray-200 pb-3 text-gray-800"
                    >
                      <span className="rounded-lg bg-green-100 px-3 py-1 text-green-800">
                        工作经历
                      </span>
                    </Title>

                    <Form.Item
                      label="是否应届毕业生"
                      name="fresh_graduate"
                      rules={[
                        { required: true, message: "请选择是否应届毕业生" },
                      ]}
                    >
                      <Select
                        placeholder="请选择"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      >
                        <Option value="应届毕业生">应届毕业生</Option>
                        <Option value="非应届毕业生">非应届毕业生</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="服务基层工作经历"
                      name="grassroots_experience"
                    >
                      <Select
                        mode="multiple"
                        placeholder="请选择基层工作经历"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                        options={[
                          { value: "大学生村官", label: "大学生村官" },
                          { value: "三支一扶", label: "三支一扶" },
                          {
                            value: "大学生志愿服务西部计划",
                            label: "大学生志愿服务西部计划",
                          },
                          {
                            value:
                              "在军队服役5年（含）以上的高校毕业生退役士兵",
                            label:
                              "在军队服役5年（含）以上的高校毕业生退役士兵",
                          },
                          {
                            value: "农村义务教育阶段学校教师特设岗位计划",
                            label: "农村义务教育阶段学校教师特设岗位计划",
                          },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      label="基层工作年限"
                      name="seniority"
                      rules={[{ required: true, message: "请输入工作年限" }]}
                    >
                      <Input
                        type="number"
                        placeholder="请输入工作年限"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                        min={0}
                      />
                    </Form.Item>
                  </div>
                </Col>

                <Col xs={24} md={12}>
                  <div className="mb-8">
                    <Title
                      level={4}
                      className="mb-6 border-b border-gray-200 pb-3 text-gray-800"
                    >
                      <span className="rounded-lg bg-yellow-100 px-3 py-1 text-yellow-800">
                        其他信息
                      </span>
                    </Title>

                    <Form.Item label="通勤方式" name="commute_way">
                      <Select
                        placeholder="请选择通勤方式"
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      >
                        <Option value="自驾">自驾</Option>
                        <Option value="公交">公交</Option>
                        <Option value="打车">打车</Option>
                        <Option value="骑行">骑行</Option>
                        <Option value="步行">步行</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item label="详细地址" name="address">
                      <Input.TextArea
                        placeholder="请输入详细地址"
                        rows={3}
                        disabled={!isEditing}
                        className={isEditing ? "border-blue-300" : ""}
                      />
                    </Form.Item>
                  </div>
                </Col>
              </Row>

              {isEditing && (
                <div className="mt-8 flex justify-center border-t border-gray-200 pt-6">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 hover:from-blue-600 hover:to-indigo-700"
                  >
                    保存资料
                  </Button>
                  <Button
                    size="large"
                    className="ml-4 px-8"
                    onClick={handleCancel}
                  >
                    取消
                  </Button>
                </div>
              )}
            </Form>
          </Card>

          <div className="mt-10 text-center text-sm text-gray-500">
            <Text>© 2025 - 青云选岗平台. 保护您的个人信息安全</Text>
          </div>
        </div>
        {showRecommendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black transition-opacity duration-300"
              style={{ opacity: 0.6 }}
              onClick={() => setShowRecommendModal(false)}
            ></div>

            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
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
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>

                <h3 className="mb-2 text-xl font-bold text-gray-800 sm:mb-3 sm:text-2xl">
                  一键智能推荐
                </h3>
                <p className="mb-4 text-gray-600 sm:mb-6">
                  您的资料已保存成功！是否立即体验我们的智能岗位推荐功能？
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
                  <Button
                    size="large"
                    block
                    className="px-6 sm:w-auto"
                    onClick={() => setShowRecommendModal(false)}
                  >
                    稍后再说
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    block
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 sm:w-auto"
                    onClick={() => {
                      window.location.href = "/recommend-jobs";
                    }}
                  >
                    一键推荐
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ConfigProvider>
    </div>
  );
}
