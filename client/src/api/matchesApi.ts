import axiosInstance from './axiosInstance';
import type { Match, MatchPayload } from '../types';

export async function getAllMatches(): Promise<Match[]> {
  const { data } = await axiosInstance.get<Match[]>('/matches');
  return data;
}

export async function getMatchById(id: string): Promise<Match> {
  const { data } = await axiosInstance.get<Match>(`/matches/${id}`);
  return data;
}

export async function addMatch(
  payload: MatchPayload,
  adminKey?: string,
): Promise<Match> {
  void adminKey;
  const { data } = await axiosInstance.post<Match>('/matches', payload);
  return data;
}

export async function deleteMatch(
  id: string,
  adminKey?: string,
): Promise<void> {
  void adminKey;
  await axiosInstance.delete(`/matches/${id}`);
}

export async function updateMatch(
  id: string,
  payload: MatchPayload,
  adminKey?: string,
): Promise<Match> {
  void adminKey;
  const { data } = await axiosInstance.put<Match>(`/matches/${id}`, payload);
  return data;
}
