import type { Coupon } from "@/entity";

import client from "./client";

export enum CouponApi {
  List = "/coupon/counts",
}

const queryCoupons = (uuid: string | undefined) =>
  client.get<{ code: number; data: Coupon[]; message: string }>({
    url: CouponApi.List,
    params: { uuid },
  });
export default {
  queryCoupons,
};
