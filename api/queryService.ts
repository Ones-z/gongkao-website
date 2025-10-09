import type { Majors } from "@/entity";
import client from "./client";

export enum QueryApi {
  Majors = "/query/majors",
}

const queryMajors = (filterType: string) =>
  client.get<{ code: number; data: Majors[]; message: string }>({
    url: QueryApi.Majors,
    params: { filter_type:filterType },
  });
export default {
  queryMajors,
};
