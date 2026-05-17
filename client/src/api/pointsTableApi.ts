import axiosInstance from './axiosInstance';
import type { Standing } from '../types';

export async function getPointsTable(): Promise<Standing[]> {
  const { data } = await axiosInstance.get<Standing[]>('/points-table');
  return data;
}
