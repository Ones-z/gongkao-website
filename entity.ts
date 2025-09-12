export interface Job {
  id: number;
  name: string;
  No: string;
  gender: string;
  sponsor: string;
  employer_id: number;
  employer: string;
  duty: string;
  category: string;
  headcount: number;
  recruitment: string;
  seniority: string;
  political_status: string;
  age_limit: number;
  education_requirement: string;
  degree_requirement: string;
  major_requirement: string;
  residency_requirement: string;
  interview_ratio: string;
  qualified_score: string;
  score_ratio: string;
  other_requirement: string;
  notes: string;
  city: string;
  city_code: string;
  year: number;
  is_urgent: number;
  publish_time: string;
}

export interface JobFilter {
  city_code: string;
  name: string;
  category: string;
  experience: string;
  education: string;
}

export interface AlipayLoginCallbackData {
  app_id: string | null;
  auth_code: string | null;
  scope: string | null;
  uuid: string | null;
}

export interface UserInfo {
  id?: string;
  uuid: string;
  source?: string;
  user_name?: string;
  nick_name?: string;
  avatar?: string;
  gender?: string;
  province?: string;
  city?: string;
  status: string;
}
