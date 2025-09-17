import type { OrderCreate,OrderInfo } from "@/entity";

import client from "./client";

export enum OrderApi {
  OrderCreate = "/order/create",
  OrderQuery = "/order/query",
}

const orderCreate = (data: OrderCreate) =>
  client.post<{ code: number; data: string; message: string }>({
    url: OrderApi.OrderCreate,
    data,
  });
const orderQuery = ( out_trade_no: string ) =>
  client.get<{ code: number; data: OrderInfo; message: string }>({
    url: OrderApi.OrderQuery,
    params: { out_trade_no},
  });
export default {
  orderCreate,
  orderQuery,
};
