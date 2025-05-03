export interface AuthResponse {
  access: string;
  refresh: string;
  status: string;
  data: { userId: number; email: string; username: string; profile_pic_url: string };
}