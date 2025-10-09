import type { Goods } from "@/entity";

import client from "./client";

export enum GoodsApi {
  List = "/goods/list",
}

const queryGoods = () =>
  client.get<{ code: number; data: Goods[]; message: string }>({
    url: GoodsApi.List,
  });
export default {
  queryGoods,
};
