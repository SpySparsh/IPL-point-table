import axiosInstance from './axiosInstance';
import type { Team } from '../types';

export async function getTeams(): Promise<Team[]> {
  const { data } = await axiosInstance.get<Team[]>('/teams');
  return data;
}
