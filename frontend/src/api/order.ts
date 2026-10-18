import axios from "axios";

import { api } from "./client";

import type {
  IApiResponse,
  ICreateOrderInput,
  IOrderApiResponse,
} from "../types";

export async function createOrder(
  payload: ICreateOrderInput,
  signal?: AbortSignal,
) {
  const response = await api.post<IApiResponse<IOrderApiResponse>>(
    "/orders",
    payload,
    { signal },
  );

  return response.data;
}

export async function getMyOrders(signal?: AbortSignal) {
  const response = await api.get<IApiResponse<IOrderApiResponse[]>>(
    "/orders/my",
    { signal },
  );

  return response.data;
}
