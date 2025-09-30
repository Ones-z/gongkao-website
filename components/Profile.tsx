// components/Profile.tsx
import userService from "@/api/userService";
import type { UserProfile } from "@/entity";
import { getUserInfoSync, useUserActions } from "@/store/userStore";
import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Select, Typography, message } from "antd";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { uuid } = getUserInfoSync();
  const { updateUserInfo } = useUserActions();

  // 获取用户详细信息
  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const res = await userService.getUserDetail(uuid);
      if (res.code === 0) {
        setUserInfo(res.data);
        form.setFieldsValue(res.data);
      }
    } catch (error) {
      message.error("获取用户信息失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [uuid]);

  // 保存用户信息
  const handleSave = async (values: UserProfile) => {
    try {
      const res = await userService.createUser({ ...userInfo, ...values, uuid } as UserProfile);
      if (res.code === 0) {
        messageApi.success("保存成功");
        console.log("profile_finished");
        const info = { ...userInfo, profile_finished: true } as UserProfile;
        setUserInfo(info);
        // 更新全局状态
        updateUserInfo(info);
        setIsEditing(false);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-blue-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      {contextHolder}
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <Title level={2} className="text-gray-800 mb-2">
            个人资料
          </Title>
          <Text className="text-gray-600">
            管理您的个人信息和偏好设置
          </Text>
        </div>

        <Card className="rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <Title level={3} className="text-white mb-2">
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
                      className="bg-green-500 hover:bg-green-600 border-none"
                    >
                      保存
                    </Button>
                    <Button
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
                      className="bg-white/20 text-white hover:bg-white/30 border-none"
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                    className="bg-white/20 text-white hover:bg-white/30 border-none"
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
                  <Title level={4} className="text-gray-800 border-b border-gray-200 pb-3 mb-6">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
                      基本信息
                    </span>
                  </Title>

                  <Form.Item
                    label="姓名"
                    name="username"
                  >
                    <Input
                      placeholder="请输入姓名"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    />
                  </Form.Item>

                  <Form.Item
                    label="出生日期"
                    name="birth_date"
                    rules={[{ required: true, message: '请输入出生日期' }]}
                  >
                    <Input
                      placeholder="例如：1990-01-01"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    />
                  </Form.Item>

                  <Form.Item
                    label="性别"
                    name="gender"
                    rules={[{ required: true, message: '请选择性别' }]}
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
                    rules={[{ required: true, message: '请选择政治面貌' }]}
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

                  <Form.Item
                    label="所在城市"
                    name="city"
                  >
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
                  <Title level={4} className="text-gray-800 border-b border-gray-200 pb-3 mb-6">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg">
                      教育背景
                    </span>
                  </Title>

                  <Form.Item
                    label="学历"
                    name="education_level"
                    rules={[{ required: true, message: '请选择学历' }]}
                  >
                    <Select
                      placeholder="请选择学历"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    >
                      <Option value="大学本科">大学本科</Option>
                      <Option value="研究生">研究生</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="学位"
                    name="degree_level"
                    rules={[{ required: true, message: '请选择学位' }]}
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

                  <Form.Item
                    label="本科专业代码"
                    name="undergraduate_major"
                    rules={[{ required: true, message: '请输入本科专业代码' }]}
                  >
                    <Input
                      placeholder="请输入本科专业代码"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    />
                  </Form.Item>

                  <Form.Item
                    label="本科专业名称"
                    name="undergraduate_major_name"
                    rules={[{ required: true, message: '请输入本科专业名称' }]}
                  >
                    <Input
                      placeholder="请输入本科专业名称"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    />
                  </Form.Item>
                  <Form.Item
                    label="研究生专业代码"
                    name="postgraduate_major"
                  >
                    <Input
                      placeholder="请输入研究生专业代码"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    />
                  </Form.Item>

                  <Form.Item
                    label="研究生专业名称"
                    name="postgraduate_major_name"
                  >
                    <Input
                      placeholder="请输入研究生专业名称"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    />
                  </Form.Item>
                </div>
              </Col>
            </Row>

            <Row gutter={[32, 0]}>
              <Col xs={24} md={12}>
                <div className="mb-8">
                  <Title level={4} className="text-gray-800 border-b border-gray-200 pb-3 mb-6">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg">
                      工作经历
                    </span>
                  </Title>

                  <Form.Item
                    label="是否应届毕业生"
                    name="fresh_graduate"
                    rules={[{ required: true, message: '请选择是否应届毕业生' }]}
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
                    label="基层工作经历"
                    name="grassroots_experience"
                  >
                    <Input
                      placeholder="请输入基层工作经历"
                      disabled={!isEditing}
                      className={isEditing ? "border-blue-300" : ""}
                    />
                  </Form.Item>

                  <Form.Item
                    label="工作年限"
                    name="seniority"
                    rules={[{ required: true, message: '请输入工作年限' }]}
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
                  <Title level={4} className="text-gray-800 border-b border-gray-200 pb-3 mb-6">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg">
                      其他信息
                    </span>
                  </Title>

                  <Form.Item
                    label="通勤方式"
                    name="commute_way"
                  >
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

                  <Form.Item
                    label="详细地址"
                    name="address"
                  >
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
              <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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

        <div className="mt-10 text-center text-gray-500 text-sm">
          <Text>© 2025 - 青云选岗平台. 保护您的个人信息安全</Text>
        </div>
      </div>
    </div>
  );
}
