import type { Job, JobFilter } from "@/entity";
import client from "./client";

export enum JobApi {
  Jobs = "/job/list",
}

const getJobs = (param: JobFilter) =>
  client.get<{ code: number; data: Job[]; total: number }>({
    url: JobApi.Jobs,
    params: param,
  });

export default {
  getJobs,
};
