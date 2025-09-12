import type { AlipayLoginCallbackData, UserInfo } from "@/entity";

import client from "./client";

export enum UserApi {
  AlipayAuthCallback = "/user/auth/alipay/callback",
  UserInfo = "/user/uuid/info",
  UuidCreate = "/user/uuid/create",
}

const loginByAlipay = (data: AlipayLoginCallbackData) =>
  client.post<{ code: number; data: number; message: string }>({
    url: UserApi.AlipayAuthCallback,
    data,
  });
const getUserInfo = (uuid: string | undefined, source: string | undefined) =>
  client.get<{ code: number; data: UserInfo; message: string }>({
    url: UserApi.UserInfo,
    params: { uuid, source },
  });
const createUuid = (data: UserInfo) =>
  client.post<{ code: number; data: number; message: string }>({
    url: UserApi.UuidCreate,
    data,
  });

export default {
  loginByAlipay,
  getUserInfo,
  createUuid,
};
