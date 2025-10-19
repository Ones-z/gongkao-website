import type { AlipayLoginCallbackData, UserInfo, UserProfile,Coupon } from "@/entity";

import client from "./client";

export enum UserApi {
  AlipayAuthCallback = "/user/auth/alipay/callback",
  UuidInfo = "/user/uuid/info",
  UuidCreate = "/user/uuid/create",
  PurchasePlan = "/user/purchase/plan",
  UserCreate = "/user/create",
  UserDetail = "/user/detail",
  UserCoupon = "/user/coupon/list",
}

const loginByAlipay = (data: AlipayLoginCallbackData) =>
  client.post<{ code: number; data: number | UserInfo; message: string }>({
    url: UserApi.AlipayAuthCallback,
    data,
  });
const getUuidInfo = (
  uuid?: string | undefined | null,
  open_id?: any,
  source?: any,
) =>
  client.get<{ code: number; data: UserInfo; message: string }>({
    url: UserApi.UuidInfo,
    params: { uuid, open_id, source },
  });
const createUuid = (data: UserInfo) =>
  client.post<{ code: number; data: number; message: string }>({
    url: UserApi.UuidCreate,
    data,
  });
const purchasePlan = (uuid: string | undefined) =>
  client.get<{ code: number; data: number; message: string }>({
    url: UserApi.PurchasePlan,
    params: { uuid },
  });
const createUser = (data: UserProfile) =>
  client.post<{ code: number; data: number; message: string }>({
    url: UserApi.UserCreate,
    data,
  });
const getUserDetail = (uuid: string | undefined) =>
  client.get<{ code: number; data: UserProfile; message: string }>({
    url: UserApi.UserDetail,
    params: { uuid },
  });
const getUserCoupon = (uuid: string | undefined) =>
  client.get<{ code: number; data: Coupon []; message: string }>({
    url: UserApi.UserCoupon,
    params: { uuid },
  });

export default {
  loginByAlipay,
  getUuidInfo,
  createUuid,
  purchasePlan,
  createUser,
  getUserDetail,
  getUserCoupon,
};
