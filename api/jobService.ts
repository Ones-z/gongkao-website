import type { Job, JobCollect, JobCompare, JobFilter, Recruitment } from "@/entity";
import client from "./client";

export enum JobApi {
  Jobs = "/job/list",
  JobDetail = "/job/detail",
  CollectJob = "/job/collect",
  UnCollectJob = "/job/unCollect",
  CollectJobs = "/job/collects",
  CompareJob = "/job/compare",
  UnCompareJob = "/job/unCompare",
  CompareJobs = "/job/compares",
  Recruitments = "/job/recruitments",
  Recruitment = "/job/recruitment",
  RecommendJobs = "/job/recommend",
}

const getJobs = (param: {
  city_code?: string;
  name: string;
  category?: string;
  experience?: string;
  education_level?: string;
  recruitment_id: string | null;
}) =>
  client.get<{ code: number; data: Job[]; total: number }>({
    url: JobApi.Jobs,
    params: param,
  });
const collectJob = (data: JobCollect) =>
  client.post<{ code: number; data: number; message: string }>({
    url: JobApi.CollectJob,
    data: data,
  });
const unCollectJob = (data: JobCollect) =>
  client.post<{ code: number; data: number; message: string }>({
    url: JobApi.UnCollectJob,
    data: data,
  });
const getCollectJobs = (uuid: string | undefined) =>
  client.get<{ code: number; data: Job[]; total: number }>({
    url: JobApi.CollectJobs,
    params: { uuid },
  });
const compareJob = (data: JobCompare) =>
  client.post<{ code: number; data: number; message: string }>({
    url: JobApi.CompareJob,
    data: data,
  });
const unCompareJob = (data: JobCompare) =>
  client.post<{ code: number; data: number; message: string }>({
    url: JobApi.UnCompareJob,
    data: data,
  });
const getCompareJobs = (uuid: string | undefined) =>
  client.get<{ code: number; data: Job[]; total: number }>({
    url: JobApi.CompareJobs,
    params: { uuid },
  });
const getJobDetail = (id: number) =>
  client.get<{ code: number; data: Job }>({
    url: JobApi.JobDetail,
    params: { id },
  });
const getRecruitments = (param: {
  category?: string;
  year?: string;
  province?: string;
  name?: string;
  pageSize: number;
  current: number;
}) =>
  client.get<{ code: number; data: Recruitment[]; total: number }>({
    url: JobApi.Recruitments,
    params: param,
  });
const getRecruitment = (id: string | null) =>
  client.get<{ code: number; data: Recruitment }>({
    url: JobApi.Recruitment,
    params: { id },
  });
const getRecommendJobs = (uuid: string | undefined) =>
  client.get<{ code: number; data: Job[]; total: number }>({
    url: JobApi.RecommendJobs,
    params: {uuid},
  });
export default {
  getJobs,
  collectJob,
  unCollectJob,
  getCollectJobs,
  compareJob,
  unCompareJob,
  getCompareJobs,
  getJobDetail,
  getRecruitments,
  getRecruitment,
  getRecommendJobs,
};
