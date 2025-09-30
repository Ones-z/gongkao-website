import type { Majors } from "@/entity";
import client from "./client";

export enum QueryApi {
  Majors = "/query/majors",
}

const queryMajors = () =>
  client.get<{ code: number; data: Majors[]; message: string }>({
    url: QueryApi.Majors,
  });
export default {
  queryMajors,
};
