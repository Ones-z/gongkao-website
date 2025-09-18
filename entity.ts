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

export interface UserProfile {
  id?: number;
  uuid: string;
  username?: string;
  birth_date: string;
  gender: string;
  political_status?: string;
  city?: string;
  education_level: string;
  degeree_level: string;
  undergraduate_major: string;
  undergraduate_major_name: string;
  postgraduate_major?: string;
  postgraduate_major_name?: string;
  fresh_graduate: string;
  grassroots_experience: string;
  seniority: number;
  work_experience?: string;
  address?: string;
  address_geo?: string;
  commute_way: string;
}

export interface JobFilter {
  city_code?: string;
  name: string;
  category?: string;
  experience?: string;
  education_level?: string;
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
  open_id?: string;
}

export interface OrderCreate {
  uuid?: string;
  goods_id: number;
  out_trade_no: string;
  total_amount: number;
  subject: string;
}

export interface OrderInfo {
  id: number;
  uuid: string;
  goods_id: number;
  trade_no: string;
  subject: string;
  product_code: string;
  trade_status: string;
  out_trade_no: string;
  total_amount: number;
  funds_bill_list: object[];
  buyer_user_id: string;
  send_pay_date: string;
  receipt_amount: number;
  ext_infos: string;
}
