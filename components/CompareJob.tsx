// CompareJob.tsx (移动端样式优化版本)
import jobService from "@/api/jobService";
import type { Job } from "@/entity";
import { getUserInfoSync } from "@/store/userStore";
import {  StarFilled } from "@ant-design/icons";
import type { Translations } from "@gudupao/astro-i18n";
import { createClientTranslator } from "@gudupao/astro-i18n/client";
import {
  Button,
  Card,
  Col,
  Row,
  Table,
  Typography,
  message,
} from "antd";
import React, { useEffect, useState } from "react";

const { Text, Title } = Typography;

export default function CompareJobPage({
  translations,
}: {
  translations: Translations;
}) {
  const t = createClientTranslator(translations);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { uuid } = getUserInfoSync();
  const [isMobile, setIsMobile] = useState(false);

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
    fetchCompareJobs();
  }, []);

  const fetchCompareJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getCompareJobs(uuid);
      if (res.code === 0) {
        setJobs(res.data);
      } else {
        message.error("获取对比职位失败");
      }
    } catch (error) {
      message.error("获取对比职位失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId: number) => {
    try {
      const res = await jobService.unCompareJob({ uuid, job_id: jobId });
      if (res.code === 0) {
        message.success("已移除对比");
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      } else {
        message.error("移除失败");
      }
    } catch (error) {
      message.error("移除失败");
    }
  };

  // 构建对比表格数据
  const buildComparisonData = () => {
    if (jobs.length === 0) return [];

    const comparisonItems = [
      { key: "name", label: "职位名称", category: "基本信息" },
      { key: "sponsor", label: "主管单位", category: "基本信息" },
      { key: "employer", label: "用人单位", category: "基本信息" },
      { key: "city", label: "工作地点", category: "基本信息" },
      { key: "category", label: "岗位类别", category: "基本信息" },
      { key: "No", label: "岗位编号", category: "基本信息" },

      { key: "seniority", label: "经验要求", category: "任职要求" },
      { key: "education_requirement", label: "学历要求", category: "任职要求" },
      { key: "degree_requirement", label: "学位要求", category: "任职要求" },
      { key: "major_requirement", label: "专业要求", category: "任职要求" },
      { key: "political_status", label: "政治面貌", category: "任职要求" },
      { key: "recruitment", label: "是否应届", category: "任职要求" },
      { key: "age_limit", label: "年龄上限", category: "任职要求" },
      { key: "residency_requirement", label: "户籍要求", category: "任职要求" },

      { key: "headcount", label: "招聘人数", category: "招聘详情" },
      { key: "qualified_score", label: "最低合格分数线", category: "招聘详情" },
      { key: "interview_ratio", label: "面试比例", category: "招聘详情" },
      { key: "score_ratio", label: "成绩比例", category: "招聘详情" },

      { key: "duty", label: "岗位职责", category: "职位详情" },
      { key: "other_requirement", label: "其他要求", category: "职位详情" },
      { key: "notes", label: "注意事项", category: "职位详情" },
    ];

    // 按分类组织数据
    const categorizedData: any[] = [];
    let currentCategory = "";

    comparisonItems.forEach((item) => {
      if (item.category !== currentCategory) {
        currentCategory = item.category;
        categorizedData.push({
          key: `category-${item.category}`,
          property: item.category,
          isCategory: true,
        });
      }

      const data: any = {
        key: item.key,
        property: item.label,
      };

      jobs.forEach((job, index) => {
        data[`job${index}`] = job[item.key as keyof Job] || "-";
      });

      categorizedData.push(data);
    });

    return categorizedData;
  };

  // 表格列定义 - 桌面端
  const desktopColumns = [
    {
      title: "参数名称",
      dataIndex: "property",
      key: "property",
      width: 180,
      fixed: "left" as const,
      render: (text: string, record: any) =>
        record.isCategory ? (
          <strong
            style={{
              fontSize: "16px",
              color: "#ffffff",
              background: "#1890ff",
              padding: "12px",
              margin: "-12px",
              display: "block",
            }}
          >
            {text}
          </strong>
        ) : (
          <span style={{ paddingLeft: "20px", fontWeight: 500 }}>{text}</span>
        ),
    },
    ...jobs.map((job, index) => ({
      title: (
        <Card
          size="small"
          className="text-center"
          style={{
            width: 250,
            margin: "0 auto",
            border: "2px solid #1890ff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.2)",
            background: "linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)",
          }}
          styles={{ body: { padding: "16px" } }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "12px",
              color: "#1890ff",
              borderBottom: "1px solid #e8e8e8",
              paddingBottom: "8px",
            }}
          >
            {job.name}
          </div>
          <div style={{ fontSize: "14px", color: "#595959", marginBottom: "8px" }}>
            {job.employer}
          </div>
          <Button
            type="primary"
            danger
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove(job.id);
            }}
            style={{
              marginTop: "12px",
              fontWeight: "bold"
            }}
          >
            移除对比
          </Button>
        </Card>
      ),
      dataIndex: `job${index}`,
      key: `job${index}`,
      width: 280,
      render: (text: string, record: any) =>
        record.isCategory ? (
          <div
            style={{ background: "#f0f8ff", height: "100%", padding: "8px 0" }}
          />
        ) : (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              minHeight: 20,
              padding: "12px",
              lineHeight: 1.5,
              background: index % 2 === 0 ? "#fafafa" : "#ffffff",
              borderLeft: "1px solid #f0f0f0",
              borderRight: "1px solid #f0f0f0",
            }}
          >
            {text || "-"}
          </div>
        ),
    })),
  ];

  // 移动端专用列定义
  const mobileColumns = [
    {
      title: "参数",
      dataIndex: "property",
      key: "property",
      render: (text: string, record: any) =>
        record.isCategory ? (
          <strong
            style={{
              fontSize: "16px",
              color: "#ffffff",
              background: "#1890ff",
              padding: "12px 8px",
              display: "block",
              margin: "-16px -16px -16px -12px",
            }}
          >
            {text}
          </strong>
        ) : (
          <span style={{ fontWeight: 500 }}>{text}</span>
        ),
    },
    ...jobs.map((job, index) => ({
      title: (
        <div style={{ textAlign: "center", fontWeight: "bold", color: "#1890ff" }}>
          职位 {index + 1}
        </div>
      ),
      dataIndex: `job${index}`,
      key: `job${index}`,
      render: (text: string, record: any) =>
        record.isCategory ? (
          <div style={{ background: "#f0f8ff", height: "100%", padding: "8px 0" }} />
        ) : (
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              padding: "8px 0",
              lineHeight: 1.5,
              background: index % 2 === 0 ? "#fafafa" : "#ffffff",
            }}
          >
            {text || "-"}
          </div>
        ),
    })),
  ];

  // 为不同类别添加交替背景色
  const customizedRowClassName = (record: any, index: number) => {
    if (record.isCategory) {
      return 'category-row';
    }
    return index % 2 === 0 ? 'even-row' : 'odd-row';
  };

  return (
    <div className="mt-10 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 顶部标题区域 */}
      <div className="sticky top-0 z-10 border-b border-blue-200 bg-white/90 shadow-md backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="text-center">
            <Title level={isMobile ? 3 : 2} className="mb-2 text-blue-800">
              已选中的职位对比
            </Title>
            <Text className="text-blue-600 font-medium">
              对比 {jobs.length} 个职位的详细信息
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
              <StarFilled className="text-6xl text-blue-300" />
            </div>
            <Title level={4} className="mb-4 text-blue-500">
              暂无对比职位
            </Title>
            <Text className="mb-6 block text-blue-400">
              您还没有添加任何职位进行对比，快去职位页面选择职位吧
            </Text>
            <Button
              type="primary"
              size="large"
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #0050b3 100%)",
                borderColor: "#1890ff"
              }}
              onClick={() => window.location.replace("/job")}
            >
              浏览职位
            </Button>
          </div>
        ) : (
          <Card
            className="rounded-xl shadow-xl border-2 border-blue-100"
            styles={{ body: { padding: isMobile ? 0 : undefined } }}
          >
            {/* 移动端概览卡片 */}
            <div className="border-b border-blue-100 p-4 md:hidden">
              <Title level={5} className="mb-4 text-blue-800">
                职位概览
              </Title>
              <Row gutter={[16, 16]}>
                {jobs.map((job, index) => (
                  <Col span={12} key={job.id}>
                    <Card
                      size="small"
                      title={<span className="text-blue-700 font-bold">职位 {index + 1}</span>}
                      extra={
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() => handleRemove(job.id)}
                        >
                          移除
                        </Button>
                      }
                      style={{
                        border: "1px solid #1890ff",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(24, 144, 255, 0.15)"
                      }}
                    >
                      <div className="font-bold text-blue-600">{job.name}</div>
                      <div className="mt-1 text-sm text-gray-700">
                        {job.employer}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* 详细参数对比表格 */}
            <div className="overflow-x-auto">
              <Table
                dataSource={buildComparisonData()}
                columns={isMobile ? mobileColumns : desktopColumns}
                pagination={false}
                scroll={isMobile ? {} : { x: 800 + jobs.length * 280 }}
                sticky
                loading={loading}
                size={isMobile ? "small" : "middle"}
                showHeader={!isMobile}
                className="compare-table"
                rowClassName={customizedRowClassName}
                style={{ minWidth: isMobile ? "100%" : undefined }}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
